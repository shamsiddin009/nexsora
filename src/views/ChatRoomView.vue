<template>
  <div class="chat-room-page-container">
    <main class="content">
      <div v-if="loading" class="loading-box">
        <span class="animate-spin loader"></span>
      </div>

      <ChatWindow
        v-else-if="chat"
        :chat-id="chat.id"
        :user-id="authStore.user?.id"
        :partner="partner"
        :job="chat.jobs"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ChatWindow from '../components/ChatWindow.vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'

const route = useRoute()
const authStore = useAuthStore()
const chat = ref(null)
const loading = ref(true)

const partner = computed(() => {
  if (!chat.value) return null
  return chat.value.client_id === authStore.user?.id ? chat.value.craftsman : chat.value.client
})

async function loadChat() {
  if (!route.params.id) return
  loading.value = true
  try {
    const { data } = await supabase
      .from('chats')
      .select(`
        *,
        jobs(title, category),
        client:client_id(full_name),
        craftsman:craftsman_id(full_name)
      `)
      .eq('id', route.params.id)
      .single()

    chat.value = data
  } catch (err) {
    console.error('Load chat error:', err)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, (newId) => {
  if (newId) loadChat()
})

onMounted(() => {
  loadChat()
})
</script>

<style scoped>
.chat-room-page-container {
  min-height: calc(100vh - 68px);
  background: var(--color-bg);
  width: 100%;
}

.content {
  padding: 24px 20px 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.loading-box {
  display: flex;
  justify-content: center;
  padding: 80px;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
}

@media (max-width: 640px) {
  .content { padding: 12px 8px 24px; }
}
</style>
