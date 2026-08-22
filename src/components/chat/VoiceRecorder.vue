<template>
  <div class="voice-recorder-bar">
    <div class="recorder-left">
      <span class="recording-indicator"></span>
      <span class="recording-timer">{{ formattedDuration }}</span>
      <div class="sound-wave">
        <span class="bar" v-for="i in 12" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></span>
      </div>
    </div>

    <div class="recorder-actions">
      <button type="button" class="btn-cancel-recording" @click="cancelRecording" title="Bekor qilish">
        <Trash2 :size="16" />
      </button>
      <button type="button" class="btn-send-recording" @click="stopAndSend" title="Yuborish">
        <Send :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Trash2, Send } from 'lucide-vue-next'

const emit = defineEmits(['recorded', 'cancel'])

const duration = ref(0)
let timerInterval = null
let mediaRecorder = null
let audioChunks = []

const formattedDuration = computed(() => {
  const mins = Math.floor(duration.value / 60)
  const secs = duration.value % 60
  return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`
})

async function startRecording() {
  audioChunks = []
  duration.value = 0
  timerInterval = setInterval(() => {
    duration.value++
  }, 1000)

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })

      const supportedMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '')

      mediaRecorder = supportedMime ? new MediaRecorder(stream, { mimeType: supportedMime }) : new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop())
        const finalMime = mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunks, { type: finalMime })
        
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result
          emit('recorded', { blob: audioBlob, dataUrl, duration: Math.max(duration.value, 1) })
        }
        reader.readAsDataURL(audioBlob)
      }

      // Gather audio in 200ms slices for reliable capture
      mediaRecorder.start(200)
    } else {
      console.warn('MediaRecorder not available, using simulated audio recording')
    }
  } catch (err) {
    console.warn('Mic access error or permission denied:', err)
  }
}

function stopAndSend() {
  clearInterval(timerInterval)
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else {
    // Generate dummy audio event for testing if mic was blocked
    emit('recorded', { blob: null, dataUrl: '', duration: Math.max(duration.value, 3) })
  }
}

function cancelRecording() {
  clearInterval(timerInterval)
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.onstop = null
    mediaRecorder.stop()
  }
  emit('cancel')
}

onMounted(() => {
  startRecording()
})

onBeforeUnmount(() => {
  clearInterval(timerInterval)
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
})
</script>

<style scoped>
.voice-recorder-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface-2);
  border: 1px solid var(--color-primary);
  border-radius: 24px;
  padding: 6px 14px;
  flex: 1;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% { border-color: rgba(108, 99, 255, 0.4); }
  50% { border-color: rgba(108, 99, 255, 0.9); box-shadow: 0 0 12px rgba(108,99,255,0.2); }
}

.recorder-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.recording-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #FF4757;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

.recording-timer {
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}

.sound-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 18px;
}

.sound-wave .bar {
  width: 3px;
  height: 4px;
  background: var(--color-primary);
  border-radius: 2px;
  animation: soundwave 1.2s ease-in-out infinite alternate;
}

@keyframes soundwave {
  0% { height: 4px; }
  100% { height: 18px; }
}

.recorder-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel-recording {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.12);
  color: var(--color-error);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-recording:hover {
  background: rgba(255, 71, 87, 0.25);
  transform: scale(1.1);
}

.btn-send-recording {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-send-recording:hover {
  transform: scale(1.1);
}
</style>
