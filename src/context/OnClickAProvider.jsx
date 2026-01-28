import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

const OnClickAContext = createContext()

export const useOnClickA = () => {
  const context = useContext(OnClickAContext)
  if (!context) {
    throw new Error('useOnClickA must be used within OnClickAProvider')
  }
  return context
}

export const OnClickAProvider = ({ children, spotId = '6108783' }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const refreshIntervalRef = useRef(null)
  const initTimeoutRef = useRef(null)

  // Load OnClickA SDK
  useEffect(() => {
    if (document.getElementById('onclicka-script')) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'onclicka-script'
    script.src = 'https://js.onclckmn.com/static/onclicka.js'
    script.async = true
    
    script.onload = () => {
      console.log('✅ OnClickA SDK loaded')
      setIsLoaded(true)
    }
    
    script.onerror = () => {
      console.error('❌ Failed to load OnClickA SDK')
    }
    
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount (rare in practice)
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
    }
  }, [])

  // Initialize ad when SDK is loaded
  useEffect(() => {
    if (!isLoaded || isInitialized) return

    // Wait for SDK to be fully ready
    initTimeoutRef.current = setTimeout(() => {
      if (window.OnClickA) {
        try {
          window.OnClickA.init({
            spotId: spotId,
            container: '.ad-space',
            format: 'tma-inpage'
          })
          console.log(`✅ OnClickA initialized with Spot ID: ${spotId}`)
          setIsInitialized(true)
          
          // Start auto-refresh (30 seconds)
          startAutoRefresh()
        } catch (error) {
          console.error('❌ OnClickA init error:', error)
        }
      }
    }, 500)
  }, [isLoaded, isInitialized, spotId])

  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing OnClickA banner...')
      refreshAd()
    }, 30000) // 30 seconds
  }

  const refreshAd = () => {
    if (window.OnClickA && window.OnClickA.refresh) {
      try {
        window.OnClickA.refresh()
        console.log('✅ OnClickA banner refreshed')
      } catch (error) {
        console.error('❌ OnClickA refresh error:', error)
      }
    }
  }

  const value = {
    isLoaded,
    isInitialized,
    refreshAd
  }

  return (
    <OnClickAContext.Provider value={value}>
      {children}
    </OnClickAContext.Provider>
  )
}