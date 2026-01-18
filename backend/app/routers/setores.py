"""
Endpoints de Setores
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Setor, Subsetor
from ..schemas import SetorCreate, SetorUpdate, SetorResponse, SubsetorResponse

router = APIRouter(prefix="/setores", tags=["Setores"])


@router.get("/", response_model=list[SetorResponse])
def list_setores(db: Session = Depends(get_db)):
    """Lista todos os setores"""
    return db.query(Setor).all()


@router.get("/{setor_id}", response_model=SetorResponse)
def get_setor(setor_id: int, db: Session = Depends(get_db)):
    """Busca um setor por ID"""
    setor = db.query(Setor).filter(Setor.id == setor_id).first()
    if not setor:
        raise HTTPException(status_code=404, detail="Setor não encontrado")
    return setor


@router.post("/", response_model=SetorResponse, status_code=201)
def create_setor(setor: SetorCreate, db: Session = Depends(get_db)):
    """Cria um novo setor"""
    db_setor = Setor(**setor.model_dump())
    db.add(db_setor)
    db.commit()
    db.refresh(db_setor)
    return db_setor


@router.put("/{setor_id}", response_model=SetorResponse)
def update_setor(setor_id: int, setor: SetorUpdate, db: Session = Depends(get_db)):
    """Atualiza um setor"""
    db_setor = db.query(Setor).filter(Setor.id == setor_id).first()
    if not db_setor:
        raise HTTPException(status_code=404, detail="Setor não encontrado")

    update_data = setor.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_setor, field, value)

    db.commit()
    db.refresh(db_setor)
    return db_setor


@router.delete("/{setor_id}", status_code=204)
def delete_setor(setor_id: int, db: Session = Depends(get_db)):
    """Remove um setor"""
    db_setor = db.query(Setor).filter(Setor.id == setor_id).first()
    if not db_setor:
        raise HTTPException(status_code=404, detail="Setor não encontrado")

    db.delete(db_setor)
    db.commit()


# Subsetores
@router.get("/{setor_id}/subsetores", response_model=list[SubsetorResponse])
def list_subsetores(setor_id: int, db: Session = Depends(get_db)):
    """Lista subsetores de um setor"""
    return db.query(Subsetor).filter(Subsetor.setor_id == setor_id).all()
