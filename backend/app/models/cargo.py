"""
Model de Cargo - Funções/Cargos disponíveis na empresa
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..database import Base


class Cargo(Base):
    """Cargos/Funções disponíveis na empresa"""
    __tablename__ = "cargos"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), nullable=False, unique=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(500), nullable=True)
    nivel_id = Column(Integer, ForeignKey("niveis_hierarquicos.id"), nullable=True)
    setor_id = Column(Integer, ForeignKey("setores.id"), nullable=True)
    ordem = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    nivel = relationship("NivelHierarquico", foreign_keys=[nivel_id])
    setor = relationship("Setor", foreign_keys=[setor_id])
