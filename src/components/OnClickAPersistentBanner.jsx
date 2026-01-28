import React from 'react'

const OnClickAPersistentBanner = ({ height = 100 }) => {
  return (
    <div 
      className="onclicka-banner-wrapper"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: `${height}px`,
        minHeight: `${height}px`,
        backgroundColor: 'rgba(10, 14, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* OnClickA Container */}
      <div 
        className="ad-space"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Fallback/Loading State */}
        <div 
          className="ad-fallback"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(156, 163, 175, 0.5)',
            fontSize: '12px',
            fontWeight: '500',
            pointerEvents: 'none',
          }}
        >
          🎯 Ad Space
        </div>
      </div>
    </div>
  )
}

export default OnClickAPersistentBanner