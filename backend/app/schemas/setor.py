"""
Schemas de Setor e Subsetor
"""
from pydantic import BaseModel


class SubsetorBase(BaseModel):
    nome: str
    cor: str | None = None
    cor_texto: str | None = "#1e293b"


class SubsetorCreate(SubsetorBase):
    setor_id: int


class SubsetorResponse(SubsetorBase):
    id: int
    setor_id: int

    class Config:
        from_attributes = True


class SetorBase(BaseModel):
    codigo: str = ""
    nome: str
    nome_completo: str | None = None
    cor: str = "#D3D3D3"
    cor_texto: str = "#1e293b"
    icone: str | None = None
    diretor_id: int | None = None
    ordem: int = 0


class SetorCreate(SetorBase):
    pass


class SetorUpdate(BaseModel):
    codigo: str | None = None
    nome: str | None = None
    nome_completo: str | None = None
    cor: str | None = None
    cor_texto: str | None = None
    icone: str | None = None
    diretor_id: int | None = None
    ordem: int | None = None


class SetorResponse(SetorBase):
    id: int
    subsetores: list[SubsetorResponse] = []

    class Config:
        from_attributes = True
