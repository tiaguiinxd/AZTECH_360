"""
Schemas de Versão do Organograma
"""
from datetime import datetime
from typing import Any
from pydantic import BaseModel


class ColaboradorSnapshot(BaseModel):
    """Snapshot de um colaborador para versionamento"""
    id: int
    nome: str
    cargo: str
    setor_id: int
    subsetor_id: int | None = None
    nivel_id: int
    subnivel_id: int | None = None
    superior_id: int | None = None
    permissoes: list[str] = []
    foto_url: str | None = None
    email: str | None = None
    telefone: str | None = None


class VersionChange(BaseModel):
    """Representa uma mudança individual"""
    colaborador_id: int
    colaborador_nome: str
    change_type: str  # 'hierarchy' | 'data' | 'added' | 'removed'
    field: str | None = None
    old_value: Any | None = None
    new_value: Any | None = None


class ChangesSummary(BaseModel):
    """Resumo das mudanças de uma versão"""
    total_changes: int = 0
    hierarchy_changes: list[VersionChange] = []
    data_changes: list[VersionChange] = []


class OrganoVersionCreate(BaseModel):
    """Schema para criar uma nova versão/rascunho"""
    nome: str
    descricao: str | None = None


class OrganoVersionUpdate(BaseModel):
    """Schema para atualizar uma versão"""
    nome: str | None = None
    descricao: str | None = None
    snapshot: list[ColaboradorSnapshot] | None = None


class OrganoVersionResponse(BaseModel):
    """Schema de resposta de uma versão"""
    id: int
    nome: str
    descricao: str | None = None
    status: str
    snapshot: list[dict] = []
    changes_summary: dict | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    approved_at: datetime | None = None

    class Config:
        from_attributes = True


class OrganoVersionListResponse(BaseModel):
    """Schema resumido para listagem de versões"""
    id: int
    nome: str
    descricao: str | None = None
    status: str
    changes_count: int = 0
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
