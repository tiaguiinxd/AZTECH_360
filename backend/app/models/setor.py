"""
Modelo de Setor e Subsetor
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..database import Base


class Setor(Base):
    """Setores da empresa (Comercial, Engenharia, etc.)"""
    __tablename__ = "setores"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(10), nullable=False, default="")
    nome = Column(String(100), nullable=False)
    nome_completo = Column(String(200), nullable=True)
    cor = Column(String(20), nullable=False, default="#D3D3D3")
    cor_texto = Column(String(20), nullable=False, default="#1e293b")
    icone = Column(String(50), nullable=True)
    diretor_id = Column(Integer, ForeignKey("colaboradores.id", ondelete="SET NULL"), nullable=True)
    ordem = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    subsetores = relationship("Subsetor", back_populates="setor", cascade="all, delete-orphan")
    colaboradores = relationship(
        "Colaborador",
        back_populates="setor",
        foreign_keys="[Colaborador.setor_id]"
    )
    diretor = relationship(
        "Colaborador",
        foreign_keys=[diretor_id],
        uselist=False
    )


class Subsetor(Base):
    """Subsetores dentro de um setor"""
    __tablename__ = "subsetores"

    id = Column(Integer, primary_key=True, index=True)
    setor_id = Column(Integer, ForeignKey("setores.id"), nullable=False)
    nome = Column(String(100), nullable=False)
    cor = Column(String(20), nullable=True)
    cor_texto = Column(String(20), nullable=True, default="#1e293b")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    setor = relationship("Setor", back_populates="subsetores")
