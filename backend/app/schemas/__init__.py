"""
Schemas Pydantic - AZ TECH
"""
# Estrutura Organizacional
from .setor import SetorBase, SetorCreate, SetorUpdate, SetorResponse, SubsetorResponse
from .nivel import NivelBase, NivelCreate, NivelUpdate, NivelResponse, SubnivelResponse
from .colaborador import ColaboradorBase, ColaboradorCreate, ColaboradorUpdate, ColaboradorResponse
from .cargo import CargoBase, CargoCreate, CargoUpdate, CargoResponse
from .organo_version import (
    ColaboradorSnapshot,
    VersionChange,
    ChangesSummary,
    OrganoVersionCreate,
    OrganoVersionUpdate,
    OrganoVersionResponse,
    OrganoVersionListResponse,
)

# Planejamento
from .projeto_planejamento import (
    ProjetoPlanejamentoCreate,
    ProjetoPlanejamentoUpdate,
    ProjetoPlanejamentoResponse,
    ProjetoPlanejamentoListResponse,
)

# Alocacao (Dashboard)
from .alocacao import (
    AlocacaoCreate,
    AlocacaoUpdate,
    AlocacaoResponse,
    AlocacaoComDetalhes,
    ResumoGeralDashboard,
    ResumoEmpresaDashboard,
    TimelineItemDashboard,
    DisponibilidadeColaborador,
    StatusAlocacao,
    FuncaoAlocacao,
)

# Legacy
from .tipo_projeto import TipoProjetoBase, TipoProjetoCreate, TipoProjetoUpdate, TipoProjetoResponse

__all__ = [
    # Estrutura Organizacional
    "SetorBase", "SetorCreate", "SetorUpdate", "SetorResponse", "SubsetorResponse",
    "NivelBase", "NivelCreate", "NivelUpdate", "NivelResponse", "SubnivelResponse",
    "ColaboradorBase", "ColaboradorCreate", "ColaboradorUpdate", "ColaboradorResponse",
    "CargoBase", "CargoCreate", "CargoUpdate", "CargoResponse",
    "ColaboradorSnapshot", "VersionChange", "ChangesSummary",
    "OrganoVersionCreate", "OrganoVersionUpdate", "OrganoVersionResponse", "OrganoVersionListResponse",
    # Planejamento
    "ProjetoPlanejamentoCreate", "ProjetoPlanejamentoUpdate",
    "ProjetoPlanejamentoResponse", "ProjetoPlanejamentoListResponse",
    # Alocacao (Dashboard)
    "AlocacaoCreate", "AlocacaoUpdate", "AlocacaoResponse", "AlocacaoComDetalhes",
    "ResumoGeralDashboard", "ResumoEmpresaDashboard", "TimelineItemDashboard",
    "DisponibilidadeColaborador", "StatusAlocacao", "FuncaoAlocacao",
    # Legacy
    "TipoProjetoBase", "TipoProjetoCreate", "TipoProjetoUpdate", "TipoProjetoResponse",
]
