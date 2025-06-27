import { useState, useCallback } from 'react'

export function useAcceptTerms() {
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false)

  /**
   * Alterna o estado de aceite.
   * @returns void
   */
  const toggleAcceptTerms = useCallback(() => {
    setAcceptTerms((prev) => !prev)
  }, [])

  return { acceptTerms, toggleAcceptTerms }
}
