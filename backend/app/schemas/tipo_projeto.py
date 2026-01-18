"""
Schemas Pydantic para TipoProjeto
"""
from pydantic import BaseModel


class TipoProjetoBase(BaseModel):
    codigo: str
    nome: str
    descricao: str | None = None
    icone: str | None = None
    cor: str | None = "#6B7280"
    cor_texto: str | None = "#ffffff"
    ordem: int = 0


class TipoProjetoCreate(TipoProjetoBase):
    pass


class TipoProjetoUpdate(BaseModel):
    codigo: str | None = None
    nome: str | None = None
    descricao: str | None = None
    icone: str | None = None
    cor: str | None = None
    cor_texto: str | None = None
    ordem: int | None = None


class TipoProjetoResponse(TipoProjetoBase):
    id: int

    class Config:
        from_attributes = True
