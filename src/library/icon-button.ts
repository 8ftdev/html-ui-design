export function iconButtonSource(): string {
  return `<script setup lang="ts" vapor>
import Button from './Button.vue'
import Icon from './Icon.vue'

type ButtonProps = Parameters<typeof Button>[0]
const props = withDefaults(defineProps<{
  label: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  disabled?: boolean
  type?: ButtonProps['type']
}>(), { size: 'icon', type: 'button' })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{ default: () => unknown }>()
</script>

<template>
  <Button :variant="props.variant" :size="props.size" :disabled="props.disabled" :type="props.type" :ariaLabel="props.label" @click="emit('click', $event)">
    <Icon><slot /></Icon>
  </Button>
</template>
`;
}
