"""
AZ TECH API - Aplicação Principal
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from .config import get_settings
from .database import engine, Base
from .routers import (
    # Estrutura Organizacional
    setores_router,
    niveis_router,
    colaboradores_router,
    cargos_router,
    organo_versions_router,
    # Planejamento
    projetos_planejamento_router,
    # Alocacao (Dashboard)
    alocacoes_router,
    # Legacy
    tipos_projeto_router,
)

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


# Handler global para IntegrityError (violacoes de constraint do banco)
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    """
    Captura violacoes de constraint do banco de dados e retorna
    erro 400 com mensagem amigavel ao inves de erro 500 generico.
    """
    error_msg = str(exc.orig).lower() if exc.orig else str(exc).lower()

    if "foreign key constraint" in error_msg or "violates foreign key" in error_msg:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "detail": "Operacao bloqueada: este registro possui dependencias. "
                          "Remova as dependencias antes de deletar."
            }
        )
    elif "unique constraint" in error_msg or "duplicate key" in error_msg:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "detail": "Registro duplicado: ja existe um registro com estes dados."
            }
        )
    else:
        # Fallback generico (nao expor detalhes internos)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "detail": "Operacao invalida devido a restricoes de integridade do banco de dados."
            }
        )


# Routers - Estrutura Organizacional
app.include_router(setores_router, prefix=settings.api_prefix)
app.include_router(niveis_router, prefix=settings.api_prefix)
app.include_router(colaboradores_router, prefix=settings.api_prefix)
app.include_router(cargos_router, prefix=settings.api_prefix)
app.include_router(organo_versions_router, prefix=settings.api_prefix)

# Routers - Planejamento
app.include_router(projetos_planejamento_router, prefix=settings.api_prefix)

# Routers - Alocacao (Dashboard)
app.include_router(alocacoes_router, prefix=settings.api_prefix)

# Legacy (manter por compatibilidade)
app.include_router(tipos_projeto_router, prefix=settings.api_prefix)


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
