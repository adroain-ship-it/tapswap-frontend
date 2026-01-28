// ===== BOOSTERS ARRAY DLA Shop.jsx =====
// Tylko Autoclicker z Twoimi cenami Stars!

const BOOSTERS = [
  {
    id: 'autoclicker_2h',
    name: '🤖 Autoclicker - 2H',
    description: 'Auto-tap for 2 hours',
    duration: 2,
    type: 'autoclicker',
    starsPrice: 100, // 100 Telegram Stars
    icon: '🤖',
    color: 'from-purple-600 to-blue-600'
  },
  {
    id: 'autoclicker_5h',
    name: '🤖 Autoclicker - 5H',
    description: 'Auto-tap for 5 hours',
    duration: 5,
    type: 'autoclicker',
    starsPrice: 200,
    icon: '🤖',
    color: 'from-purple-600 to-blue-600'
  },
  {
    id: 'autoclicker_10h',
    name: '🤖 Autoclicker - 10H',
    description: 'Auto-tap for 10 hours',
    duration: 10,
    type: 'autoclicker',
    starsPrice: 350,
    icon: '🤖',
    color: 'from-purple-600 to-blue-600'
  },
  {
    id: 'autoclicker_24h',
    name: '🤖 Autoclicker - 24H',
    description: 'Auto-tap for 24 hours',
    duration: 24,
    type: 'autoclicker',
    starsPrice: 750,
    icon: '🤖',
    color: 'from-purple-600 to-blue-600'
  },
  {
    id: 'autoclicker_3d',
    name: '🤖 Autoclicker - 3D',
    description: 'Auto-tap for 3 days',
    duration: 72, // 3 days = 72 hours
    type: 'autoclicker',
    starsPrice: 1800,
    icon: '🤖',
    color: 'from-purple-600 to-blue-600'
  },
  {
    id: 'autoclicker_7d',
    name: '🤖 Autoclicker - 7D',
    description: 'Auto-tap for 7 days',
    duration: 168, // 7 days = 168 hours
    type: 'autoclicker',
    starsPrice: 3500,
    icon: '🤖',
    color: 'from-purple-600 to-blue-600'
  }
];

// ===== FUNKCJE STARS PAYMENT =====

const handleStarsPurchase = async (booster) => {
  try {
    WebApp.HapticFeedback.impactOccurred('medium');
    
    // Create invoice
    const response = await axios.post(
      `${API_URL}/api/stars/create-invoice`,
      {
        boosterId: booster.id,
        title: booster.name,
        description: booster.description,
        amount: booster.starsPrice
      },
      { headers: { 'x-telegram-init-data': WebApp.initData } }
    );
    
    if (response.data.success) {
      const invoiceLink = response.data.invoiceLink;
      
      // Open Telegram Stars payment
      WebApp.openInvoice(invoiceLink, (status) => {
        if (status === 'paid') {
          WebApp.HapticFeedback.notificationOccurred('success');
          activateBoosterAfterPayment(booster);
          WebApp.showAlert(`✅ Payment successful! ${booster.name} activated!`);
        } else if (status === 'cancelled') {
          WebApp.HapticFeedback.notificationOccurred('warning');
          WebApp.showAlert('Payment cancelled');
        } else if (status === 'failed') {
          WebApp.HapticFeedback.notificationOccurred('error');
          WebApp.showAlert('Payment failed. Please try again.');
        }
      });
    }
  } catch (error) {
    console.error('Stars purchase error:', error);
    WebApp.showAlert('Failed to create payment. Try again!');
  }
};

const activateBoosterAfterPayment = async (booster) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/boosters/activate`,
      {
        boosterId: booster.id,
        duration: booster.duration,
        type: booster.type,
        isFree: false
      },
      { headers: { 'x-telegram-init-data': WebApp.initData } }
    );
    
    if (response.data.success) {
      updateUser({
        boosters: response.data.boosters,
        maxEnergy: response.data.maxEnergy
      });
      console.log(`✅ ${booster.name} activated!`);
    }
  } catch (error) {
    console.error('Activate booster error:', error);
    WebApp.showAlert('Failed to activate booster');
  }
};

// ===== JSX DLA BOOSTER CARDS =====

<div className="space-y-4">
  {BOOSTERS.map((booster) => (
    <div
      key={booster.id}
      className={`bg-gradient-to-br ${booster.color} rounded-2xl p-5 shadow-xl border border-white/10`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{booster.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-white">{booster.name}</h3>
            <p className="text-white/70 text-sm">{booster.description}</p>
          </div>
        </div>
      </div>

      {/* Stars Payment Button */}
      <button
        onClick={() => handleStarsPurchase(booster)}
        className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-transform shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          <div className="text-left">
            <p className="text-xs opacity-90">Buy for</p>
            <p className="text-2xl font-black">{booster.starsPrice}</p>
          </div>
        </div>
        <span className="text-2xl">→</span>
      </button>
    </div>
  ))}
</div>
