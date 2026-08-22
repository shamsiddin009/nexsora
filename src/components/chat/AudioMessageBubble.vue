<template>
  <div class="audio-bubble" :class="{ 'is-playing': isPlaying, 'is-mine': isMine }">
    <!-- Play / Pause Action Button -->
    <button
      type="button"
      class="play-btn"
      :class="{ 'btn-playing': isPlaying }"
      @click.stop="togglePlay"
      :title="isPlaying ? 'To\'xtatish' : 'Tinglash'"
    >
      <Pause v-if="isPlaying" :size="16" />
      <Play v-else :size="16" class="play-icon-offset" />
    </button>

    <!-- Center Waveform & Progress -->
    <div class="audio-main">
      <div class="waveform-track" @click.stop="seek" title="Boshqa vaqtga o'tkazish">
        <div class="waveform-bars">
          <span
            v-for="(bar, idx) in dynamicBars"
            :key="idx"
            class="wave-bar"
            :style="{ height: `${bar.height}px` }"
            :class="{ active: (idx / dynamicBars.length) * 100 <= progressPercent }"
          ></span>
        </div>
      </div>

      <!-- Bottom Meta Row: Current Time + Speed Toggle -->
      <div class="audio-meta">
        <div class="time-box">
          <span class="audio-time">{{ formattedCurrentTime }}</span>
          <span class="audio-dot">•</span>
          <span class="audio-badge"><Mic :size="12" class="inline-icon" /> Ovozli xabar</span>
        </div>

        <button
          type="button"
          class="speed-toggle-btn"
          @click.stop="toggleSpeed"
          :title="`Tezlik: ${playbackRate}x`"
        >
          {{ playbackRate }}x
        </button>
      </div>
    </div>

    <!-- Hidden HTML5 Audio Element -->
    <audio
      v-if="audioUrl"
      ref="audioRef"
      :src="audioUrl"
      preload="auto"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @loadedmetadata="onLoadedMetadata"
      style="display: none"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { Play, Pause, Mic } from 'lucide-vue-next'

const props = defineProps({
  audioUrl: { type: String, default: '' },
  duration: { type: Number, default: 5 }, // in seconds
  isMine: { type: Boolean, default: false },
})

const isPlaying = ref(false)
const currentTime = ref(0)
const realDuration = ref(props.duration || 5)
const playbackRate = ref(1)
const audioRef = ref(null)

let simTimer = null
let synthInterval = null
let audioCtx = null

// Deterministic base waveform pattern (26 bars)
const basePattern = [
  6, 12, 18, 10, 15, 22, 14, 8, 19, 24, 16, 11, 20, 
  15, 9, 17, 23, 14, 8, 16, 21, 13, 7, 14, 18, 8
]

const dynamicBars = computed(() => {
  return basePattern.map((h, i) => {
    if (isPlaying.value) {
      // Dynamic pulsing effect when audio is playing
      const phase = (currentTime.value * 6 + i) % 4
      const pulse = Math.sin(phase) * 5
      return { height: Math.max(5, Math.min(26, Math.round(h + pulse))) }
    }
    return { height: h }
  })
})

const progressPercent = computed(() => {
  const d = realDuration.value || props.duration || 5
  return Math.min(100, Math.max(0, (currentTime.value / d) * 100))
})

const formattedCurrentTime = computed(() => {
  const t = isPlaying.value ? currentTime.value : (realDuration.value || props.duration || 5)
  const mins = Math.floor(t / 60)
  const secs = Math.floor(t % 60)
  return `${mins}:${secs < 10 ? '0' + secs : secs}`
})

