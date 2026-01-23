/**
 * Dados do Fluxo Operacional AZ TECH
 *
 * Baseado no documento: docs/FLUXOS_OPERACIONAIS.md
 * Este arquivo contém os dados estáticos das 4 fases do ciclo de vida de um serviço
 */

import type { Fase, MapeamentoSetorFase, FuncaoServico } from '../types'

export const FASES: Fase[] = [
  {
    id: 'pre-servico',
    numero: 1,
    titulo: 'PRE-SERVICO',
    subtitulo: 'Captacao e Proposta',
    cor: 'blue',
    icone: 'FileSearch',
    responsaveisPrincipais: ['comercial', 'tecnico', 'suprimentos', 'financeiro'],
    objetivo:
      'Transformar uma oportunidade de negócio em uma proposta técnica e comercial viável, qualificando a demanda do cliente e estabelecendo as bases contratuais para o serviço.',
    resultadosEsperados: [
      'Contrato assinado com escopo, prazo e valores definidos',
      'Viabilidade técnica confirmada',
      'Equipe interna ciente da oportunidade',
      'Cronograma macro e custos estimados aprovados pelo cliente',
    ],
    subFases: [
      {
        id: '1.1',
        codigo: '1.1',
        titulo: 'Captacao da Demanda',
        responsaveis: ['comercial'],
        etapas: [
          {
            id: '1.1.1',
            codigo: '1.1.1',
            acao: 'Receber demanda do cliente',
            entregavel: 'Briefing inicial',
            prazoEstimado: '1 dia útil',
            checklistValidacao: [
              'Informações de contato do cliente registradas',
              'Escopo macro identificado',
              'Canal de comunicação estabelecido',
            ],
          },
          {
            id: '1.1.2',
            codigo: '1.1.2',
            acao: 'Coletar escopo preliminar',
            entregavel: 'Documento de escopo',
            prazoEstimado: '2-3 dias úteis',
            checklistValidacao: [
              'Objetivos do projeto definidos',
              'Localização e acesso ao site identificados',
              'Restrições e requisitos especiais mapeados',
            ],
          },
          {
            id: '1.1.3',
            codigo: '1.1.3',
            acao: 'Identificar projetos necessarios',
            entregavel: 'Lista de projetos',
            prazoEstimado: '1 dia útil',
            checklistValidacao: [
              'Projetos técnicos necessários listados',
              'Complexidade estimada para cada projeto',
            ],
          },
          {
            id: '1.1.4',
            codigo: '1.1.4',
            acao: 'Registrar oportunidade no sistema',
            entregavel: 'Servico status "Prospeccao"',
            prazoEstimado: '30 minutos',
            checklistValidacao: [
              'Serviço cadastrado no sistema',
              'Status "Prospecção" atribuído',
              'Documentos anexados',
            ],
          },
        ],
      },
      {
        id: '1.2',
        codigo: '1.2',
        titulo: 'Analise Tecnica',
        responsaveis: ['tecnico', 'suprimentos'],
        etapas: [
          {
            id: '1.2.1',
            codigo: '1.2.1',
            acao: 'Analisar viabilidade tecnica',
            entregavel: 'Parecer tecnico',
            prazoEstimado: '3-5 dias úteis',
            checklistValidacao: [
              'Vistoria técnica realizada (se aplicável)',
              'Riscos técnicos identificados',
              'Viabilidade confirmada ou justificativa de inviabilidade',
              'Recomendações técnicas documentadas',
            ],
          },
          {
            id: '1.2.2',
            codigo: '1.2.2',
            acao: 'Elaborar memorial descritivo',
            entregavel: 'Memorial descritivo',
            prazoEstimado: '2-4 dias úteis',
            checklistValidacao: [
              'Metodologia de execução definida',
              'Normas técnicas aplicáveis citadas',
              'Memorial revisado por coordenador técnico',
            ],
          },
          {
            id: '1.2.3',
            codigo: '1.2.3',
            acao: 'Definir especificacoes de materiais',
            entregavel: 'Lista de materiais',
          },
          {
            id: '1.2.4',
            codigo: '1.2.4',
            acao: 'Levantar custos com Suprimentos',
            entregavel: 'Planilha de custos',
            prazoEstimado: '3-5 dias úteis',
            checklistValidacao: [
              'Cotações de materiais obtidas',
              'Custos de mão de obra estimados',
              'Contingências incluídas',
            ],
          },
          {
            id: '1.2.5',
            codigo: '1.2.5',
            acao: 'Estimar prazo de execucao',
            entregavel: 'Cronograma macro',
            prazoEstimado: '1-2 dias úteis',
            checklistValidacao: [
              'Etapas críticas identificadas',
              'Recursos necessários considerados',
              'Prazo total validado com engenharia',
            ],
          },
          {
            id: '1.2.6',
            codigo: '1.2.6',
            acao: 'Elaborar orcamento detalhado',
            entregavel: 'Orcamento tecnico',
            prazoEstimado: '2-3 dias úteis',
            checklistValidacao: [
              'Todas as disciplinas orçadas',
              'Orçamento aprovado pelo coordenador técnico',
              'Memória de cálculo anexada',
            ],
          },
        ],
      },
      {
        id: '1.3',
        codigo: '1.3',
        titulo: 'Elaboracao da Proposta',
        responsaveis: ['comercial', 'financeiro'],
        etapas: [
          {
            id: '1.3.1',
            codigo: '1.3.1',
            acao: 'Compilar orcamento tecnico',
            entregavel: 'Proposta base',
            prazoEstimado: '1 dia útil',
            checklistValidacao: [
              'Orçamento técnico consolidado',
              'Custos indiretos incluídos',
              'Impostos e tributos calculados',
            ],
          },
          {
            id: '1.3.2',
            codigo: '1.3.2',
            acao: 'Validar margem com Financeiro',
            entregavel: 'Margem aprovada',
            prazoEstimado: '4 horas',
            checklistValidacao: [
              'Margem de lucro validada',
              'Fluxo de caixa projetado analisado',
              'Aprovação formal do financeiro obtida',
            ],
          },
          {
            id: '1.3.3',
            codigo: '1.3.3',
            acao: 'Definir condicoes comerciais',
            entregavel: 'Termos comerciais',
          },
          {
            id: '1.3.4',
            codigo: '1.3.4',
            acao: 'Elaborar proposta formal',
            entregavel: 'Proposta comercial',
            prazoEstimado: '1-2 dias úteis',
            checklistValidacao: [
              'Proposta formatada conforme padrão da empresa',
              'Termos e condições comerciais incluídos',
              'Proposta revisada por gerente comercial',
              'Documentos anexos verificados',
            ],
          },
        ],
      },
      {
        id: '1.4',
        codigo: '1.4',
        titulo: 'Negociacao e Aprovacao',
        responsaveis: ['comercial'],
        etapas: [
          {
            id: '1.4.1',
            codigo: '1.4.1',
            acao: 'Apresentar proposta ao cliente',
            entregavel: 'Proposta enviada',
          },
          {
            id: '1.4.2',
            codigo: '1.4.2',
            acao: 'Negociar ajustes se necessario',
            entregavel: 'Proposta revisada',
          },
          {
            id: '1.4.3',
            codigo: '1.4.3',
            acao: 'Obter aprovacao do cliente',
            entregavel: 'Pedido/Contrato assinado',
            prazoEstimado: 'Variável (depende do cliente)',
            checklistValidacao: [
              'Contrato ou pedido assinado recebido',
              'Condições comerciais confirmadas',
              'Documentação do cliente validada',
              'Serviço migrado para status "Aprovado"',
            ],
          },
          {
            id: '1.4.4',
            codigo: '1.4.4',
            acao: 'Atualizar status no sistema',
            entregavel: 'Servico status "Aprovado"',
          },
        ],
      },
    ],
  },
  {
    id: 'preparacao',
    numero: 2,
    titulo: 'PREPARACAO',
    subtitulo: 'Planejamento da Execucao',
    cor: 'amber',
    icone: 'ClipboardList',
    responsaveisPrincipais: ['engenharia', 'rh', 'suprimentos'],
    objetivo:
      'Planejar detalhadamente a execução do serviço, mobilizando recursos, formalizando processos internos e garantindo que todos os requisitos técnicos, humanos e logísticos estejam prontos antes do início das atividades.',
    resultadosEsperados: [
      'Cronograma detalhado de execução aprovado',
      'Equipe técnica alocada e treinada',
      'Materiais e equipamentos adquiridos ou reservados',
      'Documentação técnica e permissões obtidas',
      'Sistema atualizado com serviço em status "Em Preparação"',
    ],
    subFases: [
      {
        id: '2.1',
        codigo: '2.1',
        titulo: 'Planejamento de Engenharia',
        responsaveis: ['engenharia'],
        etapas: [
          {
            id: '2.1.1',
            codigo: '2.1.1',
            acao: 'Elaborar Cronograma de Execucao',
            entregavel: 'Fases, marcos, datas para todos os setores',
          },
          {
            id: '2.1.2',
            codigo: '2.1.2',
            acao: 'Elaborar Cronograma de Contratacao',
            entregavel: 'Quando cada funcao sera necessaria (para RH)',
          },
          {
            id: '2.1.3',
            codigo: '2.1.3',
            acao: 'Elaborar Cronograma de Equipamentos',
            entregavel: 'Mobilizacao/desmobilizacao (para Suprimentos)',
          },
          {
            id: '2.1.4',
            codigo: '2.1.4',
            acao: 'Elaborar Cronograma de Materiais',
            entregavel: 'Entregas programadas (para Suprimentos)',
          },
          {
            id: '2.1.5',
            codigo: '2.1.5',
            acao: 'Elaborar Plano de Qualidade',
            entregavel: 'Inspecoes, testes, aceites (para Tecnico/Campo)',
          },
          {
            id: '2.1.6',
            codigo: '2.1.6',
            acao: 'Elaborar Plano de Seguranca',
            entregavel: 'PPRA, APR, DDS (para Campo/SESMT)',
          },
        ],
      },
      {
        id: '2.2',
        codigo: '2.2',
        titulo: 'Requisicoes para RH',
        responsaveis: ['engenharia', 'rh'],
        etapas: [
          {
            id: '2.2.1',
            codigo: '2.2.1',
            acao: 'Informar quantidade de profissionais por funcao',
            entregavel: 'Minimo 30 dias antes (Contratacao CLT)',
            detalhes: 'Prazo minimo para contratacao CLT',
          },
          {
            id: '2.2.2',
            codigo: '2.2.2',
            acao: 'Informar periodo de alocacao',
            entregavel: 'Inicio e fim previsto',
          },
          {
            id: '2.2.3',
            codigo: '2.2.3',
            acao: 'Informar qualificacoes necessarias',
            entregavel: 'NRs, certificacoes',
          },
          {
            id: '2.2.4',
            codigo: '2.2.4',
            acao: 'Informar local de trabalho',
            entregavel: 'Deslocamento, hospedagem',
          },
        ],
      },
      {
        id: '2.3',
        codigo: '2.3',
        titulo: 'Requisicoes para Suprimentos',
        responsaveis: ['engenharia', 'suprimentos'],
        etapas: [
          {
            id: '2.3.1',
            codigo: '2.3.1',
            acao: 'Lista de materiais com datas',
            entregavel: 'Conforme lead time',
            detalhes: 'Considerar prazos de entrega dos fornecedores',
          },
          {
            id: '2.3.2',
            codigo: '2.3.2',
            acao: 'Lista de equipamentos',
            entregavel: 'Minimo 15 dias antes (Locacao ou proprio)',
          },
          {
            id: '2.3.3',
            codigo: '2.3.3',
            acao: 'Ferramentas especiais',
            entregavel: 'Calibracao, certificacao',
          },
          {
            id: '2.3.4',
            codigo: '2.3.4',
            acao: 'EPIs especificos',
            entregavel: 'Por funcao',
          },
        ],
      },
      {
        id: '2.4',
        codigo: '2.4',
        titulo: 'Validacao dos Responsaveis',
        responsaveis: ['engenharia', 'rh', 'suprimentos', 'financeiro'],
        etapas: [
          {
            id: '2.4.1',
            codigo: '2.4.1',
            acao: 'Engenharia valida cronogramas',
            entregavel: 'Cronogramas sao factiveis',
          },
          {
            id: '2.4.2',
            codigo: '2.4.2',
            acao: 'RH valida contratacoes',
            entregavel: 'Consegue contratar no prazo',
          },
          {
            id: '2.4.3',
            codigo: '2.4.3',
            acao: 'Suprimentos valida entregas',
            entregavel: 'Consegue entregar materiais/equipamentos',
          },
          {
            id: '2.4.4',
            codigo: '2.4.4',
            acao: 'Financeiro valida fluxo',
            entregavel: 'Fluxo de caixa comporta',
          },
        ],
      },
    ],
  },
  {
    id: 'kickoff',
    numero: 3,
    titulo: 'KICK-OFF',
    subtitulo: 'Oficializacao',
    cor: 'purple',
    icone: 'Rocket',
    responsaveisPrincipais: ['todos'],
    objetivo:
      'Alinhar expectativas entre AZ TECH e cliente, formalizar o início das atividades e garantir que todas as partes envolvidas estejam cientes do escopo, cronograma, responsabilidades e canais de comunicação.',
    resultadosEsperados: [
      'Equipe interna e cliente alinhados sobre escopo e expectativas',
      'Responsabilidades e pontos focais definidos',
      'Cronograma e marcos principais acordados',
      'Canais de comunicação e periodicidade de reuniões estabelecidos',
      'Serviço oficialmente iniciado com status "Em Execução"',
    ],
    subFases: [
      {
        id: '3.1',
        codigo: '3.1',
        titulo: 'Reuniao de Kick-off',
        responsaveis: ['todos'],
        etapas: [
          {
            id: '3.1.1',
            codigo: '3.1.1',
            acao: 'Apresentacao do escopo do servico',
            entregavel: 'Escopo apresentado',
          },
          {
            id: '3.1.2',
            codigo: '3.1.2',
            acao: 'Cronograma geral',
            entregavel: 'Cronograma compartilhado',
          },
          {
            id: '3.1.3',
            codigo: '3.1.3',
            acao: 'Definicao da equipe',
            entregavel: 'Equipe definida (ver 3.2)',
          },
          {
            id: '3.1.4',
            codigo: '3.1.4',
            acao: 'Responsabilidades de cada um',
            entregavel: 'Matriz RACI',
          },
          {
            id: '3.1.5',
            codigo: '3.1.5',
            acao: 'Canais de comunicacao',
            entregavel: 'Canais definidos',
          },
          {
            id: '3.1.6',
            codigo: '3.1.6',
            acao: 'Proximos passos',
            entregavel: 'Acoes imediatas',
          },
        ],
      },
      {
        id: '3.2',
        codigo: '3.2',
        titulo: 'Definicao da Equipe do Servico',
        responsaveis: ['todos'],
        etapas: [
          {
            id: '3.2.1',
            codigo: '3.2.1',
            acao: 'Definir Comercial (Pos-venda)',
            entregavel: 'Relacionamento com cliente, medicoes, aditivos',
          },
          {
            id: '3.2.2',
            codigo: '3.2.2',
            acao: 'Definir Suprimentos',
            entregavel: 'Compras, logistica de materiais',
          },
          {
            id: '3.2.3',
            codigo: '3.2.3',
            acao: 'Definir Engenheiro Responsavel',
            entregavel: 'Gestao tecnica, qualidade, seguranca',
          },
          {
            id: '3.2.4',
            codigo: '3.2.4',
            acao: 'Definir Planejamento',
            entregavel: 'Acompanhamento de cronograma, indicadores',
          },
          {
            id: '3.2.5',
            codigo: '3.2.5',
            acao: 'Definir Execucao (Encarregado)',
            entregavel: 'Gestao da equipe de campo',
          },
          {
            id: '3.2.6',
            codigo: '3.2.6',
            acao: 'Definir Assistente',
            entregavel: 'Apoio administrativo, documentacao',
          },
        ],
      },
      {
        id: '3.3',
        codigo: '3.3',
        titulo: 'Liberacao para Execucao',
        responsaveis: ['engenharia'],
        etapas: [
          {
            id: '3.3.1',
            codigo: '3.3.1',
            acao: 'Contrato/Pedido assinado',
            entregavel: 'Checklist item 1',
          },
          {
            id: '3.3.2',
            codigo: '3.3.2',
            acao: 'Equipe definida e comunicada',
            entregavel: 'Checklist item 2',
          },
          {
            id: '3.3.3',
            codigo: '3.3.3',
            acao: 'Cronogramas validados',
            entregavel: 'Checklist item 3',
          },
          {
            id: '3.3.4',
            codigo: '3.3.4',
            acao: 'Materiais criticos em estoque ou em transito',
            entregavel: 'Checklist item 4',
          },
          {
            id: '3.3.5',
            codigo: '3.3.5',
            acao: 'Equipe de campo contratada ou alocada',
            entregavel: 'Checklist item 5',
          },
          {
            id: '3.3.6',
            codigo: '3.3.6',
            acao: 'Documentacao de seguranca aprovada',
            entregavel: 'Checklist item 6',
          },
          {
            id: '3.3.7',
            codigo: '3.3.7',
            acao: 'Ordem de servico emitida',
            entregavel: 'Checklist item 7 - Status "Em Andamento"',
          },
        ],
      },
    ],
  },
  {
    id: 'execucao',
    numero: 4,
    titulo: 'EXECUCAO',
    subtitulo: 'Projetos em Execucao',
    cor: 'green',
    icone: 'Play',
    responsaveisPrincipais: ['campo', 'engenharia', 'suprimentos', 'financeiro'],
    objetivo:
      'Executar as atividades técnicas conforme planejado, monitorando continuamente o progresso, qualidade e aderência ao cronograma, gerenciando riscos e comunicando desvios para garantir a entrega do serviço conforme especificado.',
    resultadosEsperados: [
      'Serviço executado conforme especificações técnicas',
      'Cronograma cumprido ou desvios justificados e gerenciados',
      'Qualidade validada através de inspeções e testes',
      'Documentação técnica (relatórios, RDOs, fotos) atualizada',
      'Cliente informado sobre progresso e eventuais alterações',
      'Serviço finalizado e pronto para encerramento',
    ],
    subFases: [
      // ========================================
      // 4.1 MOBILIZACAO E INICIO DE ATIVIDADES
      // ========================================
      {
        id: '4.1',
        codigo: '4.1',
        titulo: 'Mobilizacao e Inicio de Atividades',
        responsaveis: ['engenharia', 'rh', 'campo', 'suprimentos'],
        etapas: [
          {
            id: '4.1.1',
            codigo: '4.1.1',
            acao: 'Mobilizar equipe tecnica para o projeto',
            entregavel: 'Equipe mobilizada e alocada',
            detalhes: 'Confirmar disponibilidade, comunicar colaboradores, registrar no sistema de alocacao',
          },
          {
            id: '4.1.2',
            codigo: '4.1.2',
            acao: 'Instalar infraestrutura de canteiro',
            entregavel: 'Infraestrutura operacional instalada',
            detalhes: 'Containers, banheiros, almoxarifado, area de vivencia (quando aplicavel)',
          },
          {
            id: '4.1.3',
            codigo: '4.1.3',
            acao: 'Realizar reuniao de kickoff operacional',
            entregavel: 'Ata de kickoff com equipe',
            detalhes: 'Alinhar escopo, prazos, responsabilidades e regras de seguranca com toda equipe',
          },
          {
            id: '4.1.4',
            codigo: '4.1.4',
            acao: 'Emitir e registrar ART/RRT',
            entregavel: 'ART/RRT emitidas e registradas',
            detalhes: 'Responsabilidade tecnica formalizada junto ao CREA/CAU',
          },
          {
            id: '4.1.5',
            codigo: '4.1.5',
            acao: 'Emitir primeiro RDO e confirmar cronograma',
            entregavel: 'RDO inicial + Cronograma baseline confirmado',
            detalhes: 'Marcar data de inicio oficial e confirmar marcos do projeto',
          },
        ],
      },
      // ========================================
      // 4.2 EXECUCAO E MONITORAMENTO CONTINUO
      // ========================================
      {
        id: '4.2',
        codigo: '4.2',
        titulo: 'Execucao e Monitoramento Continuo',
        responsaveis: ['campo', 'engenharia'],
        etapas: [
          {
            id: '4.2.1',
            codigo: '4.2.1',
            acao: 'Executar atividades tecnicas conforme planejamento',
            entregavel: 'Servicos executados',
            detalhes: 'Seguir cronograma, especificacoes tecnicas e procedimentos de seguranca',
          },
          {
            id: '4.2.2',
            codigo: '4.2.2',
            acao: 'Emitir RDO diariamente',
            entregavel: 'RDO (Relatorio Diario de Obra)',
            detalhes: 'Registrar atividades, equipe, clima, ocorrencias e avanco do dia',
          },
          {
            id: '4.2.3',
            codigo: '4.2.3',
            acao: 'Realizar registro fotografico sistematico',
            entregavel: 'Acervo fotografico do projeto',
            detalhes: 'Fotos de antes/durante/depois, evidencias de qualidade e seguranca',
          },
          {
            id: '4.2.4',
            codigo: '4.2.4',
            acao: 'Atualizar controle de avanco fisico',
            entregavel: 'Planilha de avanco atualizada',
            detalhes: 'Percentual executado por atividade/etapa vs planejado',
          },
          {
            id: '4.2.5',
            codigo: '4.2.5',
            acao: 'Controlar horas e recursos da equipe',
            entregavel: 'Controle de horas/equipe',
            detalhes: 'Timesheet, controle de HE, afastamentos e produtividade',
          },
          {
            id: '4.2.6',
            codigo: '4.2.6',
            acao: 'Identificar e escalar desvios imediatamente',
            entregavel: 'Alertas de desvio registrados',
            detalhes: 'Comunicar engenharia/comercial sobre atrasos, problemas tecnicos ou riscos',
          },
        ],
      },
      // ========================================
      // 4.3 CONTROLE DE QUALIDADE E CONFORMIDADE
      // ========================================
      {
        id: '4.3',
        codigo: '4.3',
        titulo: 'Controle de Qualidade e Conformidade',
        responsaveis: ['engenharia', 'tecnico'],
        etapas: [
          {
            id: '4.3.1',
            codigo: '4.3.1',
            acao: 'Inspecionar qualidade das entregas tecnicas',
            entregavel: 'Relatorios de inspecao tecnica',
            detalhes: 'Verificar conformidade com especificacoes, normas e padroes de qualidade',
          },
          {
            id: '4.3.2',
            codigo: '4.3.2',
            acao: 'Realizar testes e ensaios necessarios',
            entregavel: 'Certificados de testes/ensaios',
            detalhes: 'Testes de pressao, estanqueidade, continuidade, laudos tecnicos',
          },
          {
            id: '4.3.3',
            codigo: '4.3.3',
            acao: 'Identificar e registrar nao-conformidades',
            entregavel: 'Registro de Nao-Conformidade (RNC)',
            detalhes: 'Documentar desvios, causas e impactos identificados',
          },
          {
            id: '4.3.4',
            codigo: '4.3.4',
            acao: 'Implementar acoes corretivas',
            entregavel: 'Plano de acao corretiva executado',
            detalhes: 'Corrigir nao-conformidades, documentar solucao e verificar eficacia',
          },
          {
            id: '4.3.5',
            codigo: '4.3.5',
            acao: 'Coletar evidencias de conformidade',
            entregavel: 'Dossiê de evidencias (fotos, laudos)',
            detalhes: 'Organizar documentacao comprobatoria para entrega ao cliente',
          },
        ],
      },
      // ========================================
      // 4.4 MEDICAO E FATURAMENTO
      // ========================================
      {
        id: '4.4',
        codigo: '4.4',
        titulo: 'Medicao e Faturamento',
        responsaveis: ['engenharia', 'comercial', 'financeiro'],
        etapas: [
          {
            id: '4.4.1',
            codigo: '4.4.1',
            acao: 'Medir avanco fisico-financeiro do projeto',
            entregavel: 'Memoria de calculo de avanco',
            detalhes: 'Levantar quantitativos executados conforme criterios contratuais',
          },
          {
            id: '4.4.2',
            codigo: '4.4.2',
            acao: 'Preparar boletim de medicao',
            entregavel: 'Boletim de medicao mensal',
            detalhes: 'Documento formal com valores a faturar no periodo',
          },
          {
            id: '4.4.3',
            codigo: '4.4.3',
            acao: 'Validar medicao com cliente',
            entregavel: 'Boletim aprovado pelo cliente',
            detalhes: 'Obter aceite formal do cliente para liberacao de faturamento',
          },
          {
            id: '4.4.4',
            codigo: '4.4.4',
            acao: 'Emitir nota fiscal de servico',
            entregavel: 'NFS-e emitida',
            detalhes: 'Faturar conforme medicao aprovada e condicoes contratuais',
          },
          {
            id: '4.4.5',
            codigo: '4.4.5',
            acao: 'Controlar recebiveis e inadimplencia',
            entregavel: 'Controle de recebiveis atualizado',
            detalhes: 'Acompanhar pagamentos, cobrar atrasos, atualizar fluxo de caixa',
          },
          {
            id: '4.4.6',
            codigo: '4.4.6',
            acao: 'Comparar faturamento vs planejado',
            entregavel: 'Relatorio de faturamento vs orcado',
            detalhes: 'Analisar desvios financeiros e tomar acoes corretivas',
          },
        ],
      },
      // ========================================
      // 4.5 GESTAO DE MUDANCAS E COMUNICACAO
      // ========================================
      {
        id: '4.5',
        codigo: '4.5',
        titulo: 'Gestao de Mudancas e Comunicacao com Cliente',
        responsaveis: ['engenharia', 'comercial'],
        etapas: [
          {
            id: '4.5.1',
            codigo: '4.5.1',
            acao: 'Gerenciar solicitacoes de mudanca',
            entregavel: 'Registro de mudanca aprovado',
            detalhes: 'Avaliar impacto em escopo, prazo e custo. Obter aprovacao formal',
          },
          {
            id: '4.5.2',
            codigo: '4.5.2',
            acao: 'Comunicar progresso ao cliente periodicamente',
            entregavel: 'Relatorio de progresso semanal/quinzenal',
            detalhes: 'Status do projeto, marcos atingidos, proximos passos, riscos',
          },
          {
            id: '4.5.3',
            codigo: '4.5.3',
            acao: 'Realizar reunioes de acompanhamento',
            entregavel: 'Atas de reuniao com cliente',
            detalhes: 'Registrar decisoes, pendencias e responsaveis',
          },
          {
            id: '4.5.4',
            codigo: '4.5.4',
            acao: 'Comunicar atrasos e riscos proativamente',
            entregavel: 'Comunicados oficiais',
            detalhes: 'Informar cliente sobre problemas antes que perguntem',
          },
          {
            id: '4.5.5',
            codigo: '4.5.5',
            acao: 'Documentar decisoes e acordos',
            entregavel: 'Registro de decisoes',
            detalhes: 'Formalizar por email ou documento todas as decisoes importantes',
          },
        ],
      },
      // ========================================
      // 4.6 ENCERRAMENTO E DESMOBILIZACAO
      // ========================================
      {
        id: '4.6',
        codigo: '4.6',
        titulo: 'Encerramento e Desmobilizacao',
        responsaveis: ['campo', 'engenharia', 'suprimentos'],
        etapas: [
          {
            id: '4.6.1',
            codigo: '4.6.1',
            acao: 'Concluir atividades tecnicas pendentes',
            entregavel: 'Punch list zerado',
            detalhes: 'Resolver todas as pendencias tecnicas antes do encerramento',
          },
          {
            id: '4.6.2',
            codigo: '4.6.2',
            acao: 'Realizar inspecao final e as-built',
            entregavel: 'Projeto as-built (conforme executado)',
            detalhes: 'Documentar situacao final com desenhos, fotos e memoriais',
          },
          {
            id: '4.6.3',
            codigo: '4.6.3',
            acao: 'Desmontar infraestrutura de canteiro',
            entregavel: 'Canteiro desmobilizado',
            detalhes: 'Retirar containers, equipamentos e limpar area',
          },
          {
            id: '4.6.4',
            codigo: '4.6.4',
            acao: 'Devolver equipamentos e materiais',
            entregavel: 'Termo de devolucao de equipamentos',
            detalhes: 'Devolver ferramentas, EPIs, materiais sobressalentes ao almoxarifado',
          },
          {
            id: '4.6.5',
            codigo: '4.6.5',
            acao: 'Compilar documentacao tecnica final',
            entregavel: 'Dossiê tecnico completo',
            detalhes: 'Reunir todos os documentos: RDOs, fotos, laudos, certificados, as-built',
          },
          {
            id: '4.6.6',
            codigo: '4.6.6',
            acao: 'Registrar licoes aprendidas',
            entregavel: 'Documento de licoes aprendidas',
            detalhes: 'O que funcionou, o que melhorar, recomendacoes para proximos projetos',
          },
          {
            id: '4.6.7',
            codigo: '4.6.7',
            acao: 'Desmobilizar equipe do projeto',
            entregavel: 'Equipe liberada/realocada',
            detalhes: 'Atualizar sistema de alocacao, comunicar RH sobre disponibilidade',
          },
        ],
      },
    ],
  },
]

