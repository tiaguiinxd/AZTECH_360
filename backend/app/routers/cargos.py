"""
Router de Cargos - CRUD completo
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.cargo import Cargo
from ..schemas.cargo import CargoCreate, CargoUpdate, CargoResponse

router = APIRouter(prefix="/cargos", tags=["Cargos"])


@router.get("/", response_model=list[CargoResponse])
def list_cargos(db: Session = Depends(get_db)):
    """Lista todos os cargos ordenados por ordem"""
    return db.query(Cargo).order_by(Cargo.ordem).all()


@router.get("/{cargo_id}", response_model=CargoResponse)
def get_cargo(cargo_id: int, db: Session = Depends(get_db)):
    """Busca um cargo por ID"""
    cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo não encontrado")
    return cargo


@router.post("/", response_model=CargoResponse, status_code=201)
def create_cargo(cargo: CargoCreate, db: Session = Depends(get_db)):
    """Cria um novo cargo"""
    # Verificar se código já existe
    existing = db.query(Cargo).filter(Cargo.codigo == cargo.codigo).first()
    if existing:
        raise HTTPException(status_code=400, detail="Código de cargo já existe")

    db_cargo = Cargo(**cargo.model_dump())
    db.add(db_cargo)
    db.commit()
    db.refresh(db_cargo)
    return db_cargo


@router.put("/{cargo_id}", response_model=CargoResponse)
def update_cargo(cargo_id: int, cargo: CargoUpdate, db: Session = Depends(get_db)):
    """Atualiza um cargo"""
    db_cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if not db_cargo:
        raise HTTPException(status_code=404, detail="Cargo não encontrado")

    update_data = cargo.model_dump(exclude_unset=True)

    # Verificar se novo código já existe em outro cargo
    if "codigo" in update_data:
        existing = db.query(Cargo).filter(
            Cargo.codigo == update_data["codigo"],
            Cargo.id != cargo_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Código de cargo já existe")

    for field, value in update_data.items():
        setattr(db_cargo, field, value)

    db.commit()
    db.refresh(db_cargo)
    return db_cargo


@router.delete("/{cargo_id}", status_code=204)
def delete_cargo(cargo_id: int, db: Session = Depends(get_db)):
    """Remove um cargo"""
    db_cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if not db_cargo:
        raise HTTPException(status_code=404, detail="Cargo não encontrado")

    db.delete(db_cargo)
    db.commit()
