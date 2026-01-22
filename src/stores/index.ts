/**
 * Stores do Sistema AZ TECH
 */

export {
  useOrganoStore,
  selectColaboradores,
  selectSelectedId,
  selectExpandedIds,
  selectFilters,
  selectHasHydrated,
  selectFilteredColaboradores,
  selectSubordinados,
  selectColaboradorById,
  selectRootColaboradores,
  checkHierarchyCycle,
  getAllSubordinados,
  selectIsLoading as selectOrganoIsLoading,
  selectError as selectOrganoError,
} from './organoStore'

export {
  useConfigStore,
  selectNiveis,
  selectSetores,
  selectSubsetores,
  selectCargos,
  selectTiposProjeto,
  selectSetorById,
  selectNivelById,
  selectSubsetoresBySetorId,
  selectCargosByNivelId,
  selectIsLoading as selectConfigIsLoading,
  selectError as selectConfigError,
} from './configStore'

export { useVersionStore } from './versionStore'

export {
  usePlanejamentoStore,
  selectProjetos,
  selectFilters as selectPlanejamentoFilters,
  selectSelectedId as selectPlanejamentoSelectedId,
  selectIsLoading as selectPlanejamentoIsLoading,
  selectError as selectPlanejamentoError,
  selectHasHydrated as selectPlanejamentoHasHydrated,
  selectOpcoesEmpresas,
  selectOpcoesClientes,
  selectOpcoesCategorias,
  selectProjetosFiltrados,
} from './planejamentoStore'

export { useDashboardStore } from './dashboardStore'
