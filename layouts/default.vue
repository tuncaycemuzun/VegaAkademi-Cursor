<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const { logout } = useAuth()
const router = useRouter()

const showDropdown = ref(false)

const handleLogout = async () => {
    try {
        await logout()
        router.push('/login')
    } catch (error) {
        console.error('Failed to logout:', error)
    }
}

// Dropdown dışına tıklandığında kapanması için
const dropdownRef = ref(null)
onClickOutside(dropdownRef, () => {
    showDropdown.value = false
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/posts" class="flex items-center px-2 py-2 text-gray-900 hover:text-gray-700">
              <span class="text-xl font-semibold">Blog</span>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <!-- Dropdown Menu -->
            <div class="relative" ref="dropdownRef">
              <button
                @click="showDropdown = !showDropdown"
                class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Content -->
              <div v-if="showDropdown" 
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 border border-gray-200">
                <NuxtLink 
                  to="/profile" 
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </NuxtLink>
                <NuxtLink 
                  to="/saved" 
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Saved Posts
                </NuxtLink>
                <button 
                  @click="handleLogout"
                  class="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="rounded-lg p-6 h-full">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center text-gray-600 text-sm">
          © {{ new Date().getFullYear() }} Blog. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template> 