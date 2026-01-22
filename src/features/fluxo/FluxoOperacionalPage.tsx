/**
 * FluxoOperacionalPage - Visualização do Fluxo Operacional da AZ TECH
 *
 * Exibe o ciclo de vida dos serviços e a participação de cada setor em cada fase.
 * Esta tela é uma representação visual do documento docs/FLUXOS_OPERACIONAIS.md
 */

import { memo, useState } from 'react'
import { cn } from '@/utils'
import {
  ArrowRight,
  Users,
  ClipboardCheck,
  Rocket,
  Wrench,
  Building2,
  Calculator,
  Truck,
  UserPlus,
  DollarSign,
  HardHat,
  CheckCircle2,
  Circle,
  Info,
} from 'lucide-react'

// Tipos
type FaseId = 'pre-servico' | 'preparacao' | 'kickoff' | 'execucao'

interface Fase {
  id: FaseId
  nome: string
  descricao: string
  icon: React.ReactNode
  cor: string
  corBg: string
  etapas: Etapa[]
}

interface Etapa {
  id: string
  titulo: string
  responsavel: string
  descricao: string
  entregavel?: string
}

interface SetorParticipacao {
  setor: string
  icon: React.ReactNode
  cor: string
  fases: Record<FaseId, boolean | string>
}

// Dados do fluxo
const FASES: Fase[] = [
  {
    id: 'pre-servico',
    nome: 'Pré-Serviço',
    descricao: 'Captação da demanda e elaboração da proposta',
    icon: <ClipboardCheck className="h-6 w-6" />,
    cor: 'text-blue-600',
    corBg: 'bg-blue-50 border-blue-200',
    etapas: [
      {
        id: '1.1',
        titulo: 'Captação da Demanda',
        responsavel: 'Comercial',
        descricao: 'Receber demanda do cliente, coletar escopo preliminar, identificar projetos',
        entregavel: 'Briefing inicial + Lista de projetos',
      },
      {
        id: '1.2',
        titulo: 'Análise Técnica',
        responsavel: 'Técnico + Suprimentos',
        descricao: 'Analisar viabilidade, elaborar memorial, levantar custos, estimar prazo',
        entregavel: 'Orçamento técnico + Cronograma macro',
      },
      {
        id: '1.3',
        titulo: 'Elaboração da Proposta',
        responsavel: 'Comercial + Financeiro',
        descricao: 'Compilar orçamento, validar margem, definir condições comerciais',
        entregavel: 'Proposta comercial',
      },
      {
        id: '1.4',
        titulo: 'Negociação e Aprovação',
        responsavel: 'Comercial',
        descricao: 'Apresentar proposta, negociar ajustes, obter aprovação',
        entregavel: 'Contrato/Pedido assinado',
      },
    ],
  },
  {
    id: 'preparacao',
    nome: 'Preparação',
    descricao: 'Planejamento detalhado da execução',
    icon: <Calculator className="h-6 w-6" />,
    cor: 'text-amber-600',
    corBg: 'bg-amber-50 border-amber-200',
    etapas: [
      {
        id: '2.1',
        titulo: 'Cronograma de Execução',
        responsavel: 'Engenharia',
        descricao: 'Definir fases, marcos e datas de execução',
        entregavel: 'Cronograma detalhado → Todos',
      },
      {
        id: '2.2',
        titulo: 'Cronograma de Contratação',
        responsavel: 'Engenharia → RH',
        descricao: 'Definir quando cada profissional será necessário',
        entregavel: 'Lista de contratações com prazos',
      },
      {
        id: '2.3',
        titulo: 'Cronograma de Materiais/Equipamentos',
        responsavel: 'Engenharia → Suprimentos',
        descricao: 'Programar entregas e mobilização',
        entregavel: 'Listas com datas de entrega',
      },
      {
        id: '2.4',
        titulo: 'Planos de Qualidade e Segurança',
        responsavel: 'Engenharia → Campo',
        descricao: 'Definir inspeções, testes, PPRA, APR, DDS',
        entregavel: 'Planos aprovados',
      },
    ],
  },
  {
    id: 'kickoff',
    nome: 'Kick-off',
    descricao: 'Oficialização e definição da equipe',
    icon: <Rocket className="h-6 w-6" />,
    cor: 'text-green-600',
    corBg: 'bg-green-50 border-green-200',
    etapas: [
      {
        id: '3.1',
        titulo: 'Reunião de Kick-off',
        responsavel: 'Todos os envolvidos',
        descricao: 'Apresentar escopo, cronograma, equipe e responsabilidades',
        entregavel: 'Ata da reunião',
      },
      {
        id: '3.2',
        titulo: 'Definição da Equipe',
        responsavel: 'Gestores',
        descricao: 'Designar responsáveis por cada função no serviço',
        entregavel: 'Equipe registrada no sistema',
      },
      {
        id: '3.3',
        titulo: 'Checklist de Liberação',
        responsavel: 'Engenharia',
        descricao: 'Validar contrato, equipe, cronogramas, materiais, documentação',
        entregavel: 'Ordem de serviço emitida',
      },
    ],
  },
  {
    id: 'execucao',
    nome: 'Execução',
    descricao: 'Realização do serviço em campo',
    icon: <Wrench className="h-6 w-6" />,
    cor: 'text-purple-600',
    corBg: 'bg-purple-50 border-purple-200',
    etapas: [
      {
        id: '4.1',
        titulo: 'Acompanhamento',
        responsavel: 'Campo + Engenharia',
        descricao: 'Monitorar progresso diário/semanal',
        entregavel: 'Relatórios de progresso',
      },
      {
        id: '4.2',
        titulo: 'Medições e Faturamento',
        responsavel: 'Comercial + Financeiro',
        descricao: 'Realizar medições e emitir faturas',
        entregavel: 'Boletins de medição',
      },
      {
        id: '4.3',
        titulo: 'Gestão de Mudanças',
        responsavel: 'Engenharia + Comercial',
        descricao: 'Gerenciar aditivos e alterações de escopo',
        entregavel: 'Aditivos contratuais',
      },
      {
        id: '4.4',
        titulo: 'Encerramento',
        responsavel: 'Todos',
        descricao: 'Desmobilização, aceite do cliente, lições aprendidas',
        entregavel: 'Termo de encerramento',
      },
    ],
  },
]

