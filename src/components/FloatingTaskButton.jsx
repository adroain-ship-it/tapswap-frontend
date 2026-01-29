import React from 'react'

const FloatingTaskButton = ({ onClick, hasNewTasks = true }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-yellow-300/50 hover:scale-110 active:scale-90 transition-transform"
    >
      <span className="text-3xl">💎</span>
      
      {hasNewTasks && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </button>
  )
}

export default FloatingTaskButton
