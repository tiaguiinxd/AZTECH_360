"""
Schemas de Nível Hierárquico e Subnível
"""
from pydantic import BaseModel


class SubnivelBase(BaseModel):
    nome: str
    abreviacao: str | None = None
    ordem: int = 0


class SubnivelCreate(SubnivelBase):
    nivel_id: int


class SubnivelResponse(SubnivelBase):
    id: int
    nivel_id: int

    class Config:
        from_attributes = True


class NivelBase(BaseModel):
    nivel: int = 0
    nome: str
    descricao: str | None = None
    cor: str = "#6B7280"
    cor_texto: str = "#ffffff"
    ordem: int = 0
    ativo: int = 1


class NivelCreate(NivelBase):
    pass


class NivelUpdate(BaseModel):
    nivel: int | None = None
    nome: str | None = None
    descricao: str | None = None
    cor: str | None = None
    cor_texto: str | None = None
    ordem: int | None = None
    ativo: int | None = None


class NivelResponse(NivelBase):
    id: int
    subniveis: list[SubnivelResponse] = []

    class Config:
        from_attributes = True
