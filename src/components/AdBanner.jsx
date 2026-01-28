import React, { useEffect, useState } from 'react'

const AdBanner = ({ blockId = 'int-21863', position = 'top' }) => {
  const [adLoaded, setAdLoaded] = useState(false)

  useEffect(() => {
    // Load AdSgram SDK
    if (!window.Adsgram) {
      const script = document.createElement('script')
      script.src = 'https://sad.adsgram.ai/js/sad.min.js'
      script.async = true
      script.onload = () => {
        console.log('✅ AdSgram SDK loaded')
        initAd()
      }
      document.body.appendChild(script)
    } else {
      initAd()
    }
  }, [])

  const initAd = () => {
    if (window.Adsgram && blockId !== 'YOUR_ADSGRAM_BLOCK_ID') {
      try {
        window.Adsgram.init({ blockId })
        setAdLoaded(true)
      } catch (error) {
        console.error('AdSgram init error:', error)
      }
    }
  }

  if (!adLoaded || blockId === 'YOUR_ADSGRAM_BLOCK_ID') {
    // Fallback banner when AdSgram not configured
    return (
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl p-3 border-b border-purple-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">💰 Ad Space Available</span>
          </div>
          <button className="bg-purple-500/30 text-white px-4 py-1 rounded-lg text-xs font-bold border border-purple-400/50">
            Learn More
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border-b border-cyan-400/20">
      <div id={`adsgram-banner-${blockId}`} className="min-h-[50px] flex items-center justify-center">
        {/* AdSgram banner will render here */}
      </div>
    </div>
  )
}

export default AdBanner
