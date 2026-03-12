import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const apiClient = axios.create({ baseURL: BASE_URL })

// Attach JWT from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fq_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 — clear token and reload to trigger re-auth (skip auth endpoint itself)
apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('fq_token')
      localStorage.removeItem('finquest-store')
      window.location.reload()
    }
    return Promise.reject(err)
  },
)
