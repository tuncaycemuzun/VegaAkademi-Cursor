export default defineNuxtPlugin((nuxtApp) => {
  const { token } = useAuth()

  nuxtApp.hook('app:created', () => {
    nuxtApp.$fetch = $fetch.create({
      onRequest({ options }) {
        // Token varsa ekle
        if (token.value) {
          options.headers = new Headers(options.headers || {})
          options.headers.set('Authorization', `Bearer ${token.value}`)
        }
      },
      onResponseError({ response }) {
        // Token geçersizse logout
        if (response.status === 401) {
          const { logout } = useAuth()
          logout()
        }
      }
    })
  })
}) 