"""
Modelo de Versão do Organograma
Permite criar rascunhos, editar sem afetar o banco oficial,
e aprovar para tornar mudanças permanentes.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from ..database import Base


class OrganoVersion(Base):
    """Versão/Snapshot do Organograma"""
    __tablename__ = "organo_versions"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=True)

    # Status: draft (rascunho), approved (aprovado/oficial), archived (arquivado)
    status = Column(String(50), default='draft', nullable=False)

    # Snapshot completo dos colaboradores (array JSON)
    # Estrutura: [{id, nome, cargo, setor_id, nivel_id, superior_id, ...}, ...]
    snapshot = Column(JSONB, nullable=False)

    # Resumo das mudanças em relação à versão oficial
    # Estrutura: {moved: [{id, from_superior, to_superior}], edited: [{id, field, old, new}]}
    changes_summary = Column(JSONB, nullable=True)

    # Metadados de auditoria
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
