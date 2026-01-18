"""
Model de TipoProjeto - Tipos de projetos da empresa
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from ..database import Base


class TipoProjeto(Base):
    """Tipos de projetos (Civil, Mecânica, Estrutura Metálica, etc)"""
    __tablename__ = "tipos_projeto"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), nullable=False, unique=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(500), nullable=True)
    icone = Column(String(50), nullable=True)
    cor = Column(String(20), nullable=True, default="#6B7280")
    cor_texto = Column(String(20), nullable=True, default="#ffffff")
    ordem = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
