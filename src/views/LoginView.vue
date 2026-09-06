<template>
  <div class="login-layout">
    <div class="login-box">

      <!-- Kiri: Branding -->
      <div class="login-left">
        <div class="login-left-content">
          <!-- Logo horizontal: ikon + teks -->
          <div class="brand-row">
            <Wallet class="brand-logo-icon" />
            <span class="brand-name">Kasly</span>
          </div>

          <div class="brand-tagline">
            <h2>Kelola keuangan<br/>dengan lebih mudah</h2>
            <p>Sistem manajemen kas terpadu untuk mencatat dan mengelola pemasukan serta pengeluaran dengan lebih mudah.</p>
          </div>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Pencatatan pemasukan & pengeluaran</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Laporan keuangan lengkap</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Akses mudah, kapan saja & di mana saja</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Kanan: Form Login -->
      <div class="login-right">
        <div class="login-form-wrap">

          <!-- Logo di form -->
          <div class="form-logo">
            <img src="/logo.png" alt="Kasly Logo" class="custom-form-logo" />
          </div>

          <div class="form-header">
            <h2>Selamat Datang</h2>
            <p>Masuk untuk melanjutkan</p>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="field">
              <label for="login-username">Username</label>
              <div class="input-wrap">
                <User class="field-icon" />
                <input
                  id="login-username"
                  v-model="form.username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label for="login-password">Password</label>
              <div class="input-wrap">
                <Lock class="field-icon" />
                <input
                  id="login-password"
                  v-model="form.password"
                  :type="showPw ? 'text' : 'password'"
                  placeholder="Masukkan password Anda"
                  autocomplete="current-password"
                  required
                />
                <button type="button" class="pw-toggle" @click="showPw = !showPw" tabindex="-1">
                  <EyeOff v-if="showPw" class="icon-sm" />
                  <Eye v-else class="icon-sm" />
                </button>
              </div>
            </div>

            <div v-if="error" class="error-msg">
              <AlertCircle class="icon-sm" />
              <span>{{ error }}</span>
            </div>

            <button id="login-submit" type="submit" class="login-btn" :disabled="loading">
              <Loader2 v-if="loading" class="spin icon-sm" />
              <template v-else>
                <span>Masuk</span>
                <ArrowRight class="icon-sm" />
              </template>
            </button>
          </form>

          <p class="footer-text">&copy; {{ new Date().getFullYear() }} Kasly. All rights reserved.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../stores/auth.js'
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Wallet } from 'lucide-vue-next'

const router = useRouter()
const form = ref({ username: '', password: '' })
const error = ref('')
const loading = ref(false)
const showPw = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  // Note: We will integrate Supabase auth here later as requested
  const result = await login(form.value.username, form.value.password)
  loading.value = false
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.message
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ========================
   LAYOUT UTAMA
======================== */
.login-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Latar abu-abu sangat terang — netral & profesional */
  background-color: #f4f6f9;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
  overflow-y: auto;
  box-sizing: border-box;
}

.login-box {
  display: flex;
  width: 100%;
  max-width: 860px;
  min-height: 500px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.08);
  animation: fadeUp 0.5s ease forwards;
}

/* ========================
   SISI KIRI — BRANDING
======================== */
.login-left {
  flex: 0 0 44%;
  /* Hijau emerald gradient — warna utama Kasly */
  background: linear-gradient(145deg, #059669 0%, #10b981 60%, #34d399 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 36px;
  position: relative;
  overflow: hidden;
}

/* Dekorasi lingkaran samar di background kiri */
.login-left::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
}
.login-left::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: -60px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
}

.login-left-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 260px;
  color: #fff;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 36px;
}

.brand-logo-icon {
  width: 38px;
  height: 38px;
  color: #fff;
}

.brand-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.4px;
}

.brand-tagline h2 {
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.35;
  margin: 0 0 12px;
  color: #fff;
}

.brand-tagline p {
  font-size: 0.82rem;
  line-height: 1.65;
  color: rgba(255,255,255,0.82);
  margin: 0 0 32px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.9);
  line-height: 1.4;
}

.feature-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  flex-shrink: 0;
  margin-top: 5px;
}

/* ========================
   SISI KANAN — FORM
======================== */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 44px;
  background: #fff;
}

.login-form-wrap {
  width: 100%;
  max-width: 310px;
}

/* Logo di form */
.form-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0px;
}

.custom-form-logo {
  height: 110px;
  width: auto;
  object-fit: contain;
}

/* Header form */
.form-header {
  margin-bottom: 24px;
  text-align: center;
}

.form-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.form-header p {
  font-size: 0.79rem;
  color: #64748b;
  margin: 0;
}

/* Fields */
form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 12px;
  width: 15px;
  height: 15px;
  color: #9ca3af;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 36px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  font-size: 0.88rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-sizing: border-box;
}

.input-wrap input::placeholder {
  color: #b8c5d3;
}

.input-wrap input:focus {
  border-color: #10b981;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.pw-toggle {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s;
}
.pw-toggle:hover { color: #374151; }

/* Error */
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 9px;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Tombol submit */
.login-btn {
  margin-top: 4px;
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  letter-spacing: 0.2px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(16, 185, 129, 0.4);
}
.login-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}
.login-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Footer */
.footer-text {
  text-align: center;
  font-size: 0.72rem;
  color: #c0cad6;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

/* Utilities */
.icon-sm { width: 16px; height: 16px; flex-shrink: 0; }
.spin { animation: spin 1s linear infinite; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* ========================
   RESPONSIVE
======================== */
@media (max-width: 700px) {
  .login-left { display: none; }
  .login-right { padding: 36px 24px; }
  .login-form-wrap { max-width: 100%; }
}
</style>
