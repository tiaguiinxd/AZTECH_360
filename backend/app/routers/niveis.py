"""
Endpoints de Níveis Hierárquicos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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


# Subníveis
@router.get("/{nivel_id}/subniveis", response_model=list[SubnivelResponse])
def list_subniveis(nivel_id: int, db: Session = Depends(get_db)):
    """Lista subníveis de um nível"""
    return db.query(Subnivel).filter(Subnivel.nivel_id == nivel_id).all()
