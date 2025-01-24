<script setup lang="ts">
const props = defineProps<{
  show: boolean
  title: string
  fullscreen?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center text-center">
        <div class="fixed inset-0 transition-opacity" @click="emit('close')">
          <div class="absolute inset-0 bg-gray-custom-500 opacity-75"></div>
        </div>

        <div
          :class="[
            'relative w-full transform overflow-hidden bg-white text-left shadow-xl transition-all',
            fullscreen ? 'min-h-screen' : 'sm:my-8 sm:max-w-lg rounded-lg'
          ]"
        >
          <div class="absolute top-0 right-0 pt-4 pr-4 z-10">
            <button
              type="button"
              class="rounded-md bg-white text-gray-custom-400 hover:text-gray-custom-500 focus:outline-none"
              @click="emit('close')"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div :class="[fullscreen ? 'p-4 sm:p-6' : 'px-4 pt-5 pb-4 sm:p-6']">
            <div class="w-full">
              <h3 class="text-lg font-medium leading-6 text-gray-custom-900 mb-4">
                {{ title }}
              </h3>
              <div :class="{ 'mt-2': !fullscreen }">
                <slot />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template> 