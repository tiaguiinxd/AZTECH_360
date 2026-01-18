"""
Schemas de Colaborador
"""
from datetime import datetime
from pydantic import BaseModel


class ColaboradorBase(BaseModel):
    nome: str
    cargo: str
    setor_id: int
    subsetor_id: int | None = None
    nivel_id: int
    subnivel_id: int | None = None
    superior_id: int | None = None
    permissoes: list[str] = []
    foto_url: str | None = None
    email: str | None = None
    telefone: str | None = None


class ColaboradorCreate(ColaboradorBase):
    pass


class ColaboradorUpdate(BaseModel):
    nome: str | None = None
    cargo: str | None = None
    setor_id: int | None = None
    subsetor_id: int | None = None
    nivel_id: int | None = None
    subnivel_id: int | None = None
    superior_id: int | None = None
    permissoes: list[str] | None = None
    foto_url: str | None = None
    email: str | None = None
    telefone: str | None = None


class ColaboradorResponse(ColaboradorBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
