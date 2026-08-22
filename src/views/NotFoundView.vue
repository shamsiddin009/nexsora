<template>
  <div class="not-found-page">
    <!-- Animated Background -->
    <div class="nf-bg">
      <div class="nf-orb nf-orb-1"></div>
      <div class="nf-orb nf-orb-2"></div>
      <div class="nf-orb nf-orb-3"></div>
    </div>

    <div class="nf-content">
      <!-- Glitch 404 Number -->
      <div class="nf-number" aria-hidden="true">
        <span class="glitch" data-text="404">404</span>
      </div>

      <!-- Icon -->
      <div class="nf-icon-wrap">
        <SearchX :size="56" class="nf-icon" />
      </div>

      <!-- Text -->
      <h1 class="nf-title">Sahifa topilmadi</h1>
      <p class="nf-desc">
        Siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan bo'lishi mumkin.
      </p>

      <!-- Action Buttons -->
      <div class="nf-actions">
        <router-link to="/" class="btn-primary-nf">
          <Home :size="18" />
          <span>Bosh sahifaga qaytish</span>
        </router-link>
        <button class="btn-ghost-nf" @click="$router.back()">
          <ArrowLeft :size="18" />
          <span>Orqaga qaytish</span>
        </button>
      </div>

      <!-- Quick Links -->
      <div class="nf-links">
        <p class="nf-links-label">Foydali havolalar:</p>
        <div class="nf-links-row">
          <router-link to="/services" class="nf-quick-link">
            <Wrench :size="14" />
            Ustalar katalogi
          </router-link>
          <router-link to="/jobs" class="nf-quick-link">
            <Briefcase :size="14" />
            Ish e'lonlari
          </router-link>
          <router-link to="/chat" class="nf-quick-link">
            <MessageSquare :size="14" />
            Xabarlar
          </router-link>
          <router-link to="/pricing" class="nf-quick-link">
            <Sparkles :size="14" />
            Tariflar
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Home, ArrowLeft, SearchX, Wrench, Briefcase, MessageSquare, Sparkles } from 'lucide-vue-next'
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--color-bg);
  padding: 40px 20px;
}

/* Background orbs */
.nf-bg { position: absolute; inset: 0; pointer-events: none; }
.nf-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
}
.nf-orb-1 {
  width: 400px; height: 400px;
  background: var(--color-primary);
  top: -100px; left: -100px;
  animation-delay: 0s;
}
.nf-orb-2 {
  width: 300px; height: 300px;
  background: var(--color-secondary);
  bottom: -80px; right: -80px;
  animation-delay: 3s;
}
.nf-orb-3 {
  width: 200px; height: 200px;
  background: var(--color-accent);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Content */
.nf-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 560px;
  width: 100%;
}

/* Glitch 404 */
.nf-number {
  font-size: clamp(6rem, 20vw, 10rem);
  font-weight: 900;
  font-family: var(--font-display);
  line-height: 1;
  margin-bottom: 8px;
  user-select: none;
}

.glitch {
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0; left: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glitch::before {
  animation: glitch1 3s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
}

.glitch::after {
  animation: glitch2 3s infinite;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
}

@keyframes glitch1 {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(-3px, 1px); }
  94% { transform: translate(3px, -1px); }
  96% { transform: translate(-2px, 2px); }
}
@keyframes glitch2 {
  0%, 90%, 100% { transform: translate(0); }
  93% { transform: translate(3px, 1px); }
  95% { transform: translate(-3px, -1px); }
  97% { transform: translate(2px, -2px); }
}

/* Icon */
.nf-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.nf-icon {
  color: var(--color-primary);
  opacity: 0.7;
  animation: pulse-icon 2s ease-in-out infinite;
}
@keyframes pulse-icon {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
}

/* Text */
.nf-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px;
  font-family: var(--font-display);
}
.nf-desc {
  color: var(--color-text-2);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 32px;
}

/* Buttons */
.nf-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.btn-primary-nf {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gradient-primary);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(108, 99, 255, 0.35);
}
.btn-primary-nf:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(108, 99, 255, 0.5);
}

.btn-ghost-nf {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--color-text-2);
  border: 1px solid var(--color-border);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-ghost-nf:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(108, 99, 255, 0.06);
}

/* Quick links */
.nf-links-label {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin: 0 0 12px;
}
.nf-links-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.nf-quick-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  color: var(--color-text-2);
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}
.nf-quick-link:hover {
  background: rgba(108, 99, 255, 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}
</style>
