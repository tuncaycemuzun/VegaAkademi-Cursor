<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-custom-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <NuxtLink to="/" class="text-3xl font-bold text-gray-custom-900">Blog</NuxtLink>
      </div>
      <slot />
    </div>
  </div>
</template> 