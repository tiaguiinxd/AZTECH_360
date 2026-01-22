"""
Modelos SQLAlchemy - AZ TECH
"""
# Estrutura Organizacional
from .setor import Setor, Subsetor
from .nivel import NivelHierarquico, Subnivel
from .colaborador import Colaborador
from .cargo import Cargo
from .organo_version import OrganoVersion

# Planejamento
from .projeto_planejamento import ProjetoPlanejamento, StatusProjeto

# Alocacao (Dashboard)
from .alocacao import Alocacao, StatusAlocacao, FuncaoAlocacao

# Legacy
from .tipo_projeto import TipoProjeto

__all__ = [
    # Estrutura Organizacional
    "Setor",
    "Subsetor",
    "NivelHierarquico",
    "Subnivel",
    "Colaborador",
    "Cargo",
    "OrganoVersion",
    # Planejamento
    "ProjetoPlanejamento",
    "StatusProjeto",
    # Alocacao (Dashboard)
    "Alocacao",
    "StatusAlocacao",
    "FuncaoAlocacao",
    # Legacy
    "TipoProjeto",
]
