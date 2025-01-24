export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token')
  
  // Exclude login and register pages from auth check
  if (to.path === '/login' || to.path === '/register') {
    return
  }

  // Redirect to login if no token is found
  if (!token.value) {
    return navigateTo('/login')
  }
})