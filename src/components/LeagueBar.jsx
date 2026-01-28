import React from 'react'
import { motion } from 'framer-motion'

const LeagueBar = ({ current, next, progress }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-white font-bold" style={{ color: current.color }}>
              {current.name}
            </div>
            <div className="text-white/60 text-xs">League</div>
          </div>
        </div>
        {next && (
          <div className="text-right">
            <div className="text-white/80 text-sm">Next:</div>
            <div className="text-white font-bold text-xs" style={{ color: next.color }}>
              {next.name}
            </div>
          </div>
        )}
        {!next && (
          <div className="text-right">
            <div className="text-gold font-bold text-lg">MAX</div>
            <div className="text-white/60 text-xs">Level</div>
          </div>
        )}
      </div>
      
      <div className="bg-white/20 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${current.color}, ${next?.color || current.color})`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      <div className="text-white/60 text-xs text-center mt-1">
        {progress === 100 ? 'MAX LEVEL!' : `${Math.floor(progress)}% to ${next?.name}`}
      </div>
    </div>
  )
}

export default LeagueBar