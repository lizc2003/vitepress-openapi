<script setup>
const props = defineProps({
  openapi: {
    type: Object,
    required: true,
  },
})

const servers = props.openapi.parsedSpec.servers ?? []
</script>

<template>
  <div>
    <OAHeading level="h2">
      {{ $t('Servers') }}
    </OAHeading>

    <div class="flex flex-col space-y-4">
      <div v-for="server in servers" :key="server.url" class="flex flex-col p-3 gap-2 rounded bg-muted">
        <span class="font-semibold select-all">
          {{ server.url }}
        </span>

        <span v-if="server.description" class="text-gray-600 dark:text-gray-300">
          {{ server.description }}
        </span>
      </div>
    </div>
  </div>
</template>
