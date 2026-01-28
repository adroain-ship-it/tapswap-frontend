import React, { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [suspiciousUsers, setSuspiciousUsers] = useState([])
  const [promoCodes, setPromoCodes] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showEditTaskModal, setShowEditTaskModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showAutoPromoModal, setShowAutoPromoModal] = useState(false)
  
  // Forms
  const [newTask, setNewTask] = useState({
    taskId: '',
    category: 'telegram',
    title: '',
    description: '',
    reward: 500,
    url: '',
    icon: '📢'
  })
  
  const [editingTask, setEditingTask] = useState(null)
  
  const [customPromo, setCustomPromo] = useState({
    reward: 1000,
    maxUses: 100,
    expiresInHours: null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchSuspiciousUsers(),
        fetchPromoCodes(),
        fetchTasks()
      ])
      setLoading(false)
    } catch (error) {
      console.error('Load data error:', error)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const initData = WebApp.initData
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { 'x-telegram-init-data': initData }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const fetchSuspiciousUsers = async () => {
    try {
      const initData = WebApp.initData
      const response = await axios.get(`${API_URL}/api/admin/suspicious`, {
        headers: { 'x-telegram-init-data': initData }
      })
      setSuspiciousUsers(response.data)
    } catch (error) {
      console.error('Fetch suspicious error:', error)
    }
  }

  const fetchPromoCodes = async () => {
    try {
      const initData = WebApp.initData
      const response = await axios.get(`${API_URL}/api/admin/promo/list`, {
        headers: { 'x-telegram-init-data': initData }
      })
      setPromoCodes(response.data)
    } catch (error) {
      console.error('Fetch promos error:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const initData = WebApp.initData
      const response = await axios.get(`${API_URL}/api/tasks`, {
        headers: { 'x-telegram-init-data': initData }
      })
      setTasks(response.data)
    } catch (error) {
      console.error('Fetch tasks error:', error)
    }
  }

  // ===== TASK MANAGEMENT =====

  const handleCreateTask = async () => {
    if (!newTask.taskId || !newTask.title || !newTask.url) {
      alert('❌ Please fill all required fields:\n\n• Task ID\n• Title\n• URL')
      return
    }

    try {
      const initData = WebApp.initData
      await axios.post(
        `${API_URL}/api/admin/task/create`,
        newTask,
        { headers: { 'x-telegram-init-data': initData } }
      )

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      alert('✓ TASK CREATED')
      
      setShowTaskModal(false)
      setNewTask({
        taskId: '',
        category: 'telegram',
        title: '',
        description: '',
        reward: 500,
        url: '',
        icon: '📢'
      })
      fetchTasks()
    } catch (error) {
      alert('❌ Failed to create task:\n\n' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const handleEditTask = (task) => {
    setEditingTask({...task})
    setShowEditTaskModal(true)
  }

  const handleUpdateTask = async () => {
    if (!editingTask) return

    try {
      const initData = WebApp.initData
      await axios.put(
        `${API_URL}/api/admin/task/update`,
        editingTask,
        { headers: { 'x-telegram-init-data': initData } }
      )

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      alert('✓ TASK UPDATED')
      
      setShowEditTaskModal(false)
      setEditingTask(null)
      fetchTasks()
    } catch (error) {
      alert('❌ Failed to update task:\n\n' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const initData = WebApp.initData
      await axios.patch(
        `${API_URL}/api/admin/task/toggle`,
        { taskId, enabled: !currentStatus },
        { headers: { 'x-telegram-init-data': initData } }
      )

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.impactOccurred('medium')
      }
      
      fetchTasks()
    } catch (error) {
      alert('❌ Failed to toggle task')
    }
  }

  const handleDeleteTask = async (taskId, title) => {
    if (!confirm(`⚠️ DELETE TASK\n\nDelete "${title}"?\n\nThis action is IRREVERSIBLE!`)) {
      return
    }

    try {
      const initData = WebApp.initData
      await axios.delete(
        `${API_URL}/api/admin/task/delete/${taskId}`,
        { headers: { 'x-telegram-init-data': initData } }
      )

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      alert('✓ TASK DELETED')
      fetchTasks()
    } catch (error) {
      alert('❌ Failed to delete task')
    }
  }

  // ===== PROMO CODE MANAGEMENT =====

  const handleCreatePromo = async (type) => {
    const config = type === 'standard'
      ? { reward: 1000, maxUses: 1000, expiresInHours: null }
      : { reward: 5000, maxUses: 500, expiresInHours: 24 }

    try {
      const initData = WebApp.initData
      const response = await axios.post(
        `${API_URL}/api/admin/promo/create`,
        config,
        { headers: { 'x-telegram-init-data': initData } }
      )

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      alert(`🎟️ PROMO CREATED\n\nCode: ${response.data.code}\nReward: ${response.data.reward} coins`)

      fetchPromoCodes()
    } catch (error) {
      alert('❌ Failed to create promo code')
    }
  }

  const handleCreateCustomPromo = async () => {
    if (customPromo.reward < 100 || customPromo.maxUses < 1) {
      alert('❌ Invalid values:\n\n• Reward must be ≥ 100\n• Max uses must be ≥ 1')
      return
    }

    try {
      const initData = WebApp.initData
      const response = await axios.post(
        `${API_URL}/api/admin/promo/create`,
        customPromo,
        { headers: { 'x-telegram-init-data': initData } }
      )

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      alert(`🎟️ CUSTOM PROMO CREATED\n\nCode: ${response.data.code}\nReward: ${response.data.reward} coins\nMax uses: ${customPromo.maxUses}`)

      setShowPromoModal(false)
      setCustomPromo({
        reward: 1000,
        maxUses: 100,
        expiresInHours: null
      })
      fetchPromoCodes()
    } catch (error) {
      alert('❌ Failed to create custom promo')
    }
  }

  const handleAutoGeneratePromos = async () => {
    if (!confirm('⚠️ AUTO-GENERATE PROMOS\n\nGenerate 5 promo codes for 5 users each?\n\n• 1000 coins per code\n• 1 use per code\n• Valid for 24 hours')) {
      return
    }

    try {
      const initData = WebApp.initData
      const codes = []
      
      for (let i = 0; i < 5; i++) {
        const response = await axios.post(
          `${API_URL}/api/admin/promo/create`,
          { 
            reward: 1000, 
            maxUses: 1, 
            expiresInHours: 24 
          },
          { headers: { 'x-telegram-init-data': initData } }
        )
        codes.push(response.data.code)
      }

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      alert(`✓ AUTO-GENERATED 5 PROMOS\n\n${codes.join('\n')}\n\n(1000 coins, 1 use, 24h each)`)

      setShowAutoPromoModal(false)
      fetchPromoCodes()
    } catch (error) {
      alert('❌ Failed to auto-generate promos')
    }
  }

  const handleCopyPromo = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        if (WebApp.HapticFeedback) {
          WebApp.HapticFeedback.notificationOccurred('success')
        }
        alert(`✓ COPIED\n\nCode ${code} copied to clipboard`)
      })
    } else {
      prompt('Copy this code:', code)
    }
  }

  // ===== BAN USER =====

  const handleBanUser = async (userId, username, coins) => {
    if (!confirm(`⚠️ BAN USER\n\nBan ${username} and burn ${coins} coins?\n\nThis action is IRREVERSIBLE!`)) {
      return
    }

    try {
      const initData = WebApp.initData
      const response = await axios.post(
        `${API_URL}/api/admin/ban`,
        { userId, reason: 'Suspicious activity' },
        { headers: { 'x-telegram-init-data': initData } }
      )

      if (WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success')
      }
      
      alert(`✓ BANNED\n\n${response.data.message}`)

      fetchSuspiciousUsers()
      fetchStats()
    } catch (error) {
      alert('❌ Ban failed:\n\n' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👑</div>
          <div className="text-white text-2xl font-bold mb-2">Loading Admin Panel...</div>
          <div className="text-gray-400 text-sm">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white pb-24">
      {/* HEADER */}
      <div className="p-6">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          👑 Admin Panel
        </h1>
        <p className="text-gray-400 text-sm">Manage your game</p>
      </div>

      {/* TABS */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['dashboard', 'tasks', 'anticheat', 'promos'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-[0_0_20px_rgba(251,146,60,0.5)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab === 'dashboard' && '📊 Dashboard'}
              {tab === 'tasks' && '📋 Tasks'}
              {tab === 'anticheat' && '🚨 Anti-Cheat'}
              {tab === 'promos' && '🎟️ Promos'}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && stats && (
        <div className="px-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-5 border border-cyan-400/30">
              <div className="text-gray-400 text-xs mb-1">Total Users</div>
              <div className="text-3xl font-black text-cyan-400">
                {stats.totalUsers?.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-5 border border-yellow-400/30">
              <div className="text-gray-400 text-xs mb-1">Total Coins</div>
              <div className="text-3xl font-black text-yellow-400">
                {stats.totalCoins?.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-5 border border-purple-400/30">
              <div className="text-gray-400 text-xs mb-1">Total Taps</div>
              <div className="text-3xl font-black text-purple-400">
                {stats.totalTaps?.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-5 border border-red-400/30">
              <div className="text-gray-400 text-xs mb-1">Banned</div>
              <div className="text-3xl font-black text-red-400">
                {stats.bannedUsers || 0}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-5 border border-orange-400/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-xs mb-1">Suspicious Users</div>
                <div className="text-3xl font-black text-orange-400">
                  {stats.suspiciousUsers || 0}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('anticheat')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(251,146,60,0.4)] hover:shadow-[0_0_30px_rgba(251,146,60,0.6)] transition-all"
              >
                View All →
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-5 border border-cyan-400/20">
            <div className="text-sm text-gray-300">
              <div className="font-bold mb-2">📊 Quick Stats</div>
              <div className="space-y-1 text-xs">
                <div>• Avg coins per user: {stats.totalUsers > 0 ? Math.floor(stats.totalCoins / stats.totalUsers) : 0}</div>
                <div>• Avg taps per user: {stats.totalUsers > 0 ? Math.floor(stats.totalTaps / stats.totalUsers) : 0}</div>
                <div>• Suspicious rate: {stats.totalUsers > 0 ? ((stats.suspiciousUsers / stats.totalUsers) * 100).toFixed(1) : 0}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="px-6">
          <button
            onClick={() => setShowTaskModal(true)}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-2xl font-bold mb-6 shadow-[0_0_25px_rgba(6,182,212,0.5)]"
          >
            + Create New Task
          </button>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.taskId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-4xl">{task.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{task.title}</div>
                    <div className="text-sm text-gray-400">{task.description}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-yellow-400">+{task.reward} coins</span>
                      <span className="text-cyan-400">{task.category}</span>
                      <span className={task.enabled ? 'text-green-400' : 'text-red-400'}>
                        {task.enabled ? '✓ Active' : '✗ Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="bg-blue-500/20 text-blue-400 py-2 rounded-xl text-xs font-bold border border-blue-400/50 hover:bg-blue-500/30 transition-all"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleToggleTask(task.taskId, task.enabled)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      task.enabled 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-400/50 hover:bg-orange-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-400/50 hover:bg-green-500/30'
                    }`}
                  >
                    {task.enabled ? '⏸️ Disable' : '▶️ Enable'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.taskId, task.title)}
                    className="bg-red-500/20 text-red-400 py-2 rounded-xl text-xs font-bold border border-red-400/50 hover:bg-red-500/30 transition-all"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ANTI-CHEAT TAB */}
      {activeTab === 'anticheat' && (
        <div className="px-6">
          {suspiciousUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">✅</div>
              <div className="text-gray-400 text-lg font-medium mb-2">All Clear!</div>
              <div className="text-gray-500 text-sm">No suspicious activity detected</div>
            </div>
          ) : (
            <div className="space-y-3">
              {suspiciousUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-5 border border-red-400/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg">{user.username}</div>
                      <div className="text-sm text-gray-400">ID: {user.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-red-400">{user.avgInterval}ms</div>
                      <div className="text-xs text-gray-400">avg interval</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/20 rounded-xl p-3">
                      <div className="text-xs text-gray-400 mb-1">Total Taps</div>
                      <div className="text-lg font-bold">{user.totalTaps?.toLocaleString()}</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3">
                      <div className="text-xs text-gray-400 mb-1">Coins</div>
                      <div className="text-lg font-bold text-yellow-400">{user.coins?.toLocaleString()}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBanUser(user.id, user.username, user.coins)}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all"
                  >
                    🔥 Ban & Burn
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROMOS TAB */}
      {activeTab === 'promos' && (
        <div className="px-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleCreatePromo('standard')}
              className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-5 border border-cyan-400/30 hover:border-cyan-400/60 transition-all"
            >
              <div className="text-4xl mb-2">🎟️</div>
              <div className="font-bold mb-1">Standard</div>
              <div className="text-xs text-gray-400 mb-2">1000 coins • 1000 uses</div>
              <div className="bg-cyan-500/20 text-cyan-400 py-2 rounded-xl text-xs font-bold border border-cyan-400/50">
                Create
              </div>
            </button>

            <button
              onClick={() => handleCreatePromo('premium')}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-5 border border-purple-400/30 hover:border-purple-400/60 transition-all"
            >
              <div className="text-4xl mb-2">💎</div>
              <div className="font-bold mb-1">Premium</div>
              <div className="text-xs text-gray-400 mb-2">5000 coins • 24h expiry</div>
              <div className="bg-purple-500/20 text-purple-400 py-2 rounded-xl text-xs font-bold border border-purple-400/50">
                Create
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setShowPromoModal(true)}
              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-4 border border-orange-400/30 hover:border-orange-400/60 transition-all"
            >
              <div className="text-3xl mb-2">⚙️</div>
              <div className="font-bold text-sm">Custom</div>
              <div className="text-xs text-gray-400">Your settings</div>
            </button>

            <button
              onClick={() => setShowAutoPromoModal(true)}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all"
            >
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-bold text-sm">Auto Gen</div>
              <div className="text-xs text-gray-400">5 for 5 users</div>
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Recent Codes</h3>
          </div>

          <div className="space-y-3">
            {promoCodes.map((promo, index) => (
              <motion.div
                key={promo.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-2xl font-black text-cyan-400">
                    {promo.code}
                  </div>
                  <button
                    onClick={() => handleCopyPromo(promo.code)}
                    className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl text-xs font-bold border border-cyan-400/50 hover:bg-cyan-500/30 transition-all"
                  >
                    📋 Copy
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400 mb-1">Reward</div>
                    <div className="font-bold text-yellow-400">{promo.reward} 💎</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Uses</div>
                    <div className="font-bold">{promo.uses}/{promo.maxUses}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Expires</div>
                    <div className="font-bold">
                      {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] rounded-3xl p-8 max-w-md w-full border border-cyan-500/30 my-8"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Create Task
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Task ID (unique)</label>
                  <input
                    type="text"
                    value={newTask.taskId}
                    onChange={e => setNewTask({...newTask, taskId: e.target.value})}
                    placeholder="my_channel_task"
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Category</label>
                  <select
                    value={newTask.category}
                    onChange={e => setNewTask({...newTask, category: e.target.value})}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="youtube">YouTube</option>
                    <option value="x">X (Twitter)</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Join My Channel"
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Description</label>
                  <input
                    type="text"
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Subscribe and get rewards"
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Reward (coins)</label>
                  <input
                    type="number"
                    value={newTask.reward}
                    onChange={e => setNewTask({...newTask, reward: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">URL</label>
                  <input
                    type="text"
                    value={newTask.url}
                    onChange={e => setNewTask({...newTask, url: e.target.value})}
                    placeholder="https://t.me/yourchannel"
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Icon (emoji)</label>
                  <input
                    type="text"
                    value={newTask.icon}
                    onChange={e => setNewTask({...newTask, icon: e.target.value})}
                    placeholder="📢"
                    maxLength={2}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-white/5 text-gray-400 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT TASK MODAL */}
      <AnimatePresence>
        {showEditTaskModal && editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto"
            onClick={() => setShowEditTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] rounded-3xl p-8 max-w-md w-full border border-cyan-500/30 my-8"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Edit Task
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Description</label>
                  <input
                    type="text"
                    value={editingTask.description}
                    onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Reward (coins)</label>
                  <input
                    type="number"
                    value={editingTask.reward}
                    onChange={e => setEditingTask({...editingTask, reward: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">URL</label>
                  <input
                    type="text"
                    value={editingTask.url}
                    onChange={e => setEditingTask({...editingTask, url: e.target.value})}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Icon (emoji)</label>
                  <input
                    type="text"
                    value={editingTask.icon}
                    onChange={e => setEditingTask({...editingTask, icon: e.target.value})}
                    maxLength={2}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditTaskModal(false)}
                  className="flex-1 bg-white/5 text-gray-400 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all"
                >
                  Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM PROMO MODAL */}
      <AnimatePresence>
        {showPromoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowPromoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] rounded-3xl p-8 max-w-md w-full border border-cyan-500/30"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Custom Promo
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Reward (coins)</label>
                  <input
                    type="number"
                    value={customPromo.reward}
                    onChange={e => setCustomPromo({...customPromo, reward: parseInt(e.target.value)})}
                    min={100}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Max Uses</label>
                  <input
                    type="number"
                    value={customPromo.maxUses}
                    onChange={e => setCustomPromo({...customPromo, maxUses: parseInt(e.target.value)})}
                    min={1}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Expires In (hours, 0 = never)</label>
                  <input
                    type="number"
                    value={customPromo.expiresInHours || 0}
                    onChange={e => setCustomPromo({...customPromo, expiresInHours: parseInt(e.target.value) || null})}
                    min={0}
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/70"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPromoModal(false)}
                  className="flex-1 bg-white/5 text-gray-400 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomPromo}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTO PROMO MODAL */}
      <AnimatePresence>
        {showAutoPromoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowAutoPromoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] rounded-3xl p-8 max-w-md w-full border border-cyan-500/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Auto-Generate
                </h2>
                <p className="text-gray-400 mb-6">
                  Generate 5 promo codes for 5 users<br/>
                  (1000 coins each, 1 use, 24h validity)
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAutoPromoModal(false)}
                    className="flex-1 bg-white/5 text-gray-400 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAutoGeneratePromos}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Admin
