import { useState, startTransition, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useOptimizedNavigation = () => {
  const navigate = useNavigate()
  const [isPending, setIsPending] = useState(false)

  const optimizedNavigate = useCallback((to, options = {}) => {
    setIsPending(true)
    
    startTransition(() => {
      navigate(to, options)
      setIsPending(false)
    })
  }, [navigate])

  return {
    navigate: optimizedNavigate,
    isPending
  }
}