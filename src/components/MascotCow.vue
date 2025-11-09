<template>
  <div class="mascot-cow-container" :class="sizeClass">
    <div class="mascot-cow-character" :class="{ 'mascot-animate': animate }">
      <div class="cow-face">
        <!-- 牛角 -->
        <div class="cow-horn left"></div>
        <div class="cow-horn right"></div>
        
        <!-- 耳朵 -->
        <div class="cow-ear left"></div>
        <div class="cow-ear right"></div>
        
        <!-- 脸部 -->
        <div class="cow-head">
          <!-- 眼睛 -->
          <div class="cow-eyes">
            <div class="cow-eye left">
              <div class="eye-pupil"></div>
            </div>
            <div class="cow-eye right">
              <div class="eye-pupil"></div>
            </div>
          </div>
          
          <!-- 鼻子 -->
          <div class="cow-nose">
            <div class="nostril left"></div>
            <div class="nostril right"></div>
          </div>
          
          <!-- 斑点装饰 -->
          <div class="cow-spot spot-1"></div>
          <div class="cow-spot spot-2"></div>
        </div>
        
        <!-- 时钟（在额头上） -->
        <div v-if="showClock" class="cow-clock">
          <div class="clock-face">
            <div class="clock-hand hour"></div>
            <div class="clock-hand minute"></div>
          </div>
        </div>
      </div>
      
      <!-- 消息气泡 -->
      <div v-if="message" class="cow-message-bubble">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  animate: {
    type: Boolean,
    default: true
  },
  showClock: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: ''
  }
})

const sizeClass = computed(() => `mascot-size-${props.size}`)
</script>

<style scoped>
.mascot-cow-container {
  display: inline-block;
  position: relative;
}

.mascot-size-small {
  width: 80px;
  height: 80px;
}

.mascot-size-medium {
  width: 120px;
  height: 120px;
}

.mascot-size-large {
  width: 180px;
  height: 180px;
}

.mascot-cow-character {
  width: 100%;
  height: 100%;
  position: relative;
}

.mascot-animate {
  animation: cowBounce 2s ease-in-out infinite;
}

@keyframes cowBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 牛脸 */
.cow-face {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 牛头 */
.cow-head {
  position: absolute;
  top: 25%;
  left: 15%;
  width: 70%;
  height: 60%;
  background: linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%);
  border-radius: 50% 50% 45% 45%;
  border: 3px solid #8B4513;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
}

/* 牛角 */
.cow-horn {
  position: absolute;
  width: 20px;
  height: 35px;
  background: linear-gradient(135deg, #D2691E 0%, #8B4513 100%);
  border-radius: 50% 50% 10% 10%;
  border: 2px solid #5D2E0F;
  top: 20%;
}

.cow-horn.left {
  left: 20%;
  transform: rotate(-25deg);
}

.cow-horn.right {
  right: 20%;
  transform: rotate(25deg);
}

/* 耳朵 */
.cow-ear {
  position: absolute;
  width: 28px;
  height: 40px;
  background: #FFF8DC;
  border: 2px solid #8B4513;
  border-radius: 50%;
  top: 35%;
}

.cow-ear::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 24px;
  background: #FFB6C1;
  border-radius: 50%;
}

.cow-ear.left {
  left: 10%;
  transform: rotate(-15deg);
}

.cow-ear.right {
  right: 10%;
  transform: rotate(15deg);
}

/* 眼睛 */
.cow-eyes {
  position: absolute;
  top: 30%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 0 25%;
}

.cow-eye {
  width: 16px;
  height: 18px;
  background: white;
  border: 2px solid #5D2E0F;
  border-radius: 50%;
  position: relative;
  animation: cowBlink 4s ease-in-out infinite;
}

.eye-pupil {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #5D2E0F;
  border-radius: 50%;
  animation: eyeMove 3s ease-in-out infinite;
}

@keyframes cowBlink {
  0%, 90%, 100% { height: 18px; }
  95% { height: 2px; }
}

@keyframes eyeMove {
  0%, 100% { transform: translate(-50%, -50%); }
  25% { transform: translate(-40%, -50%); }
  75% { transform: translate(-60%, -50%); }
}

/* 鼻子 */
.cow-nose {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 35px;
  height: 22px;
  background: #FFE4B5;
  border: 2px solid #8B4513;
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
}

.nostril {
  position: absolute;
  top: 40%;
  width: 8px;
  height: 10px;
  background: #8B4513;
  border-radius: 50%;
}

.nostril.left {
  left: 25%;
}

.nostril.right {
  right: 25%;
}

/* 斑点 */
.cow-spot {
  position: absolute;
  background: #8B4513;
  border-radius: 50%;
  opacity: 0.6;
}

.spot-1 {
  top: 15%;
  left: 15%;
  width: 18px;
  height: 22px;
  transform: rotate(-15deg);
}

.spot-2 {
  top: 20%;
  right: 20%;
  width: 15px;
  height: 18px;
  transform: rotate(20deg);
}

/* 时钟 */
.cow-clock {
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 35px;
  height: 35px;
  z-index: 10;
}

.clock-face {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
  border: 3px solid #4682B4;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.clock-hand {
  position: absolute;
  left: 50%;
  bottom: 50%;
  transform-origin: bottom center;
  background: #2F4F4F;
  border-radius: 2px;
}

.clock-hand.hour {
  width: 2px;
  height: 10px;
  transform: translateX(-50%) rotate(30deg);
  animation: hourRotate 12s linear infinite;
}

.clock-hand.minute {
  width: 1.5px;
  height: 13px;
  transform: translateX(-50%) rotate(90deg);
  animation: minuteRotate 60s linear infinite;
}

@keyframes hourRotate {
  from { transform: translateX(-50%) rotate(0deg); }
  to { transform: translateX(-50%) rotate(360deg); }
}

@keyframes minuteRotate {
  from { transform: translateX(-50%) rotate(0deg); }
  to { transform: translateX(-50%) rotate(360deg); }
}

/* 消息气泡 */
.cow-message-bubble {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 3px solid #8B4513;
  border-radius: 20px;
  padding: 10px 16px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: #5D2E0F;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: messageBounce 0.5s ease-out;
  z-index: 100;
}

.cow-message-bubble::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid #8B4513;
  z-index: 99;
}

.cow-message-bubble::before {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid white;
  z-index: 100;
}

@keyframes messageBounce {
  0% { transform: translateX(-50%) scale(0); opacity: 0; }
  50% { transform: translateX(-50%) scale(1.1); }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}
</style>
