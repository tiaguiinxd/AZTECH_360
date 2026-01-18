/**
 * Utilitário para combinar classes do Tailwind
 * Usa clsx + tailwind-merge para conflitos de classes
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
