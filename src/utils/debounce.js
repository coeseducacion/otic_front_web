/**
 * Crea una función con debounce (compatible con async)
 * @param {Function} fn - Función a ejecutar (puede ser async)
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {Function} - Función con debounce aplicado
 */
export function debounce(fn, delay = 500) {
  let timeoutId = null
  
  return function (...args) {
    // Limpiar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // Crear nuevo timeout
    timeoutId = setTimeout(() => {
      Promise.resolve(fn.apply(this, args)).catch(err => {
        console.error('Error en función debounced:', err)
      })
    }, delay)
  }
}

/**
 * Hook para usar debounce con refs en Vue (compatible con async)
 * @param {Function} callback - Función a ejecutar (puede ser async)
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {Function} - Función debounced con método cancel
 */
export function useDebounce(callback, delay = 500) {
  let timeoutId = null
  
  const debouncedFn = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      Promise.resolve(callback(...args)).catch(err => {
        console.error('Error en función debounced:', err)
      })
    }, delay)
  }
  
  // Función para cancelar el debounce
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  return debouncedFn
}
