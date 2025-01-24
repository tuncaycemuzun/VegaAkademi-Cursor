<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

const handleSubmit = async () => {
  try {
    error.value = ''
    const { data } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value
      }
    })
    
    if (data.value) {
      router.push('/login')
    }
  } catch (e) {
    error.value = 'Registration failed. Please try again.'
  }
}
</script>

<template>
  <div>
    <h2 class="text-center text-3xl font-bold text-gray-900 mb-8">Create your account</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="error" class="bg-red-50 text-red-500 p-3 rounded text-center text-sm">
        {{ error }}
      </div>

      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
        />
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
          Register
        </button>
      </div>

      <div class="text-center text-sm">
        <span class="text-gray-600">Already have an account?</span>
        <NuxtLink to="/login" class="ml-1 text-gray-900 hover:underline">Sign in</NuxtLink>
      </div>
    </form>
  </div>
</template> 