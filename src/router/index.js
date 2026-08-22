import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const HomeView = () => import('../views/HomeView.vue')
const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const JobsView = () => import('../views/JobsView.vue')
const JobDetailView = () => import('../views/JobDetailView.vue')
const NewJobView = () => import('../views/NewJobView.vue')
const MyJobsView = () => import('../views/MyJobsView.vue')
const ChatsView = () => import('../views/ChatsView.vue')
const NotificationsView = () => import('../views/NotificationsView.vue')
const ProfileView = () => import('../views/ProfileView.vue')
const SettingsView = () => import('../views/SettingsView.vue')
const ServicesView = () => import('../views/ServicesView.vue')
const ServiceDetailView = () => import('../views/ServiceDetailView.vue')
const NewServiceView = () => import('../views/NewServiceView.vue')
const MyServicesView = () => import('../views/MyServicesView.vue')
const PricingView = () => import('../views/PricingView.vue')
const AdminView = () => import('../views/AdminView.vue')
const BrigadesView = () => import('../views/BrigadesView.vue')
const BookmarksView = () => import('../views/BookmarksView.vue')
const NotFoundView = () => import('../views/NotFoundView.vue')
const ForgotPasswordView = () => import('../views/ForgotPasswordView.vue')
const ResetPasswordView = () => import('../views/ResetPasswordView.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: "Nexsora — O'zbekistonda Ustalar va Xizmatlar Bozori" } },
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true, title: 'Kirish — Nexsora' } },
  { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true, title: "Ro'yxatdan O'tish — Nexsora" } },
  { path: '/pricing', name: 'pricing', component: PricingView, meta: { title: 'Tariflar va Narxlar — Nexsora' } },
  { path: '/brigades', name: 'brigades', component: BrigadesView, meta: { title: "Usta Brigadalari va Qurilish Jamoalari — Nexsora" } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true, title: 'Boshqaruv Paneli — Nexsora' } },
  { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true, title: 'Super Admin CRM — Nexsora' } },
  { path: '/services', name: 'services', component: ServicesView, meta: { title: "Ustalar Katalogi — Nexsora | O'zbekiston" } },

  { path: '/services/new', name: 'new-service', component: NewServiceView, meta: { requiresAuth: true, title: 'Yangi Xizmat Qo`shish — Nexsora' } },
  { path: '/services/:id', name: 'service-detail', component: ServiceDetailView, meta: { title: 'Xizmat Tafsilotlari — Nexsora' } },
  { path: '/my-services', name: 'my-services', component: MyServicesView, meta: { requiresAuth: true, title: 'Mening Xizmatlarim — Nexsora' } },
  { path: '/jobs', name: 'jobs', component: JobsView, meta: { title: "Ish E'lonlari Birjasi — Nexsora" } },
  { path: '/my-jobs', name: 'my-jobs', component: MyJobsView, meta: { requiresAuth: true, title: "Mening E'lonlarim — Nexsora" } },
  { path: '/jobs/new', name: 'new-job', component: NewJobView, meta: { requiresAuth: true, title: "Yangi Ish E'loni — Nexsora" } },
  { path: '/jobs/:id', name: 'job-detail', component: JobDetailView, meta: { title: "Ish E'loni Tafsilotlari — Nexsora" } },
  { path: '/chat', name: 'chats', component: ChatsView, meta: { requiresAuth: true, title: 'Xabarlar — Nexsora' } },
  { path: '/chat/:id', name: 'chat-room', component: ChatsView, meta: { requiresAuth: true, title: 'Suhbat — Nexsora' } },
  { path: '/notifications', name: 'notifications', component: NotificationsView, meta: { requiresAuth: true, title: 'Bildirishnomalar — Nexsora' } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true, title: 'Mening Profilim — Nexsora' } },
  { path: '/profile/:id', name: 'public-profile', component: ProfileView, meta: { title: 'Profil — Nexsora' } },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true, title: 'Sozlamalar — Nexsora' } },
  { path: '/bookmarks', name: 'bookmarks', component: BookmarksView, meta: { requiresAuth: true, title: 'Saqlanganlar — Nexsora' } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guestOnly: true, title: 'Parolni Tiklash — Nexsora' } },
  { path: '/reset-password', name: 'reset-password', component: ResetPasswordView, meta: { title: 'Yangi Parol — Nexsora' } },
  // 404 — must be last
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { title: 'Sahifa topilmadi — Nexsora' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

let initialized = false

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!initialized) {
    await authStore.fetchUser()
    initialized = true
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }


})

// ─── Per-page document title ──────────────────────────────────────────────────
router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title || "Nexsora — O'zbekistonda Ustalar va Xizmatlar Bozori"
})
