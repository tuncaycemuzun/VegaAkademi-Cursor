import type { User } from "~/types/user"

export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user } = useAuth()
  
  // Exclude login and register pages from auth check
  if (to.path === '/login' || to.path === '/register') {
    if (token.value) {
      return navigateTo('/posts')
    }
    return
  }

  // Redirect to login if no token is found
  if (!token.value) {
    return navigateTo('/login')
  }

  // If we have a token but no user, try to fetch user data
  if (token.value && !user.value) {
    try {
      const { data } = await useFetchAuth<User>('/api/auth/me')
      if (data.value) {
        user.value = data.value
      } else {
        token.value = null
        return navigateTo('/login')
      }
    } catch (error) {
      token.value = null
      return navigateTo('/login')
    }
  }
})