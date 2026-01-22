"""
Schemas Pydantic: Projeto de Planejamento
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class StatusProjeto(str, Enum):
    """Status possiveis de um projeto"""
    PLANEJADO = "planejado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"
    PAUSADO = "pausado"


class ProjetoPlanejamentoBase(BaseModel):
    """Base schema com campos comuns"""
    codigo: str = Field(..., min_length=1, max_length=50)
    nome: str = Field(..., min_length=1, max_length=200)
    descricao: Optional[str] = None

    empresa: str = Field(..., min_length=1, max_length=100)
    cliente: str = Field(..., min_length=1, max_length=100)
    categoria: str = Field(..., min_length=1, max_length=100)
    subcategoria: Optional[str] = Field(None, max_length=100)
    tipo: Optional[str] = Field(None, max_length=200)

    valor_estimado: Optional[float] = None

    data_inicio_prevista: Optional[datetime] = None
    data_fim_prevista: Optional[datetime] = None
    data_inicio_real: Optional[datetime] = None
    data_fim_real: Optional[datetime] = None

    status: StatusProjeto = StatusProjeto.PLANEJADO
    percentual_conclusao: int = Field(0, ge=0, le=100)


class ProjetoPlanejamentoCreate(ProjetoPlanejamentoBase):
    """Schema para criacao de projeto"""
    pass


class ProjetoPlanejamentoUpdate(BaseModel):
    """Schema para atualizacao de projeto (todos opcionais)"""
    codigo: Optional[str] = Field(None, min_length=1, max_length=50)
    nome: Optional[str] = Field(None, min_length=1, max_length=200)
    descricao: Optional[str] = None

    empresa: Optional[str] = Field(None, min_length=1, max_length=100)
    cliente: Optional[str] = Field(None, min_length=1, max_length=100)
    categoria: Optional[str] = Field(None, min_length=1, max_length=100)
    subcategoria: Optional[str] = Field(None, max_length=100)
    tipo: Optional[str] = Field(None, max_length=200)

    valor_estimado: Optional[float] = None

    data_inicio_prevista: Optional[datetime] = None
    data_fim_prevista: Optional[datetime] = None
    data_inicio_real: Optional[datetime] = None
    data_fim_real: Optional[datetime] = None

    status: Optional[StatusProjeto] = None
    percentual_conclusao: Optional[int] = Field(None, ge=0, le=100)


class ProjetoPlanejamentoResponse(ProjetoPlanejamentoBase):
    """Schema para resposta com dados completos"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjetoPlanejamentoListResponse(BaseModel):
    """Schema para lista de projetos"""
    id: int
    codigo: str
    nome: str
    empresa: str
    cliente: str
    categoria: str
    subcategoria: Optional[str]
    tipo: Optional[str]
    valor_estimado: Optional[float]
    data_inicio_prevista: Optional[datetime]
    data_fim_prevista: Optional[datetime]
    status: StatusProjeto
    percentual_conclusao: int

    class Config:
        from_attributes = True
