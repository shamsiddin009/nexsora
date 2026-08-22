import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../services/supabase'
import { toDeterministicUuid } from '../utils'
import { useAuthStore } from './auth'

export const useSubscriptionStore = defineStore('subscription', () => {
  const currentPlan = ref(localStorage.getItem('nexsora_plan') || 'craft_free')
  const activeBoosts = ref(JSON.parse(localStorage.getItem('nexsora_boosts') || '[]'))

  // Craftsman Plans
  const craftsmanPlans = ref([
    {
      id: 'craft_free',
      name: "Boshlang'ich Usta",
      priceUzsMonthly: 0,
      priceUsdMonthly: 0,
      badge: 'Standart',
      popular: false,
      features: [
        "Oyiga 5 ta mijoz e'loniga taklif yuborish",
        "Standart profil va chat",
        "5% platforma Escrow kafolat komissiyasi",
        "Standart qidiruv reytingi"
      ]
    },
    {
      id: 'craft_pro',
      name: 'Pro Usta',
      priceUzsMonthly: 189000,
      priceUsdMonthly: 15,
      badge: 'Eng Ommabop',
      popular: true,
      features: [
        "Cheksiz buyurtmalarga taklif yuborish",
        "Verified (Tasdiqlangan Usta) nishoni",
        "Kamaytirilgan Escrow komissiyasi: atigi 3%",
        "Qidiruvda birinchi o'rinlarda ko'rinish",
        "Telegram bot tezkor push bildirishnomalari",
        "Mijoz telefon raqamini to'g'ridan-to'g'ri ko'rish"
      ]
    },
    {
      id: 'craft_brigade',
      name: 'Usta Brigada (Jamoa)',
      priceUzsMonthly: 390000,
      priceUsdMonthly: 30,
      badge: 'Katta Jamoalar',
      popular: false,
      features: [
        "Bitta profil ostida 5 tagacha ustani birlashtirish",
        "Katta smeta va ko'p xonali obyektlar birjasi",
        "Escrow komissiyasi atigi 2.5%",
        "VIP shaxsiy menejer qo'llab-quvvatlovi",
        "Obyekt smetasi va PDF shartnomalar generatsiyasi"
      ]
    }
  ])

  // Client / Business Plans
  const clientPlans = ref([
    {
      id: 'client_free',
      name: 'Oddiy Buyurtmachi',
      priceUzsMonthly: 0,
      priceUsdMonthly: 0,
      badge: 'Standart',
      popular: false,
      features: [
        "Oyiga 3 ta bepul e'lon joylashtirish",
        "Ustalardan cheksiz takliflar qabul qilish",
        "Escrow orqali xavfsiz to'lov",
        "Oddiy mijoz qo'llab-quvvatlovi"
      ]
    },
    {
      id: 'client_business',
      name: 'Biznes & Developer',
      priceUzsMonthly: 490000,
      priceUsdMonthly: 39,
      badge: 'Qurilish Kompaniyalari',
      popular: true,
      features: [
        "Cheksiz e'lonlar va tenderlar joylashtirish",
        "TOP-1 Featured (VIP) e'lon joylashuvi",
        "Platformadan 0% depozit to'lovi",
        "Faqat 5 yulduzli saralangan ustalar tanlovi",
        "Yuridik shaxslar uchun shartnoma va hisob-faktura",
        "Shaxsiy 24/7 kurator-menejer"
      ]
    }
  ])

  // Single Add-on Boosts
  const addOns = ref([
    {
      id: 'boost_top_3d',
      name: "🚀 TOP-E'lon Boost (3 kun)",
      priceUzs: 29000,
      priceUsd: 2.5,
      desc: "E'loningiz 3 kun davomida qidiruv natijalarining eng yuqorisida qadalib turadi."
    },
    {
      id: 'boost_telegram',
      name: "🤖 Telegram Kanalga Push E'lon",
      priceUzs: 39000,
      priceUsd: 3.2,
      desc: "E'loningiz rasmiy 50,000+ a'zoli Telegram kanalimizga rasm va tafsilotlar bilan yuboriladi."
    },
    {
      id: 'boost_urgent',
      name: "⚡ Shoshilinch (Urgent) Nishoni",
      priceUzs: 19000,
      priceUsd: 1.5,
      desc: "E'loningizga qizil chaqmoq belgisi qo'yiladi va ustalar 10 daqiqa ichida taklif yuboradi."
    },
    {
      id: 'boost_verified',
      name: "🛡️ Tasdiqlangan (Verified) Usta Nishoni",
      priceUzs: 49000,
      priceUsd: 4.0,
      desc: "Hujjatlaringiz tekshirilib, profilingizga ishonchli usta ko'k nishoni bir umrga beriladi."
    }
  ])

  async function selectPlan(planId) {
    currentPlan.value = planId
    localStorage.setItem('nexsora_plan', planId)

    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    const validUserId = toDeterministicUuid(authStore.user.id)

    try {
      // 1. Update profiles table
      await supabase
        .from('profiles')
        .update({ subscription_plan: planId })
        .eq('id', validUserId)

      if (authStore.profile) {
        authStore.profile.subscription_plan = planId
      }

      // 2. If craftsman, set verified and subscription_plan in craftsman_profiles
      if (authStore.isCraftsman || planId.startsWith('craft_')) {
        const isVerified = planId === 'craft_pro' || planId === 'craft_brigade'
        await supabase
          .from('craftsman_profiles')
          .update({
            is_verified: isVerified,
            subscription_plan: planId
          })
          .eq('id', validUserId)

        if (authStore.profile?.craftsman_profiles) {
          authStore.profile.craftsman_profiles.is_verified = isVerified
          authStore.profile.craftsman_profiles.subscription_plan = planId
        }
      }
    } catch (e) {
      console.warn('Subscription sync to Supabase warning:', e)
    }
  }

  async function buyBoost(boostId) {
    if (!activeBoosts.value.includes(boostId)) {
      activeBoosts.value.push(boostId)
      localStorage.setItem('nexsora_boosts', JSON.stringify(activeBoosts.value))
    }

    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    const validUserId = toDeterministicUuid(authStore.user.id)

    try {
      if (boostId === 'boost_verified') {
        await supabase
          .from('craftsman_profiles')
          .update({ is_verified: true })
          .eq('id', validUserId)

        if (authStore.profile?.craftsman_profiles) {
          authStore.profile.craftsman_profiles.is_verified = true
        }
      }
    } catch (e) {
      console.warn('Boost sync warning:', e)
    }
  }

  return {
    currentPlan,
    activeBoosts,
    craftsmanPlans,
    clientPlans,
    addOns,
    selectPlan,
    buyBoost
  }
})
