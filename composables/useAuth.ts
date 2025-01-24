interface User {
  id: string
  name: string
  email: string
  role: string
}

export const useAuth = () => {
  const token = useCookie('token')
  const user = useState<User | null>('user', () => null)

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return {
    token,
    user,
    setToken,
    setUser,
    logout
  }
} 