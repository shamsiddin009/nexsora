<template>
  <div class="admin-card card">
    <div class="card-header-clean">
      <div>
        <h3 class="flex-title"><CreditCard :size="20" class="text-primary" /> Ustalarning Pul Yechib Olish (Payout) So'rovlari</h3>
        <p>Ustalar bajargan ishlaridan to'plangan pullarni Uzcard / Humo kartalariga chiqarish arizalari</p>
      </div>
      <span class="badge badge-success">{{ payoutsList.length }} ta so'rov</span>
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Sana</th>
            <th>Usta</th>
            <th>Karta Raqami</th>
            <th>Summa</th>
            <th>Holat</th>
            <th>Amal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in payoutsList" :key="p.id" class="payout-row">
            <td class="cell-date">{{ p.date }}</td>
            <td>
              <strong class="craftsman-name">{{ p.craftsmanName }}</strong>
              <span class="craftsman-phone">{{ p.phone }}</span>
            </td>
            <td>
              <div class="card-chip-box">
                <code class="card-code">{{ p.cardNumber }}</code>
                <span class="card-bank-sub">{{ p.cardHolder }}</span>
              </div>
            </td>
            <td><strong class="text-success payout-amount">{{ formatPrice(p.amount) }}</strong></td>
            <td>
              <span class="status-pill" :class="p.status === 'completed' ? 'pill-completed' : 'pill-pending'">
                <CheckCircle2 v-if="p.status === 'completed'" :size="13" />
                <Clock v-else :size="13" />
                <span>{{ p.status === 'completed' ? 'To\'landi' : 'Kutilmoqda' }}</span>
              </span>
            </td>
            <td>
              <button
                v-if="p.status !== 'completed'"
                class="btn btn-success btn-sm btn-approve"
                @click="$emit('approve-payout', p)"
              >
                <CheckCircle2 :size="14" />
                <span>To'lovni Tasdiqlash</span>
              </button>
              <span v-else class="text-muted text-done">Bajarilgan</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2, CreditCard, Clock } from 'lucide-vue-next'
import { formatPrice } from '../../utils'

defineProps({
  payoutsList: { type: Array, required: true }
})

defineEmits(['approve-payout'])
</script>

<style scoped>
.admin-card {
  padding: 28px;
  border-radius: 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header-clean {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.card-header-clean h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.card-header-clean p {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 4px 0 0;
}

.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}

.admin-table th {
  padding: 10px 16px;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-muted);
  text-align: left;
  letter-spacing: 0.04em;
}

.payout-row {
  background: var(--color-surface-2);
  transition: all 0.15s ease;
}

.payout-row:hover {
  background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface-2));
}

.admin-table td {
  padding: 14px 16px;
  font-size: 0.88rem;
  vertical-align: middle;
}

.admin-table td:first-child {
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}

.admin-table td:last-child {
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
}

.cell-date {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.craftsman-name {
  color: var(--color-text);
  display: block;
}

.craftsman-phone {
  font-size: 0.75rem;
  color: var(--color-muted);
  display: block;
}

.card-chip-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-code {
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  width: fit-content;
}

.card-bank-sub {
  font-size: 0.72rem;
  color: var(--color-muted);
  text-transform: uppercase;
}

.payout-amount {
  font-size: 1.05rem;
  font-weight: 800;
}

.status-pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.pill-completed {
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
}

.pill-pending {
  background: rgba(245, 158, 11, 0.12);
  color: #F59E0B;
}

.btn-approve {
  font-weight: 600;
}

.text-done {
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
