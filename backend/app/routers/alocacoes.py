"""
Router: Alocacoes

Endpoints para CRUD de alocacoes e dashboard.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from ..database import get_db
from ..models.alocacao import Alocacao, StatusAlocacao as ModelStatusAlocacao
from ..models.colaborador import Colaborador
from ..models.projeto_planejamento import ProjetoPlanejamento, StatusProjeto
from ..models.setor import Setor
from ..schemas.alocacao import (
    AlocacaoCreate,
    AlocacaoUpdate,
    AlocacaoResponse,
    AlocacaoComDetalhes,
    ResumoGeralDashboard,
    ResumoEmpresaDashboard,
    TimelineItemDashboard,
    DisponibilidadeColaborador,
    SobrecargaMensal,
    StatusAlocacao,
)

router = APIRouter(
    prefix="/alocacoes",
    tags=["Alocacoes"],
)

# ============ CONSTANTES ============

# Limite maximo de projetos simultaneos por setor
LIMITE_PROJETOS_POR_SETOR = {
    "Comercial": 10,
    "Engenharia": 3,
    "Suprimentos": 10,  # "Compras"
    # Setores tipo "Assistentes" (Staff, RH, P&D, Manutencao, etc.)
    "default": 8
}

# ============ FUNCOES AUXILIARES ============

def _validar_limite_projetos(colaborador_id: int, db: Session) -> None:
    """
    Valida se colaborador pode ser alocado em mais um projeto.
    Lanca HTTPException 400 se exceder o limite do setor.
    """
    # Buscar colaborador e seu setor
    colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not colaborador:
        raise HTTPException(status_code=400, detail="Colaborador nao encontrado")

    setor = db.query(Setor).filter(Setor.id == colaborador.setor_id).first()
    if not setor:
        raise HTTPException(status_code=400, detail="Setor do colaborador nao encontrado")

    # Determinar limite baseado no setor (case-insensitive e sem espacos)
    nome_setor_normalizado = setor.nome.strip().title()
    limite = LIMITE_PROJETOS_POR_SETOR.get(nome_setor_normalizado, LIMITE_PROJETOS_POR_SETOR["default"])

    # Contar projetos ATIVOS (distintos) do colaborador
    projetos_ativos = (
        db.query(func.count(func.distinct(Alocacao.projeto_id)))
        .filter(
            Alocacao.colaborador_id == colaborador_id,
            Alocacao.status == ModelStatusAlocacao.ATIVA,
        )
        .scalar() or 0
    )

    # Validar limite
    if projetos_ativos >= limite:
        raise HTTPException(
            status_code=400,
            detail=f"{colaborador.nome} ({setor.nome}) ja possui {projetos_ativos} projetos ativos. Limite: {limite} projetos simultaneos."
        )

# ============ CRUD BASICO ============

@router.get("/", response_model=List[AlocacaoComDetalhes])
def list_alocacoes(
    projeto_id: Optional[int] = Query(None),
    colaborador_id: Optional[int] = Query(None),
    status: Optional[StatusAlocacao] = Query(None),
    db: Session = Depends(get_db),
):
    """Lista alocacoes com filtros"""
    query = (
        db.query(
            Alocacao,
            Colaborador.nome.label("colaborador_nome"),
            Colaborador.cargo.label("colaborador_cargo"),
            ProjetoPlanejamento.codigo.label("projeto_codigo"),
            ProjetoPlanejamento.nome.label("projeto_nome"),
            ProjetoPlanejamento.empresa.label("projeto_empresa"),
        )
        .join(Colaborador, Alocacao.colaborador_id == Colaborador.id)
        .join(ProjetoPlanejamento, Alocacao.projeto_id == ProjetoPlanejamento.id)
    )

    if projeto_id:
        query = query.filter(Alocacao.projeto_id == projeto_id)
    if colaborador_id:
        query = query.filter(Alocacao.colaborador_id == colaborador_id)
    if status:
        query = query.filter(Alocacao.status == status.value)

    results = query.all()

    return [
        AlocacaoComDetalhes(
            id=r.Alocacao.id,
            colaborador_id=r.Alocacao.colaborador_id,
            projeto_id=r.Alocacao.projeto_id,
            funcao=r.Alocacao.funcao,
            data_inicio=r.Alocacao.data_inicio,
            data_fim=r.Alocacao.data_fim,
            horas_semanais=r.Alocacao.horas_semanais,
            percentual_dedicacao=r.Alocacao.percentual_dedicacao,
            status=r.Alocacao.status,
            observacoes=r.Alocacao.observacoes,
            created_at=r.Alocacao.created_at,
            updated_at=r.Alocacao.updated_at,
            colaborador_nome=r.colaborador_nome,
            colaborador_cargo=r.colaborador_cargo,
            projeto_codigo=r.projeto_codigo,
            projeto_nome=r.projeto_nome,
            projeto_empresa=r.projeto_empresa,
        )
        for r in results
    ]


@router.post("/", response_model=AlocacaoResponse, status_code=201)
def create_alocacao(alocacao: AlocacaoCreate, db: Session = Depends(get_db)):
    """Cria uma nova alocacao"""
    # Validar colaborador
    colaborador = db.query(Colaborador).filter(Colaborador.id == alocacao.colaborador_id).first()
    if not colaborador:
        raise HTTPException(status_code=400, detail="Colaborador nao encontrado")

    # Validar projeto
    projeto = db.query(ProjetoPlanejamento).filter(ProjetoPlanejamento.id == alocacao.projeto_id).first()
    if not projeto:
        raise HTTPException(status_code=400, detail="Projeto nao encontrado")

    # Verificar se ja existe alocacao ativa do colaborador no projeto
    existing = (
        db.query(Alocacao)
        .filter(
            Alocacao.colaborador_id == alocacao.colaborador_id,
            Alocacao.projeto_id == alocacao.projeto_id,
            Alocacao.status == ModelStatusAlocacao.ATIVA,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Colaborador ja possui alocacao ativa neste projeto"
        )

    # Validar limite de projetos simultaneos por setor
    _validar_limite_projetos(alocacao.colaborador_id, db)

    db_alocacao = Alocacao(**alocacao.model_dump())
    db.add(db_alocacao)
    db.commit()
    db.refresh(db_alocacao)
    return db_alocacao


@router.get("/{alocacao_id}/", response_model=AlocacaoResponse)
def get_alocacao(alocacao_id: int, db: Session = Depends(get_db)):
    """Busca uma alocacao por ID"""
    db_alocacao = db.query(Alocacao).filter(Alocacao.id == alocacao_id).first()
    if not db_alocacao:
        raise HTTPException(status_code=404, detail="Alocacao nao encontrada")
    return db_alocacao


@router.put("/{alocacao_id}/", response_model=AlocacaoResponse)
def update_alocacao(
    alocacao_id: int,
    alocacao: AlocacaoUpdate,
    db: Session = Depends(get_db),
):
    """Atualiza uma alocacao"""
    db_alocacao = db.query(Alocacao).filter(Alocacao.id == alocacao_id).first()
    if not db_alocacao:
        raise HTTPException(status_code=404, detail="Alocacao nao encontrada")

    update_data = alocacao.model_dump(exclude_unset=True)

    # SE esta mudando status para ATIVA, validar limite
    if "status" in update_data and update_data["status"] == ModelStatusAlocacao.ATIVA:
        if db_alocacao.status != ModelStatusAlocacao.ATIVA:  # Nao estava ativa antes
            _validar_limite_projetos(db_alocacao.colaborador_id, db)

    for field, value in update_data.items():
        setattr(db_alocacao, field, value)

    db.commit()
    db.refresh(db_alocacao)
    return db_alocacao


@router.delete("/{alocacao_id}/", status_code=204)
def delete_alocacao(alocacao_id: int, db: Session = Depends(get_db)):
    """Remove uma alocacao"""
    db_alocacao = db.query(Alocacao).filter(Alocacao.id == alocacao_id).first()
    if not db_alocacao:
        raise HTTPException(status_code=404, detail="Alocacao nao encontrada")

    db.delete(db_alocacao)
    db.commit()
    return None


# ============ ENDPOINTS DE DASHBOARD ============

@router.get("/dashboard/resumo-geral/", response_model=ResumoGeralDashboard)
def get_resumo_geral(db: Session = Depends(get_db)):
    """Retorna resumo geral para o dashboard"""
    # Projetos
    total_projetos = db.query(ProjetoPlanejamento).count()
    projetos_andamento = db.query(ProjetoPlanejamento).filter(
        ProjetoPlanejamento.status == StatusProjeto.EM_ANDAMENTO
    ).count()
    projetos_planejados = db.query(ProjetoPlanejamento).filter(
        ProjetoPlanejamento.status == StatusProjeto.PLANEJADO
    ).count()
    projetos_concluidos = db.query(ProjetoPlanejamento).filter(
        ProjetoPlanejamento.status == StatusProjeto.CONCLUIDO
    ).count()

    # Valor total
    valor_total = db.query(func.sum(ProjetoPlanejamento.valor_estimado)).scalar() or 0

    # Colaboradores
    total_colaboradores = db.query(Colaborador).count()
    colaboradores_alocados = (
        db.query(func.count(func.distinct(Alocacao.colaborador_id)))
        .filter(Alocacao.status == ModelStatusAlocacao.ATIVA)
        .scalar() or 0
    )

    percentual_equipe = (colaboradores_alocados / total_colaboradores * 100) if total_colaboradores > 0 else 0

    return ResumoGeralDashboard(
        total_projetos=total_projetos,
        projetos_em_andamento=projetos_andamento,
        projetos_planejados=projetos_planejados,
        projetos_concluidos=projetos_concluidos,
        valor_total_carteira=valor_total,
        total_colaboradores_alocados=colaboradores_alocados,
        percentual_equipe_alocada=round(percentual_equipe, 1),
    )


@router.get("/dashboard/resumo-empresas/", response_model=List[ResumoEmpresaDashboard])
def get_resumo_empresas(db: Session = Depends(get_db)):
    """Retorna resumo por empresa"""
    empresas = db.query(ProjetoPlanejamento.empresa).distinct().all()

    result = []
    for (empresa,) in empresas:
        projetos_empresa = db.query(ProjetoPlanejamento).filter(
            ProjetoPlanejamento.empresa == empresa
        )

        total = projetos_empresa.count()
        em_andamento = projetos_empresa.filter(
            ProjetoPlanejamento.status == StatusProjeto.EM_ANDAMENTO
        ).count()
        concluidos = projetos_empresa.filter(
            ProjetoPlanejamento.status == StatusProjeto.CONCLUIDO
        ).count()

        valor = (
            db.query(func.sum(ProjetoPlanejamento.valor_estimado))
            .filter(ProjetoPlanejamento.empresa == empresa)
            .scalar() or 0
        )

        # Colaboradores alocados em projetos desta empresa
        projeto_ids = [p.id for p in projetos_empresa.all()]
        alocados = (
            db.query(func.count(func.distinct(Alocacao.colaborador_id)))
            .filter(
                Alocacao.projeto_id.in_(projeto_ids),
                Alocacao.status == ModelStatusAlocacao.ATIVA,
            )
            .scalar() or 0
        ) if projeto_ids else 0

        result.append(ResumoEmpresaDashboard(
            empresa=empresa,
            total_projetos=total,
            projetos_em_andamento=em_andamento,
            projetos_concluidos=concluidos,
            valor_total=valor,
            colaboradores_alocados=alocados,
        ))

    return result


@router.get("/dashboard/timeline/", response_model=List[TimelineItemDashboard])
def get_timeline(
    ano: Optional[int] = Query(None),
    empresa: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Retorna projetos para visualizacao em timeline/Gantt"""
    query = db.query(ProjetoPlanejamento)

    if empresa:
        query = query.filter(ProjetoPlanejamento.empresa == empresa)

    if ano:
        from datetime import datetime
        inicio_ano = datetime(ano, 1, 1)
        fim_ano = datetime(ano, 12, 31, 23, 59, 59)
        query = query.filter(
            (ProjetoPlanejamento.data_inicio_prevista >= inicio_ano) |
            (ProjetoPlanejamento.data_fim_prevista <= fim_ano) |
            ((ProjetoPlanejamento.data_inicio_prevista < inicio_ano) &
             (ProjetoPlanejamento.data_fim_prevista > fim_ano))
        )

    projetos = query.order_by(ProjetoPlanejamento.data_inicio_prevista).all()

    result = []
    for p in projetos:
        alocados = (
            db.query(func.count(Alocacao.id))
            .filter(
                Alocacao.projeto_id == p.id,
                Alocacao.status == ModelStatusAlocacao.ATIVA,
            )
            .scalar() or 0
        )

        result.append(TimelineItemDashboard(
            projeto_id=p.id,
            codigo=p.codigo,
            nome=p.nome,
            empresa=p.empresa,
            categoria=p.categoria,
            data_inicio=p.data_inicio_prevista,
            data_fim=p.data_fim_prevista,
            status=p.status.value,
            percentual_conclusao=p.percentual_conclusao,
            total_alocados=alocados,
        ))

    return result