export const MAPEAMENTO_SETOR_FASE: MapeamentoSetorFase[] = [
  {
    setor: 'comercial',
    label: 'Comercial',
    preServico: 'Captacao, Proposta',
    preparacao: '-',
    kickoff: 'Pos-venda definido',
    execucao: 'Relacionamento',
  },
  {
    setor: 'tecnico',
    label: 'Tecnico',
    preServico: 'Analise, Orcamento',
    preparacao: '-',
    kickoff: '-',
    execucao: 'Qualidade',
  },
  {
    setor: 'engenharia',
    label: 'Engenharia',
    preServico: '-',
    preparacao: 'Cronogramas, Planos',
    kickoff: 'Responsavel definido',
    execucao: 'Gestao tecnica',
  },
  {
    setor: 'suprimentos',
    label: 'Suprimentos',
    preServico: 'Custos',
    preparacao: 'Preparar entregas',
    kickoff: 'Comprador definido',
    execucao: 'Logistica',
  },
  {
    setor: 'rh',
    label: 'RH',
    preServico: '-',
    preparacao: 'Contratacoes',
    kickoff: '-',
    execucao: 'Gestao pessoas',
  },
  {
    setor: 'financeiro',
    label: 'Financeiro',
    preServico: 'Margem',
    preparacao: 'Fluxo caixa',
    kickoff: '-',
    execucao: 'Faturamento',
  },
  {
    setor: 'campo',
    label: 'Campo',
    preServico: '-',
    preparacao: '-',
    kickoff: 'Encarregado definido',
    execucao: 'Execucao fisica',
  },
]

export const FUNCOES_SERVICO: FuncaoServico[] = [
  { funcao: 'Comercial (Pos-venda)', responsabilidade: 'Relacionamento com cliente, medicoes, aditivos' },
  { funcao: 'Suprimentos', responsabilidade: 'Compras, logistica de materiais' },
  { funcao: 'Engenheiro Responsavel', responsabilidade: 'Gestao tecnica, qualidade, seguranca' },
  { funcao: 'Planejamento', responsabilidade: 'Acompanhamento de cronograma, indicadores' },
  { funcao: 'Execucao (Encarregado)', responsabilidade: 'Gestao da equipe de campo' },
  { funcao: 'Assistente', responsabilidade: 'Apoio administrativo, documentacao' },
]