const SETORES: SetorParticipacao[] = [
  {
    setor: 'Comercial',
    icon: <Building2 className="h-4 w-4" />,
    cor: 'bg-blue-500',
    fases: {
      'pre-servico': 'Captação, Proposta',
      preparacao: false,
      kickoff: 'Pós-venda definido',
      execucao: 'Relacionamento, Medições',
    },
  },
  {
    setor: 'Técnico',
    icon: <ClipboardCheck className="h-4 w-4" />,
    cor: 'bg-cyan-500',
    fases: {
      'pre-servico': 'Análise, Orçamento',
      preparacao: false,
      kickoff: false,
      execucao: 'Qualidade',
    },
  },
  {
    setor: 'Engenharia',
    icon: <Calculator className="h-4 w-4" />,
    cor: 'bg-amber-500',
    fases: {
      'pre-servico': false,
      preparacao: 'Cronogramas, Planos',
      kickoff: 'Responsável definido',
      execucao: 'Gestão técnica',
    },
  },
  {
    setor: 'Suprimentos',
    icon: <Truck className="h-4 w-4" />,
    cor: 'bg-orange-500',
    fases: {
      'pre-servico': 'Custos',
      preparacao: 'Preparar entregas',
      kickoff: 'Comprador definido',
      execucao: 'Logística',
    },
  },
  {
    setor: 'RH',
    icon: <UserPlus className="h-4 w-4" />,
    cor: 'bg-pink-500',
    fases: {
      'pre-servico': false,
      preparacao: 'Contratações',
      kickoff: false,
      execucao: 'Gestão pessoas',
    },
  },
  {
    setor: 'Financeiro',
    icon: <DollarSign className="h-4 w-4" />,
    cor: 'bg-green-500',
    fases: {
      'pre-servico': 'Margem',
      preparacao: 'Fluxo caixa',
      kickoff: false,
      execucao: 'Faturamento',
    },
  },
  {
    setor: 'Campo',
    icon: <HardHat className="h-4 w-4" />,
    cor: 'bg-purple-500',
    fases: {
      'pre-servico': false,
      preparacao: false,
      kickoff: 'Encarregado definido',
      execucao: 'Execução física',
    },
  },
]

const EQUIPE_SERVICO = [
  { funcao: 'Comercial (Pós-venda)', responsabilidade: 'Relacionamento com cliente, medições, aditivos' },
  { funcao: 'Suprimentos', responsabilidade: 'Compras e logística de materiais' },
  { funcao: 'Engenheiro Responsável', responsabilidade: 'Gestão técnica, qualidade, segurança' },
  { funcao: 'Planejamento', responsabilidade: 'Acompanhamento de cronograma, indicadores' },
  { funcao: 'Execução (Encarregado)', responsabilidade: 'Gestão da equipe de campo' },
  { funcao: 'Assistente', responsabilidade: 'Apoio administrativo, documentação' },
]

