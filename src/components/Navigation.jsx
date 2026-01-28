import React from 'react'

const Navigation = ({ currentPage, setCurrentPage }) => {
  const isActive = (page) => currentPage === page

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0e27] via-[#1a1f3a] to-transparent backdrop-blur-xl border-t border-white/10 z-50">
      <div className="flex justify-around items-center px-2 py-3">
        {/* TAP */}
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex flex-col items-center gap-1 min-w-[60px]"
        >
          <div className={`transition-all ${isActive('home') ? 'scale-110' : 'scale-100 opacity-60'}`}>
            <div className={`text-2xl ${isActive('home') ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''}`}>
              💎
            </div>
          </div>
          <span className={`text-xs font-bold transition-all ${
            isActive('home') 
              ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]' 
              : 'text-gray-500'
          }`}>
            Tap
          </span>
        </button>

        {/* SHOP */}
        <button 
          onClick={() => setCurrentPage('shop')}
          className="flex flex-col items-center gap-1 min-w-[60px]"
        >
          <div className={`transition-all ${isActive('shop') ? 'scale-110' : 'scale-100 opacity-60'}`}>
            <div className={`text-2xl ${isActive('shop') ? 'drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]' : ''}`}>
              🛒
            </div>
          </div>
          <span className={`text-xs font-bold transition-all ${
            isActive('shop') 
              ? 'text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.6)]' 
              : 'text-gray-500'
          }`}>
            Shop
          </span>
        </button>

        {/* EARN */}
        <button 
          onClick={() => setCurrentPage('tasks')}
          className="flex flex-col items-center gap-1 min-w-[60px]"
        >
          <div className={`transition-all ${isActive('tasks') ? 'scale-110' : 'scale-100 opacity-60'}`}>
            <div className={`text-2xl ${isActive('tasks') ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' : ''}`}>
              💰
            </div>
          </div>
          <span className={`text-xs font-bold transition-all ${
            isActive('tasks') 
              ? 'text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]' 
              : 'text-gray-500'
          }`}>
            Earn
          </span>
        </button>

        {/* LEAGUE */}
        <button 
          onClick={() => setCurrentPage('league')}
          className="flex flex-col items-center gap-1 min-w-[60px]"
        >
          <div className={`transition-all ${isActive('league') ? 'scale-110' : 'scale-100 opacity-60'}`}>
            <div className={`text-2xl ${isActive('league') ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]' : ''}`}>
              🏆
            </div>
          </div>
          <span className={`text-xs font-bold transition-all ${
            isActive('league') 
              ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
              : 'text-gray-500'
          }`}>
            League
          </span>
        </button>

        {/* FRIENDS */}
        <button 
          onClick={() => setCurrentPage('referrals')}
          className="flex flex-col items-center gap-1 min-w-[60px]"
        >
          <div className={`transition-all ${isActive('referrals') ? 'scale-110' : 'scale-100 opacity-60'}`}>
            <div className={`text-2xl ${isActive('referrals') ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`}>
              👥
            </div>
          </div>
          <span className={`text-xs font-bold transition-all ${
            isActive('referrals') 
              ? 'text-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]' 
              : 'text-gray-500'
          }`}>
            Friends
          </span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
