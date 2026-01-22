"""
Endpoints de Níveis Hierárquicos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import NivelHierarquico, Subnivel
from ..schemas import NivelCreate, NivelUpdate, NivelResponse, SubnivelResponse

router = APIRouter(prefix="/niveis", tags=["Níveis Hierárquicos"])


@router.get("/", response_model=list[NivelResponse])
def list_niveis(db: Session = Depends(get_db)):
    """Lista todos os níveis hierárquicos"""
    return db.query(NivelHierarquico).order_by(NivelHierarquico.ordem).all()


@router.get("/{nivel_id}", response_model=NivelResponse)
def get_nivel(nivel_id: int, db: Session = Depends(get_db)):
    """Busca um nível por ID"""
    nivel = db.query(NivelHierarquico).filter(NivelHierarquico.id == nivel_id).first()
    if not nivel:
        raise HTTPException(status_code=404, detail="Nível não encontrado")
    return nivel


@router.post("/", response_model=NivelResponse, status_code=201)
def create_nivel(nivel: NivelCreate, db: Session = Depends(get_db)):
    """Cria um novo nível"""
    db_nivel = NivelHierarquico(**nivel.model_dump())
    db.add(db_nivel)
    db.commit()
    db.refresh(db_nivel)
    return db_nivel


@router.put("/{nivel_id}", response_model=NivelResponse)
def update_nivel(nivel_id: int, nivel: NivelUpdate, db: Session = Depends(get_db)):
    """Atualiza um nível"""
    db_nivel = db.query(NivelHierarquico).filter(NivelHierarquico.id == nivel_id).first()
    if not db_nivel:
        raise HTTPException(status_code=404, detail="Nível não encontrado")

    update_data = nivel.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_nivel, field, value)

    db.commit()
    db.refresh(db_nivel)
    return db_nivel


@router.delete("/{nivel_id}", status_code=204)
def delete_nivel(nivel_id: int, db: Session = Depends(get_db)):
    """Remove um nível"""
    db_nivel = db.query(NivelHierarquico).filter(NivelHierarquico.id == nivel_id).first()
    if not db_nivel:
        raise HTTPException(status_code=404, detail="Nível não encontrado")

    db.delete(db_nivel)
    db.commit()


# Reordenação
class ReorderRequest(BaseModel):
    """Request para reordenar níveis"""
    ordered_ids: list[int]


@router.patch("/reorder/", status_code=200)
def reorder_niveis(request: ReorderRequest, db: Session = Depends(get_db)):
    """Reordena níveis hierárquicos"""
    # Validar que todos os IDs existem
    niveis_existentes = db.query(NivelHierarquico.id).filter(
        NivelHierarquico.id.in_(request.ordered_ids)
    ).all()
    niveis_ids = {n.id for n in niveis_existentes}

    if len(niveis_ids) != len(request.ordered_ids):
        raise HTTPException(
            status_code=400,
            detail="Alguns níveis não foram encontrados"
        )

    # Verificar duplicados
    if len(request.ordered_ids) != len(set(request.ordered_ids)):
        raise HTTPException(
            status_code=400,
            detail="IDs duplicados na lista de reordenação"
        )

    # Reordenar
    for index, nivel_id in enumerate(request.ordered_ids):
        db_nivel = db.query(NivelHierarquico).filter(
            NivelHierarquico.id == nivel_id
        ).first()
        db_nivel.ordem = index + 1

    db.commit()
    return {"message": "Níveis reordenados com sucesso"}


@router.patch("/{nivel_id}/toggle/", response_model=NivelResponse)
def toggle_nivel_ativo(nivel_id: int, db: Session = Depends(get_db)):
    """Ativa/desativa um nível hierárquico"""
    db_nivel = db.query(NivelHierarquico).filter(NivelHierarquico.id == nivel_id).first()
    if not db_nivel:
        raise HTTPException(status_code=404, detail="Nível não encontrado")

    db_nivel.ativo = 0 if db_nivel.ativo == 1 else 1
    db.commit()
    db.refresh(db_nivel)
    return db_nivel


# Subníveis
@router.get("/{nivel_id}/subniveis", response_model=list[SubnivelResponse])
def list_subniveis(nivel_id: int, db: Session = Depends(get_db)):
    """Lista subníveis de um nível"""
    return db.query(Subnivel).filter(Subnivel.nivel_id == nivel_id).all()
