"""
Routers da API - AZ TECH
"""
from .setores import router as setores_router
from .niveis import router as niveis_router
from .colaboradores import router as colaboradores_router
from .cargos import router as cargos_router
from .tipos_projeto import router as tipos_projeto_router
from .organo_versions import router as organo_versions_router

__all__ = [
    "setores_router",
    "niveis_router",
    "colaboradores_router",
    "cargos_router",
    "tipos_projeto_router",
    "organo_versions_router",
]
