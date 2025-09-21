//general imports
import { useState, useCallback } from 'react'

export function useAcceptTerms() {
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false)

  const toggleAcceptTerms = useCallback(() => {
    setAcceptTerms((prev) => !prev)
  }, [])

  return { acceptTerms, toggleAcceptTerms }
}
