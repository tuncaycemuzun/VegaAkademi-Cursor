// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET
  },

  compatibilityDate: '2025-01-23'
})