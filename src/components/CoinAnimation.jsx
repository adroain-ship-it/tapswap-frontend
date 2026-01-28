import React from 'react'
import { motion } from 'framer-motion'

const CoinAnimation = ({ id, x, y, amount }) => {
  return (
    <motion.div
      key={id}
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{ 
        y: y - 100, 
        opacity: 0,
        scale: 1.5
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute pointer-events-none text-yellow-300 font-bold text-3xl z-50 drop-shadow-lg"
      style={{ left: x, top: y }}
    >
      +{amount}
    </motion.div>
  )
}

export default CoinAnimation