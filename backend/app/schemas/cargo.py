"""
Schemas Pydantic para Cargo
"""
from pydantic import BaseModel


class CargoBase(BaseModel):
    codigo: str
    nome: str
    descricao: str | None = None
    nivel_id: int | None = None
    setor_id: int | None = None
    ordem: int = 0


class CargoCreate(CargoBase):
    pass


class CargoUpdate(BaseModel):
    codigo: str | None = None
    nome: str | None = None
    descricao: str | None = None
    nivel_id: int | None = None
    setor_id: int | None = None
    ordem: int | None = None


class CargoResponse(CargoBase):
    id: int

    class Config:
        from_attributes = True
