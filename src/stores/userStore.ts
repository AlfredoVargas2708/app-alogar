import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from '@/services/api'

interface User {
  id: number
  usuario: string
  ultimoInicioSesion: string
}

interface UserRequest {
  usuario: string
  password: string
}

export const useUserStore = defineStore('users', () => {
  const userData = ref<User>()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data?.message ?? fallback
    }

    return fallback
  }

  async function loginUser(user: UserRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post<User>('/login', user)
      return response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al iniciar sesión')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function signUpUser(user: UserRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post<User>('/signup', user)
      return response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Error al crear cuenta')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    userData,
    isLoading,
    error,
    loginUser,
    signUpUser,
  }
})
