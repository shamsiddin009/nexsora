import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'
import { toDeterministicUuid, generateUuid } from '../utils'
import { useAuthStore } from './auth'

export const useWalletStore = defineStore('wallet', () => {
  const balance = ref(Number(localStorage.getItem('nexsora_wallet_balance')) || 0)
  const isModalOpen = ref(false)
  const isLoading = ref(false)

  // Transaction Ledger
  const transactions = ref(JSON.parse(localStorage.getItem('nexsora_wallet_txs') || '[]'))

  // Initialize sample history if empty
  if (transactions.value.length === 0) {
    transactions.value = [
      {
        id: 'tx_sample_1',
        type: 'deposit',
        title: "Balans to'ldirish (Click)",
        amount: 200000,
        provider: 'click',
        status: 'success',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tx_sample_2',
        type: 'subscription',
        title: "Pro Usta oylik obuna to'lovi",
        amount: -189000,
        provider: 'wallet',
        status: 'success',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    if (balance.value === 0) {
      balance.value = 11000
    }
  }

  const balanceFormatted = computed(() => {
    return new Intl.NumberFormat('uz-UZ').format(balance.value)
  })

  function openWalletModal() {
    isModalOpen.value = true
  }

  function closeWalletModal() {
    isModalOpen.value = false
  }

  function saveState() {
    localStorage.setItem('nexsora_wallet_balance', String(balance.value))
    localStorage.setItem('nexsora_wallet_txs', JSON.stringify(transactions.value))
  }

  async function syncWithSupabase() {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    isLoading.value = true
    const validUserId = toDeterministicUuid(authStore.user.id)

    try {
      // 1. Fetch balance from profiles
      const { data: prof } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', validUserId)
        .maybeSingle()

      if (prof && typeof prof.balance === 'number') {
        balance.value = prof.balance
        localStorage.setItem('nexsora_wallet_balance', String(balance.value))
      }

      // 2. Fetch real transactions if table exists
      const { data: txs } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', validUserId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (txs && txs.length > 0) {
        transactions.value = txs.map(t => ({
          id: t.id,
          type: t.type || 'payment',
          title: t.title || "Operatsiya",
          amount: t.amount,
          provider: t.provider || 'wallet',
          status: t.status || 'success',
          date: t.created_at || t.date
        }))
        localStorage.setItem('nexsora_wallet_txs', JSON.stringify(transactions.value))
      }
    } catch (e) {
      console.warn('Wallet Supabase sync warning:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function updateSupabaseBalance(newBalance, txRecord) {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    const validUserId = toDeterministicUuid(authStore.user.id)

    try {
      // Update profile balance
      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', validUserId)

      // Try inserting into wallet_transactions if available
      if (txRecord) {
        await supabase
          .from('wallet_transactions')
          .insert({
            id: generateUuid(),
            user_id: validUserId,
            type: txRecord.type,
            title: txRecord.title,
            amount: txRecord.amount,
            provider: txRecord.provider,
            status: txRecord.status || 'success'
          })
      }
    } catch (e) {
      console.warn('Supabase balance update warning:', e)
    }
  }

  function deposit(amount, provider = 'click') {
    const num = Number(amount)
    if (num <= 0) return { success: false, message: "Summa 0 dan katta bo'lishi kerak" }

    balance.value += num

    const tx = {
      id: 'tx_' + Date.now(),
      type: 'deposit',
      title: `Balans to'ldirish (${provider.toUpperCase()})`,
      amount: num,
      provider,
      status: 'success',
      date: new Date().toISOString()
    }
    transactions.value.unshift(tx)
    saveState()
    updateSupabaseBalance(balance.value, tx)

    return { success: true, newBalance: balance.value, tx }
  }

  function withdraw(amount, cardNumber, cardHolder = '') {
    const num = Number(amount)
    const fee = Math.round(num * 0.01) // 1% bank processing fee
    const totalDeduct = num + fee

    if (totalDeduct > balance.value) {
      return { success: false, message: "Mablag' yetarli emas" }
    }

    balance.value -= totalDeduct

    const tx = {
      id: 'tx_' + Date.now(),
      type: 'withdraw',
      title: `Karta hisobiga yechib olish (${cardNumber.slice(-4)})`,
      amount: -num,
      fee,
      cardNumber,
      cardHolder,
      status: 'success',
      date: new Date().toISOString()
    }
    transactions.value.unshift(tx)
    saveState()
    updateSupabaseBalance(balance.value, tx)

    return { success: true, newBalance: balance.value, tx }
  }

  function payFromWallet(amount, title, type = 'payment') {
    const num = Number(amount)
    if (num > balance.value) {
      return { success: false, message: "Hamyonda mablag' yetarli emas" }
    }

    balance.value -= num

    const tx = {
      id: 'tx_' + Date.now(),
      type,
      title,
      amount: -num,
      provider: 'wallet',
      status: 'success',
      date: new Date().toISOString()
    }
    transactions.value.unshift(tx)
    saveState()
    updateSupabaseBalance(balance.value, tx)

    return { success: true, newBalance: balance.value, tx }
  }

  return {
    balance,
    balanceFormatted,
    isModalOpen,
    isLoading,
    transactions,
    openWalletModal,
    closeWalletModal,
    syncWithSupabase,
    deposit,
    withdraw,
    payFromWallet
  }
})
