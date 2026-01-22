"""
Modelo de Nível Hierárquico e Subnível
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..database import Base


class NivelHierarquico(Base):
    """Níveis hierárquicos (Diretoria, Gerência, etc.)"""
    __tablename__ = "niveis_hierarquicos"

    id = Column(Integer, primary_key=True, index=True)
    nivel = Column(Integer, nullable=False, default=0)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(500), nullable=True)
    cor = Column(String(20), nullable=False, default="#6B7280")
    cor_texto = Column(String(20), nullable=False, default="#ffffff")
    ordem = Column(Integer, nullable=False, default=0)
    ativo = Column(Integer, nullable=False, default=1)  # 1=ativo, 0=inativo (SQLite usa INTEGER para boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    subniveis = relationship("Subnivel", back_populates="nivel", cascade="all, delete-orphan")
    colaboradores = relationship("Colaborador", back_populates="nivel")


class Subnivel(Base):
    """Subníveis dentro de um nível (Jr, Pleno, Sr, etc.)"""
    __tablename__ = "subniveis"

    id = Column(Integer, primary_key=True, index=True)
    nivel_id = Column(Integer, ForeignKey("niveis_hierarquicos.id"), nullable=False)
    nome = Column(String(100), nullable=False)
    abreviacao = Column(String(10), nullable=True)
    ordem = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    nivel = relationship("NivelHierarquico", back_populates="subniveis")
