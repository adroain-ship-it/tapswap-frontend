import React from 'react';

const WelcomePopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-yellow-500/50 animate-scaleIn">
        
        {/* Sparkles */}
        <div className="absolute top-4 right-4 text-4xl animate-spin-slow">✨</div>
        <div className="absolute top-8 left-4 text-3xl animate-bounce">🎉</div>
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2 animate-pulse">
            WELCOME BOSS!
          </h1>
          <p className="text-xl text-white/90 font-bold">
            Ready to get RICH? 💰
          </p>
        </div>

        {/* Rewards */}
        <div className="space-y-4 mb-6">
          {/* 5000 Coins */}
          <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-2xl p-4 border-2 border-yellow-500/50 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">💰</span>
                <div>
                  <p className="text-yellow-400 font-bold text-lg">Welcome Bonus</p>
                  <p className="text-white/70 text-sm">Start strong!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-yellow-400">+5,000</p>
                <p className="text-xs text-white/70">COINS</p>
              </div>
            </div>
          </div>

          {/* 2x Boost */}
          <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-2xl p-4 border-2 border-blue-500/50 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">⚡</span>
                <div>
                  <p className="text-blue-400 font-bold text-lg">2x Tap Power</p>
                  <p className="text-white/70 text-sm">Double earnings!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-blue-400">10 min</p>
                <p className="text-xs text-white/70">ACTIVE NOW</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-center text-white/80 text-sm leading-relaxed">
            🚀 <span className="font-bold text-yellow-400">Tap the coin</span> to earn!<br/>
            💎 Complete tasks for <span className="font-bold text-green-400">bonus rewards</span><br/>
            👥 Invite friends to earn <span className="font-bold text-purple-400">10% of their earnings</span>
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-black text-xl py-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all active:scale-95"
        >
          LET'S GET RICH! 💸
        </button>

        {/* Footer */}
        <p className="text-center text-white/50 text-xs mt-4">
          Your boost is already active! Start tapping now! ⚡
        </p>
      </div>
    </div>
  );
};

export default WelcomePopup;

// CSS Animations - dodaj do index.css lub tailwind.config.js:
/*
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.8);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.4s ease-out;
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}
*/
