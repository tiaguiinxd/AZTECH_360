/**
 * Dados de Entregas por Setor - AZ TECH
 *
 * Este arquivo contém as entregas principais de cada setor
 * Baseado no fluxo operacional e nas melhores práticas de engenharia
 *
 * EDITÁVEL: Este arquivo pode ser modificado diretamente para adicionar,
 * remover ou atualizar entregas de cada setor
 */

import type { SetorInfo } from '../types'

export const SETORES: SetorInfo[] = [
  {
    id: 'comercial',
    nome: 'Comercial',
    descricao: 'Responsável pela captação de oportunidades, elaboração de propostas e negociação com clientes',
    cor: 'blue',
    icone: 'Briefcase',
    responsabilidadesPrincipais: [
      'Prospecção e qualificação de leads',
      'Elaboração de propostas comerciais',
      'Negociação de contratos e condições',
      'Relacionamento com clientes',
    ],
    entregas: [
      {
        id: 'com-001',
        nome: 'Briefing Inicial',
        descricao: 'Documento com informações preliminares do cliente e escopo macro da demanda',
        categoria: 'documento',
        formato: 'Word/PDF',
        prazoTipico: '1 dia útil',
        criteriosQualidade: [
          'Informações de contato completas',
          'Escopo macro identificado',
          'Canal de comunicação estabelecido',
        ],
        // Ponto de partida - sem dependências
      },
      {
        id: 'com-002',
        nome: 'Documento de Escopo Preliminar',
        descricao: 'Detalhamento inicial das necessidades do cliente e requisitos do projeto',
        categoria: 'documento',
        formato: 'Word/PDF',
        prazoTipico: '2-3 dias úteis',
        criteriosQualidade: [
          'Objetivos do projeto claros',
          'Localização e acesso ao site identificados',
          'Restrições e requisitos especiais mapeados',
        ],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-001',
            descricao: 'Briefing inicial do cliente',
          },
        ],
      },
      {
        id: 'com-003',
        nome: 'Proposta Comercial',
        descricao: 'Proposta formal com escopo, prazos, valores e condições comerciais',
        categoria: 'apresentacao',
        formato: 'PDF/PowerPoint',
        prazoTipico: '1-2 dias úteis',
        criteriosQualidade: [
          'Escopo técnico detalhado',
          'Cronograma macro apresentado',
          'Preços e condições de pagamento claros',
          'Layout profissional e identidade visual AZ TECH',
        ],
        exemplos: ['Template de Proposta Comercial v2.0'],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-002',
            descricao: 'Escopo preliminar detalhado',
          },
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-001',
            descricao: 'Planilha de custos preliminar',
          },
        ],
      },
      {
        id: 'com-004',
        nome: 'Contrato de Serviços',
        descricao: 'Contrato formalizado com todas as cláusulas e condições acordadas',
        categoria: 'documento',
        formato: 'PDF',
        prazoTipico: '3-5 dias úteis',
        criteriosQualidade: [
          'Revisado pelo jurídico',
          'Todas as cláusulas negociadas incluídas',
          'Assinaturas de ambas as partes',
        ],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-003',
            descricao: 'Proposta comercial aprovada pelo cliente',
          },
        ],
      },
      {
        id: 'com-005',
        nome: 'Cadastro de Cliente no Sistema',
        descricao: 'Registro completo do cliente e serviço no sistema de gestão',
        categoria: 'cadastro',
        formato: 'Sistema',
        prazoTipico: '30 minutos',
        criteriosQualidade: [
          'Dados cadastrais completos',
          'Documentos anexados',
          'Status "Prospecção" ou "Contratado" atribuído',
        ],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-004',
            descricao: 'Contrato assinado',
          },
        ],
      },
    ],
  },
  {
    id: 'financeiro',
    nome: 'Financeiro',
    descricao: 'Responsável por análise de margem, fluxo de caixa e controle financeiro',
    cor: 'green',
    icone: 'DollarSign',
    responsabilidadesPrincipais: [
      'Análise de viabilidade financeira',
      'Controle de fluxo de caixa',
      'Faturamento e cobrança',
      'Gestão de margens e rentabilidade',
    ],
    entregas: [
      {
        id: 'fin-001',
        nome: 'Análise de Margem',
        descricao: 'Validação da margem de lucro e viabilidade financeira do projeto',
        categoria: 'analise',
        formato: 'Excel',
        prazoTipico: '4 horas',
        criteriosQualidade: [
          'Margem de lucro calculada',
          'Impostos e tributos considerados',
          'Aprovação formal do financeiro',
        ],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-003',
            descricao: 'Proposta comercial com valores',
          },
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-001',
            descricao: 'Planilha de custos detalhada',
          },
        ],
      },
      {
        id: 'fin-002',
        nome: 'Fluxo de Caixa Projetado',
        descricao: 'Projeção de entradas e saídas ao longo do projeto',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: '1 dia útil',
        criteriosQualidade: [
          'Entradas e saídas mensais projetadas',
          'Capital de giro necessário identificado',
          'Momento de break-even calculado',
        ],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-004',
            descricao: 'Contrato com condições de pagamento',
          },
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-001',
            descricao: 'Cronograma para projetar entradas/saídas',
          },
        ],
      },
      {
        id: 'fin-003',
        nome: 'Fatura de Serviços',
        descricao: 'Nota fiscal de serviços prestados conforme medições',
        categoria: 'documento',
        formato: 'XML/PDF',
        prazoTipico: '2 dias úteis',
        criteriosQualidade: [
          'Conforme medição aprovada',
          'Impostos calculados corretamente',
          'Dados do cliente corretos',
        ],
        dependencias: [
          {
            setorOrigem: 'operacao',
            entregaId: 'ope-003',
            descricao: 'Medição de serviços aprovada',
          },
        ],
      },
      {
        id: 'fin-004',
        nome: 'Relatório de Rentabilidade',
        descricao: 'Análise de rentabilidade real vs. planejada do projeto',
        categoria: 'relatorio',
        formato: 'Excel/PDF',
        prazoTipico: 'Mensal',
        criteriosQualidade: [
          'Comparativo real vs. orçado',
          'Desvios justificados',
          'Projeções de resultado final',
        ],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-003',
            descricao: 'Pedidos de compra (custos reais)',
          },
          {
            setorOrigem: 'financeiro',
            entregaId: 'fin-003',
            descricao: 'Faturas emitidas (receitas)',
          },
        ],
      },
      {
        id: 'fin-005',
        nome: 'Controle de Recebíveis',
        descricao: 'Acompanhamento de faturas a receber e inadimplência',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: 'Semanal',
        criteriosQualidade: [
          'Todas as faturas listadas',
          'Status de pagamento atualizado',
          'Ações de cobrança registradas',
        ],
        dependencias: [
          {
            setorOrigem: 'financeiro',
            entregaId: 'fin-003',
            descricao: 'Faturas emitidas',
          },
        ],
      },
    ],
  },
  {
    id: 'suprimentos',
    nome: 'Suprimentos / Logística / Frotas',
    descricao: 'Responsável por cotações, compras, logística de transporte e armazenagem, gestão de fornecedores e controle de frotas',
    cor: 'amber',
    icone: 'Package',
    responsabilidadesPrincipais: [
      'Cotação de materiais e serviços',
      'Compras e negociação com fornecedores',
      'Logística de transporte e armazenagem',
      'Controle de estoque e distribuição',
      'Gestão e manutenção de frotas',
      'Controle de abastecimento e combustível',
    ],
    entregas: [
      {
        id: 'sup-001',
        nome: 'Planilha de Custos Preliminar',
        descricao: 'Levantamento de custos com base em cotações de mercado',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: '3-5 dias úteis',
        criteriosQualidade: [
          'Pelo menos 3 cotações por item principal',
          'Custos de mão de obra estimados',
          'Contingências incluídas (5-10%)',
        ],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-002',
            descricao: 'Escopo preliminar para levantar custos',
          },
        ],
      },
      {
        id: 'sup-002',
        nome: 'Mapa de Cotações',
        descricao: 'Comparativo de fornecedores com preços, prazos e condições',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: '5-7 dias úteis',
        criteriosQualidade: [
          'Mínimo 3 fornecedores por item',
          'Prazos de entrega confirmados',
          'Condições de pagamento negociadas',
        ],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-001',
            descricao: 'Planilha de custos para identificar itens a cotar',
          },
        ],
      },
      {
        id: 'sup-003',
        nome: 'Pedido de Compra (PC)',
        descricao: 'Documento formal de compra emitido ao fornecedor',
        categoria: 'documento',
        formato: 'PDF/Sistema',
        prazoTipico: '1 dia útil',
        criteriosQualidade: [
          'Especificações técnicas anexadas',
          'Prazos e condições de entrega claros',
          'Aprovação do solicitante e gestor',
        ],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-002',
            descricao: 'Mapa de cotações para escolher fornecedor',
          },
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-001',
            descricao: 'Cronograma para definir prazos de entrega',
          },
        ],
      },
      {
        id: 'sup-004',
        nome: 'Controle de Entregas',
        descricao: 'Planilha de acompanhamento de entregas e recebimentos',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: 'Contínuo',
        criteriosQualidade: [
          'Status de todas as compras atualizado',
          'Divergências registradas',
          'Ações corretivas documentadas',
        ],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-003',
            descricao: 'Pedidos de compra para acompanhar',
          },
        ],
      },
      {
        id: 'sup-005',
        nome: 'Avaliação de Fornecedores',
        descricao: 'Avaliação periódica de desempenho dos fornecedores',
        categoria: 'relatorio',
        formato: 'Excel/PDF',
        prazoTipico: 'Mensal',
        criteriosQualidade: [
          'Critérios objetivos de avaliação',
          'Nota por fornecedor',
          'Recomendações de manutenção ou substituição',
        ],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-004',
            descricao: 'Histórico de entregas para avaliar desempenho',
          },
        ],
      },
      {
        id: 'sup-006',
        nome: 'Plano de Transporte',
        descricao: 'Planejamento logístico de movimentação de materiais e equipamentos',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: '2-3 dias úteis',
        criteriosQualidade: [
          'Rotas otimizadas definidas',
          'Prazos de entrega estimados',
          'Custos de frete calculados',
          'Veículos e motoristas alocados',
        ],
        exemplos: ['Transporte de equipamentos para obra', 'Distribuição de materiais entre canteiros'],
        dependencias: [
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-001',
            descricao: 'Cronograma para alinhar logística com execução',
          },
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-003',
            descricao: 'Pedidos de compra para planejar transporte',
          },
        ],
      },
      {
        id: 'sup-007',
        nome: 'Controle de Armazenagem',
        descricao: 'Gestão de estoque em almoxarifado e canteiros de obra',
        categoria: 'planilha',
        formato: 'Excel/Sistema',
        prazoTipico: 'Contínuo',
        criteriosQualidade: [
          'Entradas e saídas registradas',
          'Saldo atualizado por item',
          'Localização física identificada',
          'Inventário periódico realizado',
        ],
        exemplos: ['Controle de EPIs', 'Estoque de materiais de construção', 'Ferramentas e equipamentos'],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-004',
            descricao: 'Controle de entregas para registrar entradas',
          },
        ],
      },
      {
        id: 'sup-008',
        nome: 'Romaneio de Carga',
        descricao: 'Documento detalhado de itens transportados em cada viagem',
        categoria: 'documento',
        formato: 'PDF/Papel',
        prazoTipico: 'Por transporte',
        criteriosQualidade: [
          'Lista completa de itens com quantidades',
          'Assinatura do motorista e conferente',
          'Data e hora de saída/chegada',
          'Observações sobre condições de transporte',
        ],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-006',
            descricao: 'Plano de transporte para gerar romaneio',
          },
        ],
      },
      {
        id: 'sup-009',
        nome: 'Controle de Veículos',
        descricao: 'Cadastro e acompanhamento da frota de veículos da empresa',
        categoria: 'planilha',
        formato: 'Excel/Sistema',
        prazoTipico: 'Contínuo',
        criteriosQualidade: [
          'Dados do veículo (placa, modelo, ano)',
          'Quilometragem atualizada',
          'Documentação em dia (IPVA, seguro, licenciamento)',
          'Histórico de uso e alocações',
        ],
        exemplos: ['Caminhões', 'Veículos leves', 'Máquinas e equipamentos'],
        // Cadastro base - sem dependências diretas
      },
      {
        id: 'sup-010',
        nome: 'Manutenção Preventiva de Frotas',
        descricao: 'Cronograma e registro de manutenções preventivas dos veículos',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: 'Mensal',
        criteriosQualidade: [
          'Cronograma de manutenções por veículo',
          'Itens verificados (óleo, freios, pneus, etc.)',
          'Custos de manutenção registrados',
          'Oficinas e fornecedores avaliados',
        ],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-009',
            descricao: 'Controle de veículos para planejar manutenções',
          },
        ],
      },
      {
        id: 'sup-011',
        nome: 'Controle de Abastecimento',
        descricao: 'Registro de abastecimentos e consumo de combustível',
        categoria: 'planilha',
        formato: 'Excel/Sistema',
        prazoTipico: 'Contínuo',
        criteriosQualidade: [
          'Data, km e litros de cada abastecimento',
          'Cálculo de consumo médio (km/l)',
          'Custos totais por veículo',
          'Alertas de consumo anormal',
        ],
        exemplos: ['Controle de diesel', 'Gasolina', 'Etanol'],
        dependencias: [
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-009',
            descricao: 'Controle de veículos para rastrear abastecimentos',
          },
        ],
      },
    ],
  },
  {
    id: 'engenharia',
    nome: 'Engenharia',
    descricao: 'Responsável pelo planejamento detalhado, acompanhamento técnico e controle de qualidade',
    cor: 'indigo',
    icone: 'Cog',
    responsabilidadesPrincipais: [
      'Planejamento executivo detalhado',
      'Acompanhamento técnico da execução',
      'Controle de qualidade',
      'Gestão de mudanças e RDOs',
    ],
    entregas: [
      {
        id: 'eng-001',
        nome: 'Cronograma Detalhado de Execução',
        descricao: 'Cronograma executivo com todas as atividades, recursos e dependências',
        categoria: 'planilha',
        formato: 'MS Project/Excel',
        prazoTipico: '3-5 dias úteis',
        criteriosQualidade: [
          'Todas as atividades identificadas',
          'Recursos alocados',
          'Caminho crítico definido',
        ],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-004',
            descricao: 'Contrato assinado com escopo e prazos definidos',
          },
          {
            setorOrigem: 'comercial',
            entregaId: 'com-002',
            descricao: 'Escopo preliminar detalhado',
          },
        ],
      },
      {
        id: 'eng-002',
        nome: 'Plano de Qualidade',
        descricao: 'Documento definindo critérios de aceitação e procedimentos de inspeção',
        categoria: 'documento',
        formato: 'Word/PDF',
        prazoTipico: '2-3 dias úteis',
        criteriosQualidade: [
          'Critérios de aceitação definidos',
          'Procedimentos de inspeção documentados',
          'Responsáveis pela qualidade nomeados',
        ],
        dependencias: [
          {
            setorOrigem: 'comercial',
            entregaId: 'com-002',
            descricao: 'Escopo preliminar com requisitos de qualidade',
          },
        ],
      },
      {
        id: 'eng-003',
        nome: 'Plano de Mobilização',
        descricao: 'Planejamento de mobilização de equipe, equipamentos e recursos',
        categoria: 'documento',
        formato: 'Word/PDF',
        prazoTipico: '2 dias úteis',
        criteriosQualidade: [
          'Recursos necessários identificados',
          'Prazos de mobilização definidos',
          'Responsáveis pela mobilização nomeados',
        ],
        dependencias: [
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-001',
            descricao: 'Cronograma para definir quando mobilizar recursos',
          },
          {
            setorOrigem: 'rh',
            entregaId: 'rh-003',
            descricao: 'Documentação de admissão dos colaboradores',
          },
        ],
      },
      {
        id: 'eng-004',
        nome: 'Relatório Diário de Obra (RDO)',
        descricao: 'Registro diário de atividades, clima, equipe e ocorrências',
        categoria: 'relatorio',
        formato: 'PDF/Sistema',
        prazoTipico: 'Diário',
        criteriosQualidade: [
          'Atividades do dia registradas',
          'Efetivo de pessoal anotado',
          'Condições climáticas e ocorrências documentadas',
        ],
        // Registro diário - sem dependências, gerado durante execução
      },
      {
        id: 'eng-005',
        nome: 'Relatório de Progresso',
        descricao: 'Relatório semanal/mensal de avanço físico e desvios',
        categoria: 'relatorio',
        formato: 'PowerPoint/PDF',
        prazoTipico: 'Semanal',
        criteriosQualidade: [
          'Percentual de avanço físico calculado',
          'Comparativo planejado vs. executado',
          'Desvios e ações corretivas documentados',
        ],
        dependencias: [
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-001',
            descricao: 'Cronograma para comparar planejado vs. executado',
          },
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-004',
            descricao: 'RDOs para compilar atividades realizadas',
          },
        ],
      },
      {
        id: 'eng-006',
        nome: 'As-Built / Projeto Final',
        descricao: 'Documentação técnica final conforme executado',
        categoria: 'projeto',
        formato: 'PDF/DWG',
        prazoTipico: '5-10 dias úteis',
        criteriosQualidade: [
          'Reflete fielmente o executado',
          'Todas as alterações incorporadas',
          'Aprovado pelo cliente',
        ],
        dependencias: [
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-004',
            descricao: 'RDOs com registro de alterações executadas',
          },
          {
            setorOrigem: 'operacao',
            entregaId: 'ope-004',
            descricao: 'Registro fotográfico do executado',
          },
        ],
      },
      {
        id: 'eng-007',
        nome: 'Relatório de Não Conformidade',
        descricao: 'Registro de desvios de qualidade ou segurança identificados',
        categoria: 'relatorio',
        formato: 'PDF/Sistema',
        prazoTipico: 'Sob demanda',
        criteriosQualidade: [
          'Descrição clara da não conformidade',
          'Causa raiz identificada',
          'Ação corretiva definida',
          'Responsável pela correção nomeado',
        ],
        exemplos: ['Desvio dimensional', 'Material fora da especificação', 'Procedimento não seguido'],
        // Sob demanda - sem dependências fixas
      },
    ],
  },
  {
    id: 'rh',
    nome: 'Recursos Humanos',
    descricao: 'Responsável pela seleção, contratação, treinamento e gestão de pessoas',
    cor: 'pink',
    icone: 'Users',
    responsabilidadesPrincipais: [
      'Recrutamento e seleção',
      'Contratação e admissão',
      'Treinamentos e capacitações',
      'Gestão de desempenho e clima',
    ],
    entregas: [
      {
        id: 'rh-001',
        nome: 'Requisição de Pessoal',
        descricao: 'Solicitação formal de contratação com perfil e requisitos',
        categoria: 'documento',
        formato: 'Sistema/PDF',
        prazoTipico: '1 dia útil',
        criteriosQualidade: [
          'Cargo e função claramente definidos',
          'Requisitos técnicos especificados',
          'Aprovação do gestor',
        ],
        dependencias: [
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-003',
            descricao: 'Plano de mobilização com necessidades de pessoal',
          },
        ],
      },
      {
        id: 'rh-002',
        nome: 'Lista de Candidatos Pré-Selecionados',
        descricao: 'Relação de candidatos triados para entrevista técnica',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: '5-7 dias úteis',
        criteriosQualidade: [
          'Currículos anexados',
          'Avaliação preliminar realizada',
          'Disponibilidade confirmada',
        ],
        dependencias: [
          {
            setorOrigem: 'rh',
            entregaId: 'rh-001',
            descricao: 'Requisição de pessoal com perfil definido',
          },
        ],
      },
      {
        id: 'rh-003',
        nome: 'Documentação de Admissão',
        descricao: 'Pacote completo de documentos para contratação',
        categoria: 'documento',
        formato: 'PDF',
        prazoTipico: '2-3 dias úteis',
        criteriosQualidade: [
          'Todos os documentos legais coletados',
          'Exames médicos realizados',
          'Registro em sistema',
        ],
        dependencias: [
          {
            setorOrigem: 'rh',
            entregaId: 'rh-002',
            descricao: 'Candidato aprovado na seleção',
          },
        ],
      },
      {
        id: 'rh-004',
        nome: 'Programa de Integração',
        descricao: 'Apresentação da empresa, políticas e procedimentos ao novo colaborador',
        categoria: 'apresentacao',
        formato: 'PowerPoint/Vídeo',
        prazoTipico: '1 dia útil',
        criteriosQualidade: [
          'Apresentação institucional completa',
          'Políticas e procedimentos explicados',
          'Registro de participação assinado',
        ],
        dependencias: [
          {
            setorOrigem: 'dp',
            entregaId: 'dp-005',
            descricao: 'Admissão de colaborador registrada',
          },
        ],
      },
      {
        id: 'rh-005',
        nome: 'Plano de Treinamento',
        descricao: 'Programação de treinamentos técnicos e comportamentais',
        categoria: 'documento',
        formato: 'Excel/PDF',
        prazoTipico: 'Anual/Semestral',
        criteriosQualidade: [
          'Necessidades de capacitação identificadas',
          'Cronograma de treinamentos definido',
          'Orçamento estimado',
        ],
        dependencias: [
          {
            setorOrigem: 'rh',
            entregaId: 'rh-006',
            descricao: 'Avaliação de desempenho para identificar lacunas de competência',
          },
        ],
      },
      {
        id: 'rh-006',
        nome: 'Avaliação de Desempenho',
        descricao: 'Avaliação periódica de performance e competências dos colaboradores',
        categoria: 'documento',
        formato: 'Sistema/PDF',
        prazoTipico: 'Semestral/Anual',
        criteriosQualidade: [
          'Critérios objetivos e subjetivos avaliados',
          'Feedback estruturado fornecido',
          'Plano de desenvolvimento individual criado',
        ],
        dependencias: [
          {
            setorOrigem: 'dp',
            entregaId: 'dp-005',
            descricao: 'Colaboradores admitidos para avaliar',
          },
        ],
      },
    ],
  },
  {
    id: 'dp',
    nome: 'Departamento Pessoal',
    descricao: 'Responsável pela folha de pagamento, benefícios, ponto e obrigações trabalhistas',
    cor: 'purple',
    icone: 'FileText',
    responsabilidadesPrincipais: [
      'Processamento de folha de pagamento',
      'Gestão de benefícios',
      'Controle de ponto e frequência',
      'Cumprimento de obrigações trabalhistas',
    ],
    entregas: [
      {
        id: 'dp-001',
        nome: 'Folha de Pagamento',
        descricao: 'Processamento mensal de salários, encargos e impostos',
        categoria: 'planilha',
        formato: 'Sistema/Excel',
        prazoTipico: 'Mensal',
        criteriosQualidade: [
          'Todos os colaboradores incluídos',
          'Horas extras e descontos calculados',
          'Encargos e impostos apurados',
          'Comprovantes de pagamento gerados',
        ],
        dependencias: [
          {
            setorOrigem: 'dp',
            entregaId: 'dp-002',
            descricao: 'Controle de ponto com horas trabalhadas',
          },
          {
            setorOrigem: 'dp',
            entregaId: 'dp-005',
            descricao: 'Admissões de colaboradores processadas',
          },
        ],
      },
      {
        id: 'dp-002',
        nome: 'Controle de Ponto',
        descricao: 'Registro e consolidação de jornada de trabalho dos colaboradores',
        categoria: 'planilha',
        formato: 'Sistema',
        prazoTipico: 'Diário/Mensal',
        criteriosQualidade: [
          'Marcações de ponto registradas',
          'Horas extras calculadas',
          'Inconsistências tratadas',
        ],
        // Registro diário/contínuo - sem dependências diretas
      },
      {
        id: 'dp-003',
        nome: 'Guia de Recolhimento (FGTS/INSS)',
        descricao: 'Documentos de recolhimento de encargos sociais',
        categoria: 'documento',
        formato: 'PDF/Sistema',
        prazoTipico: 'Mensal',
        criteriosQualidade: [
          'Valores calculados corretamente',
          'Prazos de vencimento respeitados',
          'Comprovantes de pagamento arquivados',
        ],
        dependencias: [
          {
            setorOrigem: 'dp',
            entregaId: 'dp-001',
            descricao: 'Folha de pagamento com valores dos encargos',
          },
        ],
      },
      {
        id: 'dp-004',
        nome: 'Gestão de Benefícios',
        descricao: 'Controle de vale-transporte, vale-refeição, plano de saúde e outros benefícios',
        categoria: 'planilha',
        formato: 'Excel/Sistema',
        prazoTipico: 'Mensal',
        criteriosQualidade: [
          'Todos os beneficiários listados',
          'Valores atualizados',
          'Fornecedores pagos em dia',
        ],
        dependencias: [
          {
            setorOrigem: 'dp',
            entregaId: 'dp-005',
            descricao: 'Admissões com definição de benefícios',
          },
        ],
      },
      {
        id: 'dp-005',
        nome: 'Admissão de Colaborador',
        descricao: 'Registro trabalhista e contratual do novo colaborador',
        categoria: 'cadastro',
        formato: 'Sistema',
        prazoTipico: '2 dias úteis',
        criteriosQualidade: [
          'Registro em carteira de trabalho',
          'Cadastro no e-Social',
          'Contrato de trabalho assinado',
        ],
        dependencias: [
          {
            setorOrigem: 'rh',
            entregaId: 'rh-003',
            descricao: 'Documentação de admissão completa',
          },
        ],
      },
      {
        id: 'dp-006',
        nome: 'Rescisão de Contrato',
        descricao: 'Processamento de desligamento e cálculos rescisórios',
        categoria: 'documento',
        formato: 'Sistema/PDF',
        prazoTipico: '1-2 dias úteis',
        criteriosQualidade: [
          'Cálculos rescisórios corretos',
          'Baixa na carteira de trabalho',
          'Homologação sindical (se aplicável)',
        ],
        // Sob demanda - dependências variáveis conforme motivo do desligamento
      },
    ],
  },
  {
    id: 'operacao',
    nome: 'Operação',
    descricao: 'Responsável pela execução física das atividades, operação de equipamentos e segurança',
    cor: 'orange',
    icone: 'HardHat',
    responsabilidadesPrincipais: [
      'Execução das atividades técnicas',
      'Operação de equipamentos',
      'Segurança do trabalho',
      'Registro de atividades e medições',
    ],
    entregas: [
      {
        id: 'ope-001',
        nome: 'Análise Preliminar de Risco (APR)',
        descricao: 'Identificação de riscos e medidas de controle antes do início das atividades',
        categoria: 'documento',
        formato: 'PDF/Sistema',
        prazoTipico: 'Diário',
        criteriosQualidade: [
          'Todos os riscos identificados',
          'Medidas de controle definidas',
          'Assinado por encarregado e equipe',
        ],
        dependencias: [
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-001',
            descricao: 'Cronograma com atividades a serem executadas',
          },
        ],
      },
      {
        id: 'ope-002',
        nome: 'Diálogo Diário de Segurança (DDS)',
        descricao: 'Registro de conversa diária sobre segurança com a equipe',
        categoria: 'documento',
        formato: 'PDF/Sistema',
        prazoTipico: 'Diário',
        criteriosQualidade: [
          'Tema relevante abordado',
          'Participantes registrados',
          'Dúvidas e sugestões anotadas',
        ],
        // Registro diário - sem dependências diretas
      },
      {
        id: 'ope-003',
        nome: 'Medição de Serviços',
        descricao: 'Quantificação dos serviços executados para faturamento',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: 'Semanal/Quinzenal',
        criteriosQualidade: [
          'Quantidades conferidas in loco',
          'Fotos e evidências anexadas',
          'Aprovação do cliente',
        ],
        dependencias: [
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-001',
            descricao: 'Cronograma com serviços planejados para medir',
          },
          {
            setorOrigem: 'operacao',
            entregaId: 'ope-004',
            descricao: 'Registro fotográfico como evidência',
          },
        ],
      },
      {
        id: 'ope-004',
        nome: 'Registro Fotográfico',
        descricao: 'Documentação visual do andamento e condições da obra',
        categoria: 'relatorio',
        formato: 'PDF/Pasta',
        prazoTipico: 'Semanal',
        criteriosQualidade: [
          'Fotos datadas e geolocalizadas',
          'Cobertura de todas as frentes de trabalho',
          'Organização por data/atividade',
        ],
        // Registro contínuo - sem dependências diretas
      },
      {
        id: 'ope-005',
        nome: 'Controle de EPI/EPC',
        descricao: 'Registro de entrega e inspeção de equipamentos de proteção',
        categoria: 'planilha',
        formato: 'Excel',
        prazoTipico: 'Semanal',
        criteriosQualidade: [
          'Todos os colaboradores listados',
          'EPIs entregues registrados',
          'Condições dos EPCs inspecionadas',
        ],
        dependencias: [
          {
            setorOrigem: 'dp',
            entregaId: 'dp-005',
            descricao: 'Colaboradores admitidos para controlar EPIs',
          },
          {
            setorOrigem: 'suprimentos',
            entregaId: 'sup-007',
            descricao: 'Controle de armazenagem de EPIs',
          },
        ],
      },
    ],
  },
  {
    id: 'diretoria',
    nome: 'Diretoria',
    descricao: 'Responsável pela gestão estratégica, governança e tomada de decisões corporativas',
    cor: 'gray',
    icone: 'Building2',
    responsabilidadesPrincipais: [
      'Definição de estratégia e diretrizes',
      'Aprovação de investimentos e projetos',
      'Governança corporativa',
      'Relacionamento com stakeholders',
    ],
    entregas: [
      {
        id: 'dir-001',
        nome: 'Plano Estratégico Anual',
        descricao: 'Definição de objetivos, metas e diretrizes estratégicas da empresa',
        categoria: 'documento',
        formato: 'PowerPoint/PDF',
        prazoTipico: 'Anual',
        criteriosQualidade: [
          'Análise SWOT realizada',
          'Objetivos estratégicos definidos',
          'Metas mensuráveis estabelecidas',
          'Planos de ação priorizados',
        ],
        dependencias: [
          {
            setorOrigem: 'diretoria',
            entregaId: 'dir-002',
            descricao: 'Relatórios gerenciais do ano anterior para análise',
          },
          {
            setorOrigem: 'financeiro',
            entregaId: 'fin-004',
            descricao: 'Relatório de rentabilidade para embasar estratégia',
          },
        ],
      },
      {
        id: 'dir-002',
        nome: 'Relatório Gerencial Executivo',
        descricao: 'Consolidação de indicadores estratégicos e resultados da empresa',
        categoria: 'relatorio',
        formato: 'PowerPoint/PDF',
        prazoTipico: 'Mensal',
        criteriosQualidade: [
          'KPIs principais apresentados',
          'Desvios e tendências analisados',
          'Decisões estratégicas documentadas',
        ],
        dependencias: [
          {
            setorOrigem: 'financeiro',
            entregaId: 'fin-004',
            descricao: 'Relatório de rentabilidade',
          },
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-005',
            descricao: 'Relatório de progresso dos projetos',
          },
          {
            setorOrigem: 'comercial',
            entregaId: 'com-005',
            descricao: 'Cadastros de clientes e pipeline comercial',
          },
        ],
      },
      {
        id: 'dir-003',
        nome: 'Ata de Reunião de Diretoria',
        descricao: 'Registro de decisões e deliberações da diretoria',
        categoria: 'documento',
        formato: 'Word/PDF',
        prazoTipico: 'Por reunião',
        criteriosQualidade: [
          'Participantes identificados',
          'Decisões claramente documentadas',
          'Responsáveis e prazos definidos',
        ],
        dependencias: [
          {
            setorOrigem: 'diretoria',
            entregaId: 'dir-002',
            descricao: 'Relatório gerencial como pauta da reunião',
          },
        ],
      },
      {
        id: 'dir-004',
        nome: 'Aprovação de Orçamento Anual',
        descricao: 'Orçamento consolidado da empresa aprovado pela diretoria',
        categoria: 'documento',
        formato: 'Excel/PDF',
        prazoTipico: 'Anual',
        criteriosQualidade: [
          'Receitas e despesas projetadas',
          'Investimentos aprovados',
          'Aprovação formal da diretoria',
        ],
        dependencias: [
          {
            setorOrigem: 'diretoria',
            entregaId: 'dir-001',
            descricao: 'Plano estratégico anual para alinhar orçamento',
          },
          {
            setorOrigem: 'financeiro',
            entregaId: 'fin-002',
            descricao: 'Fluxo de caixa projetado',
          },
        ],
      },
      {
        id: 'dir-005',
        nome: 'Relatório de Governança e Compliance',
        descricao: 'Relatório de aderência a políticas, normas e regulamentações',
        categoria: 'relatorio',
        formato: 'PDF',
        prazoTipico: 'Trimestral',
        criteriosQualidade: [
          'Riscos corporativos mapeados',
          'Controles internos avaliados',
          'Não conformidades tratadas',
        ],
        dependencias: [
          {
            setorOrigem: 'engenharia',
            entregaId: 'eng-007',
            descricao: 'Relatórios de não conformidade para análise',
          },
          {
            setorOrigem: 'financeiro',
            entregaId: 'fin-004',
            descricao: 'Relatórios de rentabilidade para controles financeiros',
          },
        ],
      },
    ],
  },
]
