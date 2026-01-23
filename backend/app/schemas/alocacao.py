"""
Schemas Pydantic: Alocacao
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class StatusAlocacao(str, Enum):
    ATIVA = "ativa"
    CONCLUIDA = "concluida"
    SUSPENSA = "suspensa"
    CANCELADA = "cancelada"


class FuncaoAlocacao(str, Enum):
    GERENTE_PROJETO = "gerente_projeto"
    COORDENADOR = "coordenador"
    ENGENHEIRO = "engenheiro"
    TECNICO = "tecnico"
    ENCARREGADO = "encarregado"
    AUXILIAR = "auxiliar"
    FISCAL = "fiscal"
    COMPRADOR = "comprador"


class AlocacaoBase(BaseModel):
    """Base schema"""
    colaborador_id: int
    projeto_id: int
    funcao: FuncaoAlocacao = FuncaoAlocacao.TECNICO
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    horas_semanais: float = Field(44.0, ge=1, le=60)
    status: StatusAlocacao = StatusAlocacao.ATIVA
    observacoes: Optional[str] = Field(None, max_length=500)


class AlocacaoCreate(AlocacaoBase):
    """Schema para criacao"""
    pass


class AlocacaoUpdate(BaseModel):
    """Schema para atualizacao (todos opcionais)"""
    funcao: Optional[FuncaoAlocacao] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    horas_semanais: Optional[float] = Field(None, ge=1, le=60)
    status: Optional[StatusAlocacao] = None
    observacoes: Optional[str] = Field(None, max_length=500)


class AlocacaoResponse(AlocacaoBase):
    """Schema para resposta completa"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlocacaoComDetalhes(BaseModel):
    """Schema com dados expandidos do colaborador e projeto"""
    id: int
    colaborador_id: int
    projeto_id: int
    funcao: FuncaoAlocacao
    data_inicio: datetime
    data_fim: Optional[datetime]
    horas_semanais: float
    status: StatusAlocacao
    observacoes: Optional[str]
    created_at: datetime
    updated_at: datetime
    colaborador_nome: str
    colaborador_cargo: str
    projeto_codigo: str
    projeto_nome: str
    projeto_empresa: str

    class Config:
        from_attributes = True


# ========== SCHEMAS PARA DASHBOARD ==========

class ResumoGeralDashboard(BaseModel):
    """Resumo geral para o dashboard"""
    total_projetos: int
    projetos_em_andamento: int
    projetos_planejados: int
    projetos_concluidos: int
    valor_total_carteira: float
    total_colaboradores_alocados: int
    percentual_equipe_alocada: float


class ResumoEmpresaDashboard(BaseModel):
    """Resumo por empresa"""
    empresa: str
    total_projetos: int
    projetos_em_andamento: int
    projetos_concluidos: int
    valor_total: float
    colaboradores_alocados: int


class TimelineItemDashboard(BaseModel):
    """Item da timeline (Gantt)"""
    projeto_id: int
    codigo: str
    nome: str
    empresa: str
    categoria: str
    data_inicio: Optional[datetime]
    data_fim: Optional[datetime]
    status: str
    percentual_conclusao: int
    total_alocados: int


class DisponibilidadeColaborador(BaseModel):
    """Disponibilidade de um colaborador"""
    colaborador_id: int
    nome: str
    cargo: str
    setor: str
    percentual_ocupado: float
    projetos_ativos: int
    disponivel: bool  # True se < 100% ocupado


class SobrecargaMensal(BaseModel):
    """
    Sobrecarga temporal mensal

    Metrica: Media de ocupacao considerando TODOS os colaboradores da empresa.
    - Calcula ocupacao baseado em horas_semanais (44h = 100%) de todas as alocacoes
    - Divide pelo TOTAL de colaboradores da empresa (incluindo os sem alocacao)
    - Exemplo: 10 colaboradores, 5 com 100% ocupacao = (500% / 10) = 50% de ocupacao media
    - Sobrecarga = True se a media > 100% (indica alocacoes conflitantes)
    """
    mes: int  # 1-12
    nome_mes: str  # "Jan", "Fev", etc
    total_alocacoes: int  # Numero de alocacoes ativas neste mes
    total_pessoas: int  # Numero de pessoas com alocacao ativa
    percentual_ocupacao: float  # Media de ocupacao considerando TODOS os colaboradores da empresa
    sobrecarga: bool  # True se ocupacao > 100%
