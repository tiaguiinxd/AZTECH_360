"""
Endpoints de Versões do Organograma
Permite criar rascunhos, editar e aprovar mudanças no organograma.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import OrganoVersion, Colaborador
from ..schemas import (
    OrganoVersionCreate,
    OrganoVersionUpdate,
    OrganoVersionResponse,
    OrganoVersionListResponse,
)

router = APIRouter(prefix="/versions", tags=["Versões do Organograma"])


def get_current_snapshot(db: Session) -> list[dict]:
    """Gera snapshot atual dos colaboradores do banco"""
    colaboradores = db.query(Colaborador).all()
    return [
        {
            "id": c.id,
            "nome": c.nome,
            "cargo": c.cargo,
            "setor_id": c.setor_id,
            "subsetor_id": c.subsetor_id,
            "nivel_id": c.nivel_id,
            "subnivel_id": c.subnivel_id,
            "superior_id": c.superior_id,
            "permissoes": c.permissoes or [],
            "foto_url": c.foto_url,
            "email": c.email,
            "telefone": c.telefone,
        }
        for c in colaboradores
    ]


def calculate_changes(official: list[dict], draft: list[dict]) -> dict:
    """Calcula diferenças entre snapshot oficial e rascunho"""
    official_map = {c["id"]: c for c in official}
    draft_map = {c["id"]: c for c in draft}

    hierarchy_changes = []
    data_changes = []

    # Verificar mudanças em colaboradores existentes
    for colab_id, draft_colab in draft_map.items():
        if colab_id in official_map:
            official_colab = official_map[colab_id]

            # Mudança de hierarquia
            if draft_colab.get("superior_id") != official_colab.get("superior_id"):
                hierarchy_changes.append({
                    "colaborador_id": colab_id,
                    "colaborador_nome": draft_colab.get("nome", ""),
                    "change_type": "hierarchy",
                    "field": "superior_id",
                    "old_value": official_colab.get("superior_id"),
                    "new_value": draft_colab.get("superior_id"),
                })

            # Mudanças de dados
            for field in ["nome", "cargo", "setor_id", "nivel_id"]:
                if draft_colab.get(field) != official_colab.get(field):
                    data_changes.append({
                        "colaborador_id": colab_id,
                        "colaborador_nome": draft_colab.get("nome", ""),
                        "change_type": "data",
                        "field": field,
                        "old_value": official_colab.get(field),
                        "new_value": draft_colab.get(field),
                    })

    return {
        "total_changes": len(hierarchy_changes) + len(data_changes),
        "hierarchy_changes": hierarchy_changes,
        "data_changes": data_changes,
    }


@router.get("/", response_model=list[OrganoVersionListResponse])
def list_versions(db: Session = Depends(get_db)):
    """Lista todas as versões/rascunhos do organograma"""
    versions = db.query(OrganoVersion).order_by(OrganoVersion.updated_at.desc()).all()

    result = []
    for v in versions:
        changes_count = 0
        if v.changes_summary:
            changes_count = v.changes_summary.get("total_changes", 0)

        result.append({
            "id": v.id,
            "nome": v.nome,
            "descricao": v.descricao,
            "status": v.status,
            "changes_count": changes_count,
            "created_at": v.created_at,
            "updated_at": v.updated_at,
        })

    return result


@router.get("/current", response_model=OrganoVersionResponse)
def get_current_version(db: Session = Depends(get_db)):
    """
    Retorna snapshot da versão oficial atual (estado do banco).
    Útil para criar um rascunho baseado no estado atual.
    """
    snapshot = get_current_snapshot(db)
    return {
        "id": 0,
        "nome": "Versão Oficial",
        "descricao": "Estado atual do organograma",
        "status": "official",
        "snapshot": snapshot,
        "changes_summary": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "approved_at": None,
    }


@router.get("/{version_id}", response_model=OrganoVersionResponse)
def get_version(version_id: int, db: Session = Depends(get_db)):
    """Busca uma versão específica por ID"""
    version = db.query(OrganoVersion).filter(OrganoVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Versão não encontrada")
    return version


@router.post("/", response_model=OrganoVersionResponse, status_code=201)
def create_version(version_data: OrganoVersionCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova versão/rascunho baseado no estado atual do banco.
    O snapshot é copiado automaticamente do estado oficial.
    """
    # Criar snapshot do estado atual
    snapshot = get_current_snapshot(db)

    db_version = OrganoVersion(
        nome=version_data.nome,
        descricao=version_data.descricao,
        status="draft",
        snapshot=snapshot,
        changes_summary={"total_changes": 0, "hierarchy_changes": [], "data_changes": []},
    )

    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version


