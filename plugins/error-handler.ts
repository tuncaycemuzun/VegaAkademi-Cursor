export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error: any) => {
        // 401 hatası kontrolü
        if (error?.response?.status === 401) {
            navigateTo('/auth/login')
        }
        console.error('Global error:', error)
    }
}) 