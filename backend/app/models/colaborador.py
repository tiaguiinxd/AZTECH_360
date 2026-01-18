"""
Modelo de Colaborador
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from ..database import Base


class Colaborador(Base):
    """Colaboradores da empresa"""
    __tablename__ = "colaboradores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False)
    cargo = Column(String(200), nullable=False)
    setor_id = Column(Integer, ForeignKey("setores.id"), nullable=False)
    subsetor_id = Column(Integer, ForeignKey("subsetores.id"), nullable=True)
    nivel_id = Column(Integer, ForeignKey("niveis_hierarquicos.id"), nullable=False)
    subnivel_id = Column(Integer, ForeignKey("subniveis.id"), nullable=True)
    superior_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=True)
    permissoes = Column(JSONB, default=list)
    foto_url = Column(String(500), nullable=True)
    email = Column(String(200), nullable=True)
    telefone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    setor = relationship("Setor", back_populates="colaboradores", foreign_keys=[setor_id])
    nivel = relationship("NivelHierarquico", back_populates="colaboradores")
    superior = relationship("Colaborador", remote_side=[id], backref="subordinados")