@router.put("/{version_id}", response_model=OrganoVersionResponse)
def update_version(
    version_id: int,
    version_data: OrganoVersionUpdate,
    db: Session = Depends(get_db),
):
    """
    Atualiza uma versão/rascunho.
    Permite atualizar nome, descrição e snapshot (mudanças no organograma).
    """
    db_version = db.query(OrganoVersion).filter(OrganoVersion.id == version_id).first()
    if not db_version:
        raise HTTPException(status_code=404, detail="Versão não encontrada")

    if db_version.status == "approved":
        raise HTTPException(
            status_code=400,
            detail="Não é possível editar uma versão já aprovada"
        )

    # Atualizar campos básicos
    if version_data.nome is not None:
        db_version.nome = version_data.nome
    if version_data.descricao is not None:
        db_version.descricao = version_data.descricao

    # Se snapshot foi atualizado, recalcular mudanças
    if version_data.snapshot is not None:
        new_snapshot = [s.model_dump() for s in version_data.snapshot]
        db_version.snapshot = new_snapshot

        # Calcular diff em relação ao estado oficial atual
        official_snapshot = get_current_snapshot(db)
        db_version.changes_summary = calculate_changes(official_snapshot, new_snapshot)

    db_version.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(db_version)
    return db_version


@router.post("/{version_id}/approve", response_model=OrganoVersionResponse)
def approve_version(version_id: int, db: Session = Depends(get_db)):
    """
    Aprova uma versão, tornando-a oficial.
    Aplica todas as mudanças do snapshot ao banco de colaboradores.
    """
    db_version = db.query(OrganoVersion).filter(OrganoVersion.id == version_id).first()
    if not db_version:
        raise HTTPException(status_code=404, detail="Versão não encontrada")

    if db_version.status == "approved":
        raise HTTPException(status_code=400, detail="Versão já foi aprovada")

    if db_version.status == "archived":
        raise HTTPException(status_code=400, detail="Não é possível aprovar versão arquivada")

    # Aplicar mudanças ao banco
    for colab_data in db_version.snapshot:
        db_colab = db.query(Colaborador).filter(Colaborador.id == colab_data["id"]).first()
        if db_colab:
            db_colab.nome = colab_data.get("nome", db_colab.nome)
            db_colab.cargo = colab_data.get("cargo", db_colab.cargo)
            db_colab.setor_id = colab_data.get("setor_id", db_colab.setor_id)
            db_colab.subsetor_id = colab_data.get("subsetor_id", db_colab.subsetor_id)
            db_colab.nivel_id = colab_data.get("nivel_id", db_colab.nivel_id)
            db_colab.subnivel_id = colab_data.get("subnivel_id", db_colab.subnivel_id)
            db_colab.superior_id = colab_data.get("superior_id")

    # Marcar versão como aprovada
    db_version.status = "approved"
    db_version.approved_at = datetime.utcnow()

    db.commit()
    db.refresh(db_version)
    return db_version


@router.delete("/{version_id}", status_code=204)
def delete_version(version_id: int, db: Session = Depends(get_db)):
    """Remove uma versão/rascunho"""
    db_version = db.query(OrganoVersion).filter(OrganoVersion.id == version_id).first()
    if not db_version:
        raise HTTPException(status_code=404, detail="Versão não encontrada")

    if db_version.status == "approved":
        raise HTTPException(
            status_code=400,
            detail="Não é possível deletar uma versão aprovada. Use arquivar."
        )

    db.delete(db_version)
    db.commit()


@router.post("/{version_id}/archive", response_model=OrganoVersionResponse)
def archive_version(version_id: int, db: Session = Depends(get_db)):
    """Arquiva uma versão (não pode mais ser editada ou aprovada)"""
    db_version = db.query(OrganoVersion).filter(OrganoVersion.id == version_id).first()
    if not db_version:
        raise HTTPException(status_code=404, detail="Versão não encontrada")

    db_version.status = "archived"
    db_version.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(db_version)
    return db_version
