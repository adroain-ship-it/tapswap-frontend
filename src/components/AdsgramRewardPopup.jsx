import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AdsgramRewardPopup = ({ show, onClose, reward = 100 }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Fireworks Background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute top-10 left-10 text-4xl animate-ping">🎆</div>
              <div className="absolute top-20 right-20 text-4xl animate-ping" style={{ animationDelay: '0.2s' }}>🎉</div>
              <div className="absolute bottom-10 left-20 text-4xl animate-ping" style={{ animationDelay: '0.4s' }}>✨</div>
              <div className="absolute bottom-20 right-10 text-4xl animate-ping" style={{ animationDelay: '0.6s' }}>🎊</div>
            </div>

            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_100px_rgba(251,146,60,0.8)] border-4 border-yellow-300">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl animate-pulse" />
              
              {/* Content */}
              <div className="relative text-center">
                {/* Trophy Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-8xl mb-4"
                >
                  🏆
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-black text-white mb-2"
                >
                  CONGRATULATIONS!
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-lg mb-6"
                >
                  Task completed successfully!
                </motion.p>

                {/* Reward Display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-white/50"
                >
                  <div className="text-white/80 text-sm mb-2">You earned</div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-5xl">💎</span>
                    <span className="text-6xl font-black text-white">+{reward}</span>
                  </div>
                  <div className="text-white/80 text-sm mt-2">coins</div>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={onClose}
                  className="w-full bg-white text-orange-500 py-4 rounded-xl font-black text-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  AWESOME! 🎉
                </motion.button>
              </div>
            </div>

            {/* Floating Coins Animation */}
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -100, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-4xl"
            >
              💰
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AdsgramRewardPopup
