import type { UseFetchOptions } from 'nuxt/app'

export function useFetchAuth<T>(url: string, options: UseFetchOptions<T> = {}) {
  const { token } = useAuth()
  
  const defaults: UseFetchOptions<T> = {
    key: url,
    headers: {
      ...options.headers,
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    },
    // Hata yönetimi için
    onResponseError({ response }) {
      const status = response.status
      if (status === 401 || status === 403) {
        navigateTo('/login')
      }
    }
  }

  // options'ı defaults ile birleştir
  const params = {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...options.headers
    }
  }

  return useFetch(url, params)
} 