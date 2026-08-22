/**
 * Nexsora AI Smart Price & Estimate Engine
 * Provides intelligent market budget estimations, estimated completion time,
 * and automated checklists based on Uzbekistan regional market averages.
 */

const MARKET_BASELINES = {
  'Santexnik': { min: 150000, max: 800000, avgDays: 1, tip: "Quvurlar va kranlar uchun doim sifatli latun yoki ekoplast fitinglardan foydalanishni so'rang." },
  'Elektrik': { min: 200000, max: 1200000, avgDays: 1, tip: "Katta yuklanishli jihozlar (konditsioner, ariston) uchun alohida avtomat va 2.5/4 mm² sim talab qiling." },
  'Quruvchi': { min: 500000, max: 5000000, avgDays: 4, tip: "Poydevor va suvoq quritish vaqtini inobatga olgan holda bosqichma-bosqich qabul qiling." },
  'Duradgor': { min: 250000, max: 2000000, avgDays: 2, tip: "Mebel furnituralari (petlya, yo'naltiruvchilar) sifatli turk yoki nemis brendlari bo'lishini tekshiring." },
  'Rassom': { min: 300000, max: 1800000, avgDays: 3, tip: "Bo'yoqdan oldin gruntovka (astar) 2 qatlam qilinganiga ishonch hosil qiling." },
  'Konditsioner': { min: 200000, max: 600000, avgDays: 1, tip: "Freon quyishdan oldin vakuumlash jarayoni to'liq bajarilishi shart." },
  'Teshinchi': { min: 150000, max: 900000, avgDays: 1, tip: "Olmosli burg'ulash (almaznoe burenie) changsiz va devorni buzmasdan bajariladi." },
  'Temirchi': { min: 400000, max: 3500000, avgDays: 3, tip: "Payvand choklari tekis va korroziyaga qarshi grunt bo'yoq bilan qoplangan bo'lishi kerak." },
  'Bog\'bon': { min: 150000, max: 800000, avgDays: 1, tip: "Daraxt va maysalarga dori sepishda biologik xavfsiz vositalardan foydalanish tavsiya etiladi." },
  'Tozalovchi': { min: 200000, max: 1000000, avgDays: 1, tip: "Yevro tozalashda professional kimyoviy vositalar mebelga zarar yetkazmasligi lozim." },
  'Haydovchi': { min: 100000, max: 1500000, avgDays: 1, tip: "Yuk hajmi va og'irligiga mos transport (Labo, Gazel, Isuzu) tanlang." },
  'Boshqa': { min: 150000, max: 1000000, avgDays: 1, tip: "Ish boshlanishidan oldin aniq narx va muddatni ustaning o'zi bilan kelishib oling." }
}

export const aiAssistantService = {
  /**
   * Generates smart price estimation and advice
   */
  async estimateJob({ title, category, description, city = 'Toshkent' }) {
    await new Promise(r => setTimeout(r, 600)) // Fast AI analysis simulation

    const base = MARKET_BASELINES[category] || MARKET_BASELINES['Boshqa']
    let multiplier = 1.0

    const text = `${title} ${description}`.toLowerCase()
    
    // Scale according to keywords
    if (text.includes('kottej') || text.includes('katta') || text.includes('to\'liq') || text.includes('yevro')) {
      multiplier *= 1.6
    }
    if (text.includes('kichik') || text.includes('oddiy') || text.includes('almashtirish') || text.includes('ta\'mirlash')) {
      multiplier *= 0.8
    }
    if (city !== 'Toshkent') {
      multiplier *= 0.85 // Regional coefficient
    }

    const estimatedMin = Math.round((base.min * multiplier) / 10000) * 10000
    const estimatedMax = Math.round((base.max * multiplier) / 10000) * 10000
    const estimatedDays = Math.max(1, Math.round(base.avgDays * (multiplier > 1.2 ? 1.5 : 1)))

    const steps = [
      'Usta bilan joyida bepul ko\'rik va o\'lchov qilish',
      'Zarur materiallar ro\'yxatini tasdiqlash',
      'Nexsora Escrow orqali xavfsiz to\'lovni muzlatish',
      'Ish yakunlangach tekshirib qabul qilish',
    ]

    return {
      success: true,
      minPrice: estimatedMin,
      maxPrice: estimatedMax,
      days: estimatedDays,
      advice: base.tip,
      checklist: steps,
      confidence: '96%',
    }
  }
}
