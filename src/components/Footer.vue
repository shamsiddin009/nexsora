<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <!-- Brand Info -->
        <div class="footer-brand">
          <router-link to="/" class="logo notranslate" translate="no">
            <div class="logo-icon-box">
              <Wrench :size="18" />
            </div>
            <span class="logo-main">Nex<span class="logo-accent">sora</span></span>
          </router-link>
          <p class="footer-desc">
            O'zbekistondagi ustalar va mijozlarni bog'laydigan ishonchli birja va xizmatlar platformasi.
          </p>
          <div class="footer-socials">
            <a href="https://t.me" target="_blank" rel="noopener" class="social-btn" title="Telegram">
              <Send :size="15" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" class="social-btn" title="Instagram">
              <Instagram :size="15" />
            </a>
            <a href="#" class="social-btn" title="Veb-sayt">
              <Globe :size="15" />
            </a>
          </div>
        </div>

        <!-- Links Grid -->
        <div class="footer-links-grid">
          <div class="footer-col">
            <h6 class="col-title">Platforma</h6>
            <router-link to="/services">Xizmatlar katalogi</router-link>
            <router-link v-if="authStore.isCraftsman" to="/jobs">Birja (Ishlar)</router-link>
            <router-link to="/pricing">Tariflar & Obuna</router-link>
            <router-link v-if="!authStore.isAuthenticated" to="/register?role=craftsman">Usta sifatida kirish</router-link>
          </div>

          <div class="footer-col">
            <h6 class="col-title">Kafolat & Xavfsizlik</h6>
            <div class="col-item-badge">
              <ShieldCheck :size="15" class="text-success" />
              <span>Escrow Xavfsiz Bitim</span>
            </div>
            <div class="col-item-badge">
              <CheckCircle2 :size="15" class="text-primary" />
              <span>Tasdiqlangan Ustalar</span>
            </div>
            <div class="col-item-badge">
              <RotateCcw :size="15" class="text-warning" />
              <span>100% Pulni qaytarish</span>
            </div>
            <div class="col-item-badge">
              <Scale :size="15" class="text-info" />
              <span>Holis Arbitraj xizmati</span>
            </div>
            <div class="col-item-badge">
              <Lock :size="15" class="text-success" />
              <span>256-bit SSL To'lov himoyasi</span>
            </div>
            <router-link to="/settings" class="footer-sub-link">
              <FileText :size="14" />
              <span>Maxfiylik & Foydalanish</span>
            </router-link>
          </div>

          <div class="footer-col">
            <h6 class="col-title">Yordam</h6>
            <a href="https://t.me" target="_blank" rel="noopener">Telegram Qo'llab-quvvatlash</a>
            <a href="tel:+998712000000">+998 (71) 200-00-00</a>
            <span class="support-hours">Har kuni: 09:00 - 20:00</span>
          </div>
        </div>
      </div>

      <hr class="divider" />

      <div class="footer-bottom">
        <span class="copyright">
          © {{ currentYear }} <span class="notranslate" translate="no">Nexsora</span>. Barcha huquqlar himoyalangan.
        </span>
        <div class="location-tag">
          <MapPin :size="13" />
          <span>Toshkent, O'zbekiston</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import {
  Wrench, ShieldCheck, CheckCircle2, RotateCcw,
  Scale, Lock, FileText, Send, Instagram, Globe, MapPin
} from 'lucide-vue-next'

const authStore = useAuthStore()
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: 56px 0 28px;
  margin-top: auto;
  transition: background var(--transition-base), border-color var(--transition-base);
}

.footer-top {
  display: flex;
  justify-content: space-between;
  gap: 48px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.footer-brand {
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(255,101,132,0.2) 100%);
  border: 1px solid rgba(108,99,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-light);
}

.logo-main {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.3px;
}

.logo-accent {
  color: var(--color-primary-light);
}

.footer-desc {
  font-size: 0.875rem;
  color: var(--color-text-2);
  line-height: 1.6;
  margin: 0;
}

.footer-socials {
  display: flex;
  gap: 8px;
}

.social-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.social-btn:hover {
  background: var(--color-surface);
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  transform: translateY(-2px);
}

.footer-links-grid {
  display: flex;
  gap: 56px;
  flex-wrap: wrap;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 140px;
}

.col-title {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 4px;
}

.footer-col a {
  font-size: 0.875rem;
  color: var(--color-text-2);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-col a:hover {
  color: var(--color-primary-light);
}

.col-item-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text-2);
}

.support-hours {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.text-success { color: var(--color-success); }
.text-primary { color: var(--color-primary-light); }
.text-warning { color: var(--color-warning); }
.text-info { color: #38BDF8; }

.footer-sub-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem !important;
  color: var(--color-muted) !important;
  margin-top: 4px;
  transition: color 0.2s ease;
}

.footer-sub-link:hover {
  color: var(--color-primary-light) !important;
}

.divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 24px 0;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--color-muted);
  flex-wrap: wrap;
  gap: 12px;
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 5px;
}

@media (max-width: 768px) {
  .footer-top {
    flex-direction: column;
    gap: 32px;
  }
  .footer-links-grid {
    gap: 32px;
  }
}
</style>