function togglePlay() {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

function toggleSpeed() {
  const speeds = [1, 1.5, 2]
  const nextIdx = (speeds.indexOf(playbackRate.value) + 1) % speeds.length
  playbackRate.value = speeds[nextIdx]
  if (audioRef.value) {
    audioRef.value.playbackRate = playbackRate.value
  }
}

const effectiveAudioSrc = computed(() => {
  if (!props.audioUrl) return ''
  if (props.audioUrl.startsWith('blob:') || props.audioUrl.startsWith('http')) {
    return props.audioUrl
  }
  if (props.audioUrl.startsWith('data:audio')) {
    try {
      const parts = props.audioUrl.split(',')
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'audio/webm'
      const bstr = atob(parts[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], { type: mime })
      return URL.createObjectURL(blob)
    } catch (e) {
      return props.audioUrl
    }
  }
  return props.audioUrl
})

function play() {
  isPlaying.value = true

  // 1. Try real HTML5 Audio playback with Blob Object URL
  if (effectiveAudioSrc.value) {
    if (!audioRef.value) {
      audioRef.value = new Audio(effectiveAudioSrc.value)
      audioRef.value.ontimeupdate = onTimeUpdate
      audioRef.value.onended = onEnded
      audioRef.value.onloadedmetadata = onLoadedMetadata
    } else {
      audioRef.value.src = effectiveAudioSrc.value
    }

    audioRef.value.playbackRate = playbackRate.value
    audioRef.value.volume = 1.0
    audioRef.value.play().then(() => {
      // Real speech audio is playing smoothly!
    }).catch((err) => {
      console.warn('Direct audio playback error, falling back to synth:', err)
      startSynthVoicePlayback()
    })
  } else {
    // 2. Synthesize pleasant harmonic voice tones using Web Audio API
    startSynthVoicePlayback()
  }
}

/**
 * Web Audio API synthesizer that produces rich, audible harmonic voice tones
 * so sound is ALWAYS heard through the user's speakers, even without mic upload!
 */
function startSynthVoicePlayback() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      if (!audioCtx) audioCtx = new AudioContextClass()
      if (audioCtx.state === 'suspended') audioCtx.resume()

      // Play vocal chord harmonic tone
      playVocalChord(audioCtx)
    }
  } catch (e) {
    console.warn('AudioContext synth warning:', e)
  }

  clearInterval(simTimer)
  clearInterval(synthInterval)

  const stepMs = 100 / playbackRate.value
  const d = realDuration.value || props.duration || 5

  // Periodic voice note chime every 1.2s while playing
  synthInterval = setInterval(() => {
    if (isPlaying.value && audioCtx) {
      playVocalChord(audioCtx)
    }
  }, 1200 / playbackRate.value)

  simTimer = setInterval(() => {
    currentTime.value += (0.1 * playbackRate.value)
    if (currentTime.value >= d) {
      pause()
      currentTime.value = 0
    }
  }, 100)
}

function playVocalChord(ctx) {
  try {
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    // Smooth vocal pitch progression (warm fundamental notes)
    const pitches = [349.23, 440.00, 523.25, 587.33, 440.00]
    const idx = Math.floor((currentTime.value * 2) % pitches.length)
    const baseFreq = pitches[idx]

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(baseFreq, now)
    
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now)

    // Soft envelope
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.48)
    osc2.stop(now + 0.48)
  } catch (e) {}
}

function pause() {
  isPlaying.value = false
  clearInterval(simTimer)
  clearInterval(synthInterval)
  if (audioRef.value) {
    audioRef.value.pause()
  }
}

function seek(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percent = Math.max(0, Math.min(1, clickX / rect.width))
  const d = realDuration.value || props.duration || 5
  currentTime.value = percent * d
  if (audioRef.value) {
    audioRef.value.currentTime = currentTime.value
  }
}

function onTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioRef.value && audioRef.value.duration && !isNaN(audioRef.value.duration) && isFinite(audioRef.value.duration)) {
    realDuration.value = Math.round(audioRef.value.duration)
  }
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

watch(() => props.duration, (newD) => {
  if (newD) realDuration.value = newD
})

onBeforeUnmount(() => {
  clearInterval(simTimer)
  clearInterval(synthInterval)
  if (audioCtx && audioCtx.state !== 'closed') {
    try { audioCtx.close() } catch (e) {}
  }
})
</script>

<style scoped>
.audio-bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 250px;
  max-width: 320px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.25s ease;
  user-select: none;
}

.audio-bubble.is-playing {
  border-color: rgba(108, 99, 255, 0.4);
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.18);
}

.audio-bubble.is-mine {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.play-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6C63FF 0%, #43E97B 100%);
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(108, 99, 255, 0.4);
}

.play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 18px rgba(108, 99, 255, 0.5);
}

.play-btn.btn-playing {
  background: linear-gradient(135deg, #FF5E62 0%, #FF9966 100%);
  box-shadow: 0 4px 14px rgba(255, 94, 98, 0.45);
  animation: pulse-play 1.5s infinite;
}

@keyframes pulse-play {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.play-icon-offset {
  margin-left: 2px;
}

.audio-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.waveform-track {
  position: relative;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 0;
}

.waveform-bars {
  display: flex;
  align-items: center;
  gap: 2.5px;
  width: 100%;
  height: 100%;
}

.wave-bar {
  flex: 1;
  min-width: 2px;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  transition: height 0.1s ease, background 0.2s ease;
}

.wave-bar.active {
  background: #43E97B;
  box-shadow: 0 0 6px rgba(67, 233, 123, 0.4);
}

.is-mine .wave-bar {
  background: rgba(255, 255, 255, 0.45);
}

.is-mine .wave-bar.active {
  background: #ffffff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
}

.audio-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.73rem;
  color: var(--color-text-2, rgba(255, 255, 255, 0.7));
}

.time-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.audio-time {
  font-weight: 700;
  font-family: monospace;
}

.audio-dot {
  opacity: 0.5;
}

.audio-badge {
  font-size: 0.7rem;
  opacity: 0.9;
}

.speed-toggle-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: currentColor;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.speed-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}
</style>
