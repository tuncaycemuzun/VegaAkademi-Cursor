<template>
  <div class="min-h-screen bg-gray-custom-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-gray-custom-900">
              Blog
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/posts"
              class="text-gray-custom-600 hover:text-gray-custom-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Posts
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="text-gray-custom-600 hover:text-gray-custom-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Profile
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center text-gray-custom-500 text-sm">
          © {{ new Date().getFullYear() }} Blog. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template> 