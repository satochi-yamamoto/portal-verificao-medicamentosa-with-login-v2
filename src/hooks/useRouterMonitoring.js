import { useEffect } from 'react'
import { useNavigation } from 'react-router-dom'

export const useRouterMonitoring = () => {
  const navigation = useNavigation()

  useEffect(() => {
    if (navigation.state === 'loading') {
      console.log('🔄 Navigation in progress...')
    }
    
    if (navigation.state === 'idle') {
      console.log('✅ Navigation completed')
    }
  }, [navigation.state])

  return {
    isNavigating: navigation.state === 'loading',
    navigationState: navigation.state
  }
}