@router.get("/dashboard/disponibilidade/", response_model=List[DisponibilidadeColaborador])
def get_disponibilidade(
    setor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Retorna disponibilidade de colaboradores"""
    query = db.query(Colaborador)

    if setor_id:
        query = query.filter(Colaborador.setor_id == setor_id)

    colaboradores = query.all()

    result = []
    for c in colaboradores:
        # Calcular percentual ocupado
        alocacoes_ativas = (
            db.query(Alocacao)
            .filter(
                Alocacao.colaborador_id == c.id,
                Alocacao.status == ModelStatusAlocacao.ATIVA,
            )
            .all()
        )

        percentual_total = sum(a.percentual_dedicacao for a in alocacoes_ativas)
        projetos_ativos = len(alocacoes_ativas)

        # Buscar nome do setor
        setor = db.query(Setor).filter(Setor.id == c.setor_id).first()

        result.append(DisponibilidadeColaborador(
            colaborador_id=c.id,
            nome=c.nome,
            cargo=c.cargo,
            setor=setor.nome if setor else "N/A",
            percentual_ocupado=min(percentual_total, 100),
            projetos_ativos=projetos_ativos,
            disponivel=percentual_total < 100,
        ))

    return sorted(result, key=lambda x: x.percentual_ocupado, reverse=True)


@router.get("/dashboard/sobrecarga-temporal/", response_model=List[SobrecargaMensal])
def get_sobrecarga_temporal(
    ano: int = Query(2026),
    db: Session = Depends(get_db),
):
    """
    Retorna sobrecarga temporal mensal (ocupacao da equipe ao longo dos meses).
    Para cada mes do ano, calcula quantas pessoas estao alocadas e o percentual medio de ocupacao.
    """
    from datetime import datetime, timedelta

    MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    result = []

    for mes in range(1, 13):
        # Data inicio e fim do mes
        inicio_mes = datetime(ano, mes, 1)
        if mes == 12:
            fim_mes = datetime(ano + 1, 1, 1) - timedelta(days=1)
        else:
            fim_mes = datetime(ano, mes + 1, 1) - timedelta(days=1)

        # Buscar alocacoes ativas neste mes
        alocacoes = (
            db.query(Alocacao)
            .filter(
                Alocacao.data_inicio <= fim_mes,
                or_(
                    Alocacao.data_fim.is_(None),
                    Alocacao.data_fim >= inicio_mes
                ),
            )
            .all()
        )

        # Calcular metricas
        colaboradores_unicos = set(a.colaborador_id for a in alocacoes)
        total_pessoas = len(colaboradores_unicos)
        total_alocacoes = len(alocacoes)

        # Calcular percentual medio de ocupacao
        # Soma os percentuais de TODOS os colaboradores da empresa e divide pelo total
        # Isso garante que colaboradores sem alocacao sejam contados como 0%
        total_colaboradores = db.query(Colaborador).count()

        if total_colaboradores > 0:
            ocupacao_por_colab = {}
            for a in alocacoes:
                if a.colaborador_id not in ocupacao_por_colab:
                    ocupacao_por_colab[a.colaborador_id] = 0
                ocupacao_por_colab[a.colaborador_id] += a.percentual_dedicacao

            # Media considerando TODOS os colaboradores da empresa
            percentual_ocupacao = sum(ocupacao_por_colab.values()) / total_colaboradores
        else:
            percentual_ocupacao = 0.0

        result.append(SobrecargaMensal(
            mes=mes,
            nome_mes=MESES[mes - 1],
            total_alocacoes=total_alocacoes,
            total_pessoas=total_pessoas,
            percentual_ocupacao=round(percentual_ocupacao, 1),
            sobrecarga=percentual_ocupacao > 100,
        ))

    return result
