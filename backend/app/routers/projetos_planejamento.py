"""
Router: Projetos de Planejamento

Endpoints para CRUD de projetos de planejamento.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.projeto_planejamento import ProjetoPlanejamento, StatusProjeto
from ..models.alocacao import Alocacao
from ..schemas.projeto_planejamento import (
    ProjetoPlanejamentoCreate,
    ProjetoPlanejamentoUpdate,
    ProjetoPlanejamentoResponse,
    ProjetoPlanejamentoListResponse,
)

router = APIRouter(
    prefix="/projetos-planejamento",
    tags=["Planejamento"],
)


@router.get("/", response_model=List[ProjetoPlanejamentoListResponse])
def list_projetos(
    empresa: Optional[str] = Query(None),
    cliente: Optional[str] = Query(None),
    categoria: Optional[str] = Query(None),
    status: Optional[StatusProjeto] = Query(None),
    db: Session = Depends(get_db),
):
    """Lista todos os projetos com filtros opcionais"""
    query = db.query(ProjetoPlanejamento)

    if empresa:
        query = query.filter(ProjetoPlanejamento.empresa == empresa)
    if cliente:
        query = query.filter(ProjetoPlanejamento.cliente == cliente)
    if categoria:
        query = query.filter(ProjetoPlanejamento.categoria == categoria)
    if status:
        query = query.filter(ProjetoPlanejamento.status == status)

    return query.order_by(ProjetoPlanejamento.data_inicio_prevista).all()


@router.get("/{projeto_id}/", response_model=ProjetoPlanejamentoResponse)
def get_projeto(projeto_id: int, db: Session = Depends(get_db)):
    """Retorna um projeto pelo ID"""
    projeto = db.query(ProjetoPlanejamento).filter(ProjetoPlanejamento.id == projeto_id).first()
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")
    return projeto


@router.post("/", response_model=ProjetoPlanejamentoResponse, status_code=201)
def create_projeto(projeto: ProjetoPlanejamentoCreate, db: Session = Depends(get_db)):
    """Cria um novo projeto"""
    # Verificar codigo unico
    existing = db.query(ProjetoPlanejamento).filter(ProjetoPlanejamento.codigo == projeto.codigo).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Ja existe projeto com codigo {projeto.codigo}")

    db_projeto = ProjetoPlanejamento(**projeto.model_dump())
    db.add(db_projeto)
    db.commit()
    db.refresh(db_projeto)
    return db_projeto


@router.put("/{projeto_id}/", response_model=ProjetoPlanejamentoResponse)
def update_projeto(
    projeto_id: int,
    projeto: ProjetoPlanejamentoUpdate,
    db: Session = Depends(get_db),
):
    """Atualiza um projeto existente"""
    db_projeto = db.query(ProjetoPlanejamento).filter(ProjetoPlanejamento.id == projeto_id).first()
    if not db_projeto:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")

    # Verificar codigo unico (se estiver sendo alterado)
    if projeto.codigo and projeto.codigo != db_projeto.codigo:
        existing = db.query(ProjetoPlanejamento).filter(ProjetoPlanejamento.codigo == projeto.codigo).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Ja existe projeto com codigo {projeto.codigo}")

    # Atualizar campos
    update_data = projeto.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_projeto, field, value)

    db.commit()
    db.refresh(db_projeto)
    return db_projeto


@router.delete("/{projeto_id}/", status_code=204)
def delete_projeto(projeto_id: int, db: Session = Depends(get_db)):
    """Remove um projeto"""
    db_projeto = db.query(ProjetoPlanejamento).filter(ProjetoPlanejamento.id == projeto_id).first()
    if not db_projeto:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")

    # Validar dependencias antes de deletar
    alocacao_count = db.query(Alocacao).filter(Alocacao.projeto_id == projeto_id).count()
    if alocacao_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Nao e possivel deletar projeto com {alocacao_count} alocacao(oes) vinculada(s). "
                   f"Remova as alocacoes antes de deletar o projeto."
        )

    db.delete(db_projeto)
    db.commit()
    return None


# ============ ENDPOINTS AUXILIARES ============

@router.get("/resumo/empresas/")
def get_resumo_empresas(db: Session = Depends(get_db)):
    """Retorna resumo de projetos por empresa"""
    from sqlalchemy import func

    resultados = (
        db.query(
            ProjetoPlanejamento.empresa,
            func.count(ProjetoPlanejamento.id).label("total_projetos"),
            func.sum(ProjetoPlanejamento.valor_estimado).label("valor_total"),
        )
        .group_by(ProjetoPlanejamento.empresa)
        .all()
    )

    return [
        {
            "empresa": r.empresa,
            "total_projetos": r.total_projetos,
            "valor_total": r.valor_total or 0,
        }
        for r in resultados
    ]


@router.get("/resumo/clientes/")
def get_resumo_clientes(db: Session = Depends(get_db)):
    """Retorna resumo de projetos por cliente"""
    from sqlalchemy import func

    resultados = (
        db.query(
            ProjetoPlanejamento.cliente,
            func.count(ProjetoPlanejamento.id).label("total_projetos"),
            func.sum(ProjetoPlanejamento.valor_estimado).label("valor_total"),
        )
        .group_by(ProjetoPlanejamento.cliente)
        .all()
    )

    return [
        {
            "cliente": r.cliente,
            "total_projetos": r.total_projetos,
            "valor_total": r.valor_total or 0,
        }
        for r in resultados
    ]


@router.get("/resumo/categorias/")
def get_resumo_categorias(db: Session = Depends(get_db)):
    """Retorna resumo de projetos por categoria"""
    from sqlalchemy import func

    resultados = (
        db.query(
            ProjetoPlanejamento.categoria,
            func.count(ProjetoPlanejamento.id).label("total_projetos"),
            func.sum(ProjetoPlanejamento.valor_estimado).label("valor_total"),
        )
        .group_by(ProjetoPlanejamento.categoria)
        .all()
    )

    return [
        {
            "categoria": r.categoria,
            "total_projetos": r.total_projetos,
            "valor_total": r.valor_total or 0,
        }
        for r in resultados
    ]


@router.get("/opcoes/empresas/")
def get_opcoes_empresas(db: Session = Depends(get_db)):
    """Retorna lista de empresas unicas"""
    resultados = db.query(ProjetoPlanejamento.empresa).distinct().all()
    return [r.empresa for r in resultados]


@router.get("/opcoes/clientes/")
def get_opcoes_clientes(db: Session = Depends(get_db)):
    """Retorna lista de clientes unicos"""
    resultados = db.query(ProjetoPlanejamento.cliente).distinct().all()
    return [r.cliente for r in resultados]


@router.get("/opcoes/categorias/")
def get_opcoes_categorias(db: Session = Depends(get_db)):
    """Retorna lista de categorias unicas"""
    resultados = db.query(ProjetoPlanejamento.categoria).distinct().all()
    return [r.categoria for r in resultados]
