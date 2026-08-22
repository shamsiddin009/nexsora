<template>
  <div class="admin-card card">
    <div class="card-header-clean">
      <div>
        <h3 class="flex-title"><Users :size="20" class="text-primary" /> Foydalanuvchilar Bazasi & CRM</h3>
        <p>Mijozlar, Ustalar, rollar, balans va hisoblar holati</p>
      </div>
      
      <!-- Filters & Search -->
      <div class="user-filters">
        <div class="search-box-clean">
          <Search :size="16" />
          <input
            :value="searchQuery"
            type="text"
            placeholder="Ism yoki telefon qidirish..."
            @input="$emit('update:searchQuery', $event.target.value)"
          />
        </div>
        <CustomSelect
          :model-value="roleFilter"
          :options="ROLE_OPTIONS"
          placeholder="Rol bo'yicha"
          size="sm"
          @update:model-value="$emit('update:roleFilter', $event)"
        />
      </div>
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Foydalanuvchi</th>
            <th>Rol</th>
            <th>Telefon</th>
            <th>Tarif / Plan</th>
            <th>Hamyon Balansi</th>
            <th>Holat</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="user-table-row">
            <td>
              <div class="user-cell">
                <div class="user-avatar-box">
                  <img v-if="u.avatar_url" :src="u.avatar_url" class="avatar-img" />
                  <span v-else>{{ u.full_name?.slice(0, 2) || 'US' }}</span>
                </div>
                <div>
                  <strong class="user-name-text">{{ u.full_name || 'Nomsiz' }}</strong>
                  <span class="user-id-sub">{{ u.id?.slice(0, 8) }}...</span>
                </div>
              </div>
            </td>
            <td>
              <span class="role-pill" :class="u.role === 'craftsman' ? 'craftsman-pill' : 'client-pill'">
                <Wrench v-if="u.role === 'craftsman'" :size="13" />
                <User v-else :size="13" />
                <span>{{ u.role === 'craftsman' ? 'Usta' : 'Mijoz' }}</span>
              </span>
            </td>
            <td class="cell-phone">{{ u.phone || 'Kiritilmagan' }}</td>
            <td>
              <span class="plan-pill" :class="`plan-${u.subscription_plan || 'free'}`">
                {{ getPlanLabel(u.subscription_plan) }}
              </span>
            </td>
            <td>
              <strong class="cell-balance">{{ formatPrice(u.balance || 0) }}</strong>
            </td>
            <td>
              <span class="status-indicator-badge" :class="u.is_blocked ? 'blocked' : 'active'">
                <Ban v-if="u.is_blocked" :size="13" />
                <CheckCircle2 v-else :size="13" />
                <span>{{ u.is_blocked ? 'Bloklangan' : 'Faol' }}</span>
              </span>
            </td>
            <td>
              <div class="table-actions">
                <button
                  class="action-btn topup-btn"
                  title="Balans to'ldirish"
                  @click="$emit('open-balance-modal', u)"
                >
                  <PlusCircle :size="16" />
                </button>
                <button
                  class="action-btn block-btn"
                  :class="{ 'is-blocked': u.is_blocked }"
                  :title="u.is_blocked ? 'Blokdan chiqarish' : 'Bloklash'"
                  @click="$emit('toggle-block-user', u)"
                >
                  <Ban :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { Search, PlusCircle, Ban, Users, Wrench, User, CheckCircle2 } from 'lucide-vue-next'
import { formatPrice } from '../../utils'
import CustomSelect from '../CustomSelect.vue'

const ROLE_OPTIONS = [
  { value: 'all', label: 'Barcha rollar', icon: Users },
  { value: 'craftsman', label: 'Faqat Ustalar', icon: Wrench },
  { value: 'client', label: 'Faqat Mijozlar', icon: User },
]

defineProps({
  users: { type: Array, required: true },
  searchQuery: { type: String, default: '' },
  roleFilter: { type: String, default: 'all' }
})

defineEmits(['update:searchQuery', 'update:roleFilter', 'open-balance-modal', 'toggle-block-user'])

function getPlanLabel(plan) {
  if (plan === 'pro') return 'Pro Usta'
  if (plan === 'brigade') return 'Usta Brigada'
  if (plan === 'business') return 'Biznes'
  return 'Oddiy (Free)'
}
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

.user-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-box-clean {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 8px 14px;
  border-radius: 12px;
  color: var(--color-muted);
}

.search-box-clean input {
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 0.88rem;
  outline: none;
  width: 180px;
}

.select-clean {
  padding: 8px 14px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text);
  font-size: 0.88rem;
  outline: none;
  cursor: pointer;
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

.user-table-row {
  background: var(--color-surface-2);
  transition: all 0.15s ease;
}

.user-table-row:hover {
  background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface-2));
}

.admin-table td {
  padding: 14px 16px;
  font-size: 0.88rem;
  vertical-align: middle;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
}

.admin-table td:first-child {
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
  border-left: 1px solid transparent;
}

.admin-table td:last-child {
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
  border-right: 1px solid transparent;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name-text {
  font-size: 0.92rem;
  color: var(--color-text);
  display: block;
}

.user-id-sub {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.role-pill {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
}

.craftsman-pill {
  background: rgba(108, 99, 255, 0.12);
  color: var(--color-primary-light);
}

.client-pill {
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
}

.cell-phone {
  font-size: 0.84rem;
  color: var(--color-text-2);
}

.plan-pill {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.plan-pro { border-color: #F59E0B; color: #F59E0B; }
.plan-brigade { border-color: #EC4899; color: #EC4899; }
.plan-business { border-color: #8B5CF6; color: #8B5CF6; }

.cell-balance {
  font-size: 0.95rem;
  color: var(--color-text);
}

.status-indicator-badge {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-indicator-badge.active {
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
}

.status-indicator-badge.blocked {
  background: rgba(239, 68, 68, 0.12);
  color: #EF4444;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  transform: scale(1.08);
}

.topup-btn:hover {
  color: #10B981;
  border-color: #10B981;
}

.block-btn:hover {
  color: #EF4444;
  border-color: #EF4444;
}

.block-btn.is-blocked {
  color: #EF4444;
  border-color: #EF4444;
}
</style>
