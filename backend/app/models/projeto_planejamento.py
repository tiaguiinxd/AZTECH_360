"""
Model: Projeto de Planejamento

Representa um projeto/obra da empresa para planejamento.
Baseado no CSV "PREVISAO 2026".
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum as SQLEnum
import enum

from ..database import Base


class StatusProjeto(str, enum.Enum):
    """Status possiveis de um projeto"""
    PLANEJADO = "planejado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"
    PAUSADO = "pausado"


class ProjetoPlanejamento(Base):
    """
    Tabela: projetos_planejamento

    Armazena projetos/obras para planejamento e acompanhamento.
    """
    __tablename__ = "projetos_planejamento"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    nome = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=True)

    # Relacionamentos (strings por simplicidade inicial)
    empresa = Column(String(100), nullable=False)  # Ex: "AZ TECH", "AZ MAQ"
    cliente = Column(String(100), nullable=False)  # Ex: "NGD", "ULT", "CPE"
    categoria = Column(String(100), nullable=False)  # Ex: "CIVIL", "MECANICA"
    subcategoria = Column(String(100), nullable=True)  # Ex: "INFRAESTRUTURA", "TUBULACAO"
    tipo = Column(String(200), nullable=True)  # Ex: "COBERTA CARGA E DESCARGA"

    # Valores
    valor_estimado = Column(Float, nullable=True)

    # Datas
    data_inicio_prevista = Column(DateTime, nullable=True)
    data_fim_prevista = Column(DateTime, nullable=True)
    data_inicio_real = Column(DateTime, nullable=True)
    data_fim_real = Column(DateTime, nullable=True)

    # Status
    status = Column(
        SQLEnum(StatusProjeto),
        default=StatusProjeto.PLANEJADO,
        nullable=False
    )
    percentual_conclusao = Column(Integer, default=0, nullable=False)

    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ProjetoPlanejamento(id={self.id}, codigo={self.codigo}, nome={self.nome})>"
