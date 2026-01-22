"""
Model: Alocacao de Colaborador em Projeto

Vincula colaboradores a projetos de planejamento com funcao,
periodo e dedicacao.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from ..database import Base


class StatusAlocacao(str, enum.Enum):
    """Status da alocacao"""
    ATIVA = "ativa"
    CONCLUIDA = "concluida"
    SUSPENSA = "suspensa"
    CANCELADA = "cancelada"


class FuncaoAlocacao(str, enum.Enum):
    """Funcoes possiveis em um projeto"""
    GERENTE_PROJETO = "gerente_projeto"
    COORDENADOR = "coordenador"
    ENGENHEIRO = "engenheiro"
    TECNICO = "tecnico"
    ENCARREGADO = "encarregado"
    AUXILIAR = "auxiliar"
    FISCAL = "fiscal"
    COMPRADOR = "comprador"


class Alocacao(Base):
    """
    Tabela: alocacoes

    Vincula colaborador a projeto com periodo e dedicacao.
    """
    __tablename__ = "alocacoes"

    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos (FKs)
    colaborador_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=False)
    projeto_id = Column(Integer, ForeignKey("projetos_planejamento.id"), nullable=False)

    # Funcao no projeto
    funcao = Column(
        SQLEnum(FuncaoAlocacao),
        default=FuncaoAlocacao.TECNICO,
        nullable=False
    )

    # Periodo da alocacao
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime, nullable=True)  # null = sem previsao de fim

    # Dedicacao
    horas_semanais = Column(Float, default=44.0, nullable=False)  # Padrao: 44h/semana
    percentual_dedicacao = Column(Float, default=100.0, nullable=False)  # 0-100%

    # Status
    status = Column(
        SQLEnum(StatusAlocacao),
        default=StatusAlocacao.ATIVA,
        nullable=False
    )

    # Observacoes
    observacoes = Column(String(500), nullable=True)

    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships (para eager loading)
    colaborador = relationship("Colaborador", backref="alocacoes")
    projeto = relationship("ProjetoPlanejamento", backref="alocacoes")

    def __repr__(self):
        return f"<Alocacao(id={self.id}, colaborador={self.colaborador_id}, projeto={self.projeto_id})>"
