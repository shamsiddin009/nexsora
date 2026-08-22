<template>
  <div class="header-action-buttons">
    <!-- Escrow Secure Contract Button -->
    <button
      type="button"
      class="btn btn-outline btn-sm escrow-action-btn"
      @click="$emit('open-escrow')"
      title="Xavfsiz kafolatlangan to'lov va bitim"
    >
      <ShieldCheck :size="14" class="text-primary" />
      <span class="hide-mobile">Xavfsiz bitim</span>
    </button>

    <!-- Client: Complete Job & Leave Review OR Request Revision -->
    <template v-if="isClient">
      <!-- Case A: In Revision state -> Revision Pill + Complete button -->
      <div v-if="jobStatus === 'revision'" class="client-header-actions">
        <div class="revision-pill">
          <RotateCcw :size="13" />
          <span>Ko'rib chiqilmoqda</span>
        </div>
        <button
          type="button"
          class="btn btn-success btn-sm finish-job-btn"
          @click="$emit('open-complete')"
        >
          <CheckCircle2 :size="14" />
          <span>Ishni qabul qilish & Baholash</span>
        </button>
      </div>

      <!-- Case B: In progress / Open -> Revision Request & Complete button -->
      <div v-else-if="jobStatus !== 'completed'" class="client-header-actions">
        <button
          type="button"
          class="btn btn-secondary btn-sm revision-job-btn"
          @click="$emit('open-revision')"
          title="Agar ishda kamchilik bo'lsa, ustadan tuzatishni so'rash"
        >
          <RotateCcw :size="13" />
          <span>Qayta ishlashni so'rash</span>
        </button>
        <button
          type="button"
          class="btn btn-success btn-sm finish-job-btn"
          @click="$emit('open-complete')"
        >
          <CheckCircle2 :size="14" />
          <span>Ishni qabul qilish & Baholash</span>
        </button>
      </div>

      <!-- Case C: Completed / Accepted -> Topshirildi pill + Revision request option -->
      <div v-else class="client-completed-group">
        <div class="completed-pill">
          <Sparkles :size="13" />
          <span>Topshirildi</span>
        </div>
        <button
          type="button"
          class="btn btn-secondary btn-sm revision-job-btn"
          @click="$emit('open-revision')"
          title="Agar ishda keyinchalik kamchilik aniqlansa, ustadan qayta tuzatishni so'rash"
        >
          <RotateCcw :size="13" />
          <span>Qayta ishlashni so'rash</span>
        </button>
      </div>
    </template>

    <!-- Craftsman: Quick Notify Ready or Completed status & Rate Client -->
    <template v-else-if="isCraftsman">
      <!-- Case A: In Revision state -> Revision Pill + Resubmit Button -->
      <div v-if="jobStatus === 'revision'" class="craftsman-revision-group">
        <div class="revision-pill">
          <RotateCcw :size="13" />
          <span>Ko'rib chiqilmoqda</span>
        </div>
        <button
          type="button"
          class="btn btn-warning btn-sm resubmit-job-btn"
          :disabled="sending"
          @click="$emit('notify-fixed')"
          title="Kamchiliklar to'liq bartaraf etildi deb mijozga xabar yuborish"
        >
          <CheckCircle2 :size="14" />
          <span>Kamchiliklar tuzatildi & Topshirish</span>
        </button>
      </div>

      <!-- Case B: Other non-completed state (open / in_progress) -> Notify Ready -->
      <button
        v-else-if="jobStatus !== 'completed'"
        type="button"
        class="btn btn-secondary btn-sm notify-done-btn"
        :disabled="sending"
        @click="$emit('notify-done')"
        title="Mijozga ish tayyorligi haqida xabar yuborish"
      >
        <Send :size="13" />
        <span>Ish tayyor deb bildirish</span>
      </button>

      <!-- Case C: Completed & Accepted by Client -> Topshirildi pill + Rate Client -->
      <div v-else class="craftsman-completed-group">
        <div class="completed-pill">
          <Award :size="13" />
          <span>Topshirildi</span>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-sm rate-client-btn"
          @click="$emit('open-rate-client')"
        >
          <Star :size="13" />
          <span>Mijozni baholash</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { RotateCcw, CheckCircle2, Sparkles, Send, Award, Star, ShieldCheck } from 'lucide-vue-next'

defineProps({
  isClient: Boolean,
  isCraftsman: Boolean,
  jobStatus: String,
  sending: Boolean
})

defineEmits([
  'open-complete',
  'open-revision',
  'notify-done',
  'notify-fixed',
  'open-rate-client',
  'open-escrow'
])
</script>

<style scoped>
.header-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.escrow-action-btn {
  border-color: var(--primary);
  color: var(--primary);
}

.escrow-action-btn:hover {
  background: var(--primary-light);
}

.client-header-actions,
.client-completed-group,
.craftsman-revision-group,
.craftsman-completed-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