// Componentes internos
const FaseCard = memo(function FaseCard({
  fase,
  isSelected,
  onClick,
}: {
  fase: Fase
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 p-4 rounded-xl border-2 transition-all text-left',
        fase.corBg,
        isSelected ? 'ring-2 ring-offset-2 ring-aztech-primary scale-[1.02]' : 'hover:scale-[1.01]'
      )}
    >
      <div className={cn('flex items-center gap-2 mb-2', fase.cor)}>
        {fase.icon}
        <span className="font-bold">{fase.nome}</span>
      </div>
      <p className="text-xs text-gray-600">{fase.descricao}</p>
    </button>
  )
})

const EtapaItem = memo(function EtapaItem({ etapa }: { etapa: Etapa }) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-aztech-primary/10 flex items-center justify-center text-aztech-primary font-bold text-sm">
        {etapa.id}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-800">{etapa.titulo}</h4>
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            {etapa.responsavel}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{etapa.descricao}</p>
        {etapa.entregavel && (
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-fit">
            <CheckCircle2 className="h-3 w-3" />
            <span>{etapa.entregavel}</span>
          </div>
        )}
      </div>
    </div>
  )
})

// Componente principal
export const FluxoOperacionalPage = memo(function FluxoOperacionalPage() {
  const [selectedFase, setSelectedFase] = useState<FaseId>('pre-servico')

  const faseAtual = FASES.find((f) => f.id === selectedFase)!

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fluxo Operacional</h1>
            <p className="text-sm text-gray-500 mt-1">
              Ciclo de vida dos serviços da AZ TECH
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <Info className="h-4 w-4" />
            <span>Baseado em docs/FLUXOS_OPERACIONAIS.md</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Timeline das fases */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">CICLO DE VIDA DO SERVIÇO</h2>
          <div className="flex items-center gap-2">
            {FASES.map((fase, index) => (
              <div key={fase.id} className="contents">
                <FaseCard
                  fase={fase}
                  isSelected={selectedFase === fase.id}
                  onClick={() => setSelectedFase(fase.id)}
                />
                {index < FASES.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detalhe da fase selecionada */}
        <div className={cn('rounded-xl border-2 p-6', faseAtual.corBg)}>
          <div className={cn('flex items-center gap-3 mb-4', faseAtual.cor)}>
            {faseAtual.icon}
            <div>
              <h2 className="text-xl font-bold">{faseAtual.nome}</h2>
              <p className="text-sm opacity-80">{faseAtual.descricao}</p>
            </div>
          </div>

          <div className="space-y-3">
            {faseAtual.etapas.map((etapa) => (
              <EtapaItem key={etapa.id} etapa={etapa} />
            ))}
          </div>
        </div>

        {/* Matriz Setor x Fase */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">PARTICIPAÇÃO DOS SETORES POR FASE</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Setor</th>
                  {FASES.map((fase) => (
                    <th
                      key={fase.id}
                      className={cn(
                        'text-center py-3 px-4 font-semibold',
                        fase.cor,
                        selectedFase === fase.id && 'bg-gray-50'
                      )}
                    >
                      {fase.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SETORES.map((setor) => (
                  <tr key={setor.setor} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-6 h-6 rounded flex items-center justify-center text-white', setor.cor)}>
                          {setor.icon}
                        </div>
                        <span className="font-medium">{setor.setor}</span>
                      </div>
                    </td>
                    {FASES.map((fase) => {
                      const participacao = setor.fases[fase.id]
                      return (
                        <td
                          key={fase.id}
                          className={cn(
                            'text-center py-3 px-4',
                            selectedFase === fase.id && 'bg-gray-50'
                          )}
                        >
                          {participacao ? (
                            <div className="flex flex-col items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              {typeof participacao === 'string' && (
                                <span className="text-xs text-gray-600">{participacao}</span>
                              )}
                            </div>
                          ) : (
                            <Circle className="h-4 w-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipe do Serviço (mostrar apenas no Kick-off) */}
        {selectedFase === 'kickoff' && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-green-600" />
              <h2 className="text-sm font-semibold text-green-800">EQUIPE DEFINIDA NO KICK-OFF</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EQUIPE_SERVICO.map((membro) => (
                <div key={membro.funcao} className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="font-medium text-gray-800 text-sm">{membro.funcao}</div>
                  <div className="text-xs text-gray-500 mt-1">{membro.responsabilidade}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nota sobre Fase 4 */}
        {selectedFase === 'execucao' && (
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-800 mb-1">Fase em Definição</h3>
                <p className="text-sm text-purple-700">
                  O fluxo detalhado da fase de Execução ainda está sendo definido em conjunto.
                  As etapas listadas são uma visão inicial que será refinada conforme a operação.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

FluxoOperacionalPage.displayName = 'FluxoOperacionalPage'
