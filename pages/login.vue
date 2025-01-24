<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

interface LoginResponse {
  token: string
  id: string
  name: string
  email: string
  role: string
}

const router = useRouter()
const { setToken, setUser } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')

const handleSubmit = async () => {
  try {
    error.value = ''
    const { data } = await useFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })
    
    if (data.value?.token) {
      setToken(data.value.token)
      const userData = {
        id: data.value.id,
        name: data.value.name,
        email: data.value.email,
        role: data.value.role
      }
      setUser(userData)
      router.push('/posts')
    }
  } catch (e) {
    error.value = 'Invalid email or password'
  }
}
</script>

<template>
  <div>
    <h2 class="text-center text-3xl font-bold text-gray-900 mb-8">Sign in to your account</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="error" class="bg-red-50 text-red-500 p-3 rounded text-center text-sm">
        {{ error }}
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
        />
      </div>

      <div>
        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Sign in
        </button>
      </div>

      <div class="text-center text-sm">
        <span class="text-gray-600">Don't have an account?</span>
        <NuxtLink to="/register" class="ml-1 text-gray-900 hover:underline">Register</NuxtLink>
      </div>
    </form>
  </div>
</template> 