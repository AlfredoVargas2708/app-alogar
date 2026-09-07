import axios from 'axios'

const fallbackToken =
  import.meta.env.VITE_API_TOKEN ??
  'a10ca26e0f94f01e6001c0044f305f5c7387a9adf3cfeedfa15f09aa08ab11ae'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// URL base pública del backend (sin barra final)
export const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

// Resuelve la ruta de una imagen: las subidas al backend llegan como
// "/uploads/<archivo>" (relativa) y las de Shopify como URL absoluta
export function getImageSrc(src: string | null | undefined): string {
  if (!src) {
    return ''
  }

  return src.startsWith('/') ? `${apiUrl}${src}` : src
}

// Adjunta el JWT del usuario logueado; si no hay sesión, usa el token de respaldo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || fallbackToken
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el token expiró o es inválido, limpia la sesión y vuelve al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('username')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
