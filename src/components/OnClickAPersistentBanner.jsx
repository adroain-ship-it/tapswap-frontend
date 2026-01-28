import React, { useEffect, useRef } from 'react'

const OnClickAPersistentBanner = ({ height = 100 }) => {
  const containerRef = useRef(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (scriptLoadedRef.current) return

    // Load OnClickA script
    const script = document.createElement('script')
    script.src = 'https://js.onclckmn.com/static/onclicka.js'
    script.async = true
    
    script.onload = () => {
      console.log('✅ OnClickA script loaded')
      scriptLoadedRef.current = true
      
      // Initialize after script loads
      setTimeout(() => {
        if (window.OnClickA && containerRef.current) {
          try {
            window.OnClickA.init({
              spotId: '6108783',
              container: '.ad-space-onclicka'
            })
            console.log('✅ OnClickA initialized')
          } catch (error) {
            console.error('❌ OnClickA init error:', error)
          }
        } else {
          console.error('❌ OnClickA not available')
        }
      }, 1000)
    }
    
    script.onerror = () => {
      console.error('❌ Failed to load OnClickA script')
    }
    
    document.head.appendChild(script)
    
    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: `${height}px`,
        minHeight: `${height}px`,
        backgroundColor: '#1a1f3a',
        borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* OnClickA container */}
      <div 
        className="ad-space-onclicka"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Fallback */}
        <div style={{
          color: 'rgba(156, 163, 175, 0.5)',
          fontSize: '12px',
        }}>
          Loading ad...
        </div>
      </div>
    </div>
  )
}

export default OnClickAPersistentBanner
