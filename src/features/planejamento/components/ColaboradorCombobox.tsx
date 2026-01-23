/**
 * ColaboradorCombobox - Combobox com search para selecionar colaborador
 *
 * Autocomplete com busca por nome ou cargo.
 * Mostra indicador de disponibilidade (quando disponível).
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import type { Colaborador } from '@/types/colaborador'
import type { DisponibilidadeColaborador } from '@/types/dashboard'

interface ColaboradorComboboxProps {
  colaboradores: Colaborador[]
  value: number | null
  onChange: (colaboradorId: number | null) => void
  placeholder?: string
  disabled?: boolean
  disponibilidades?: DisponibilidadeColaborador[]
  showDisponibilidade?: boolean
}

export function ColaboradorCombobox({
  colaboradores,
  value,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  disponibilidades = [],
  showDisponibilidade = true,
}: ColaboradorComboboxProps) {
  // ============ HOOKS ============

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Colaborador selecionado
  const selectedColaborador = useMemo(() => {
    return colaboradores.find((c) => c.id === value) || null
  }, [colaboradores, value])

  // Helper: Get disponibilidade for a colaborador
  const getDisponibilidade = useCallback(
    (colaboradorId: number) => {
      return disponibilidades.find((d) => d.colaborador_id === colaboradorId)
    },
    [disponibilidades]
  )

  // Helper: Get status color based on percentual_ocupado
  const getStatusColor = useCallback((percentualOcupado: number) => {
    if (percentualOcupado >= 100) return 'text-red-600' // Sobrecarga
    if (percentualOcupado >= 80) return 'text-yellow-600' // Quase cheio
    if (percentualOcupado >= 50) return 'text-yellow-500' // Moderado
    return 'text-green-600' // Disponível
  }, [])

  // Filtrar colaboradores por busca
  const filteredColaboradores = useMemo(() => {
    if (!searchQuery.trim()) return colaboradores

    const query = searchQuery.toLowerCase()
    return colaboradores.filter(
      (c) =>
        c.nome.toLowerCase().includes(query) ||
        c.cargo.toLowerCase().includes(query)
    )
  }, [colaboradores, searchQuery])

  // Disponibilidade do colaborador selecionado (memoizado)
  const selectedDisponibilidade = useMemo(() => {
    if (!showDisponibilidade || !disponibilidades.length || !selectedColaborador) {
      return null
    }
    const disp = getDisponibilidade(selectedColaborador.id)
    if (!disp) return null
    return {
      disponivel: 100 - disp.percentual_ocupado,
      percentualOcupado: disp.percentual_ocupado,
    }
  }, [showDisponibilidade, disponibilidades, selectedColaborador, getDisponibilidade])

  // ============ EFFECTS ============

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focar input ao abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Resetar highlightedIndex quando filtro mudar
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchQuery])

  // ============ HANDLERS ============

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
      setSearchQuery('')
    }
  }, [disabled])

  const handleSelect = useCallback(
    (colaboradorId: number) => {
      onChange(colaboradorId)
      setIsOpen(false)
      setSearchQuery('')
    },
    [onChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(null)
      setSearchQuery('')
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setHighlightedIndex(-1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredColaboradores.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredColaboradores.length - 1
        )
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault()
        handleSelect(filteredColaboradores[highlightedIndex].id)
      }
    },
    [filteredColaboradores, highlightedIndex, handleSelect]
  )

  // ============ RENDER ============

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="colaborador-listbox"
        aria-haspopup="listbox"
        aria-activedescendant={
          highlightedIndex >= 0 ? `option-${filteredColaboradores[highlightedIndex]?.id}` : undefined
        }
        className="w-full px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-aztech-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <span className={selectedColaborador ? 'text-gray-900' : 'text-gray-500'}>
          {selectedColaborador ? (
            <div className="flex items-center gap-2">
              <span>{selectedColaborador.nome}</span>
              {selectedDisponibilidade && (
                <span className={`text-xs ${getStatusColor(selectedDisponibilidade.percentualOcupado)}`}>
                  • {selectedDisponibilidade.disponivel}% disponível
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
        </span>
        <div className="flex items-center gap-1">
          {selectedColaborador && !disabled && (
            <X
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar por nome ou cargo..."
                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Options List */}
          <div id="colaborador-listbox" role="listbox" className="overflow-y-auto max-h-48">
            {filteredColaboradores.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                Nenhum resultado encontrado
              </div>
            ) : (
              filteredColaboradores.map((colaborador, index) => {
                const disp = getDisponibilidade(colaborador.id)
                const disponivel = disp ? 100 - disp.percentual_ocupado : null

                return (
                  <button
                    id={`option-${colaborador.id}`}
                    key={colaborador.id}
                    type="button"
                    role="option"
                    aria-selected={value === colaborador.id}
                    onClick={() => handleSelect(colaborador.id)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                      highlightedIndex === index ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {colaborador.nome}
                        </span>
                        {showDisponibilidade && disp && disponivel !== null && (
                          <span className={`text-xs font-medium ${getStatusColor(disp.percentual_ocupado)}`}>
                            {disponivel}% disponível
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{colaborador.cargo}</div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
