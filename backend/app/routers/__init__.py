"""
Routers da API - AZ TECH
"""
# Estrutura Organizacional
from .setores import router as setores_router
from .niveis import router as niveis_router
from .colaboradores import router as colaboradores_router
from .cargos import router as cargos_router
from .organo_versions import router as organo_versions_router

# Planejamento
from .projetos_planejamento import router as projetos_planejamento_router

# Alocacao (Dashboard)
from .alocacoes import router as alocacoes_router

# Legacy (manter por compatibilidade, será removido)
from .tipos_projeto import router as tipos_projeto_router

__all__ = [
    # Estrutura Organizacional
    "setores_router",
    "niveis_router",
    "colaboradores_router",
    "cargos_router",
    "organo_versions_router",
    # Planejamento
    "projetos_planejamento_router",
    # Alocacao (Dashboard)
    "alocacoes_router",
    # Legacy
    "tipos_projeto_router",
]
