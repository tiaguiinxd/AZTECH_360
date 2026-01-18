"""
Router de Tipos de Projeto - CRUD completo
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.tipo_projeto import TipoProjeto
from ..schemas.tipo_projeto import TipoProjetoCreate, TipoProjetoUpdate, TipoProjetoResponse

router = APIRouter(prefix="/tipos-projeto", tags=["Tipos de Projeto"])


@router.get("/", response_model=list[TipoProjetoResponse])
def list_tipos_projeto(db: Session = Depends(get_db)):
    """Lista todos os tipos de projeto ordenados por ordem"""
    return db.query(TipoProjeto).order_by(TipoProjeto.ordem).all()


@router.get("/{tipo_id}", response_model=TipoProjetoResponse)
def get_tipo_projeto(tipo_id: int, db: Session = Depends(get_db)):
    """Busca um tipo de projeto por ID"""
    tipo = db.query(TipoProjeto).filter(TipoProjeto.id == tipo_id).first()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de projeto não encontrado")
    return tipo


@router.post("/", response_model=TipoProjetoResponse, status_code=201)
def create_tipo_projeto(tipo: TipoProjetoCreate, db: Session = Depends(get_db)):
    """Cria um novo tipo de projeto"""
    # Verificar se código já existe
    existing = db.query(TipoProjeto).filter(TipoProjeto.codigo == tipo.codigo).first()
    if existing:
        raise HTTPException(status_code=400, detail="Código de tipo de projeto já existe")

    db_tipo = TipoProjeto(**tipo.model_dump())
    db.add(db_tipo)
    db.commit()
    db.refresh(db_tipo)
    return db_tipo


@router.put("/{tipo_id}", response_model=TipoProjetoResponse)
def update_tipo_projeto(tipo_id: int, tipo: TipoProjetoUpdate, db: Session = Depends(get_db)):
    """Atualiza um tipo de projeto"""
    db_tipo = db.query(TipoProjeto).filter(TipoProjeto.id == tipo_id).first()
    if not db_tipo:
        raise HTTPException(status_code=404, detail="Tipo de projeto não encontrado")

    update_data = tipo.model_dump(exclude_unset=True)

    # Verificar se novo código já existe em outro tipo
    if "codigo" in update_data:
        existing = db.query(TipoProjeto).filter(
            TipoProjeto.codigo == update_data["codigo"],
            TipoProjeto.id != tipo_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Código de tipo de projeto já existe")

    for field, value in update_data.items():
        setattr(db_tipo, field, value)

    db.commit()
    db.refresh(db_tipo)
    return db_tipo


@router.delete("/{tipo_id}", status_code=204)
def delete_tipo_projeto(tipo_id: int, db: Session = Depends(get_db)):
    """Remove um tipo de projeto"""
    db_tipo = db.query(TipoProjeto).filter(TipoProjeto.id == tipo_id).first()
    if not db_tipo:
        raise HTTPException(status_code=404, detail="Tipo de projeto não encontrado")

    db.delete(db_tipo)
    db.commit()
