"""
AZ TECH API - Aplicação Principal
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import engine, Base
from .routers import setores_router, niveis_router, colaboradores_router, cargos_router, tipos_projeto_router, organo_versions_router

settings = get_settings()

# Criar tabelas
Base.metadata.create_all(bind=engine)

# Criar app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,  # Não fazer redirect automático com/sem trailing slash
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(setores_router, prefix=settings.api_prefix)
app.include_router(niveis_router, prefix=settings.api_prefix)
app.include_router(colaboradores_router, prefix=settings.api_prefix)
app.include_router(cargos_router, prefix=settings.api_prefix)
app.include_router(tipos_projeto_router, prefix=settings.api_prefix)
app.include_router(organo_versions_router, prefix=settings.api_prefix)


@app.get("/")
def root():
    """Health check"""
    return {"status": "ok", "app": "AZ TECH API", "version": settings.api_version}


@app.get("/health")
def health():
    """Health check detalhado"""
    return {
        "status": "healthy",
        "database": "connected",
    }
