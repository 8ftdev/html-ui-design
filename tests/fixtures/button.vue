<script lang="ts">
import type {} from 'vue';

// Native attributes absent from the pinned Vue HTML types.
declare module 'vue' {
  interface HTMLAttributes {
    'data-ui'?: string;
    'data-ui-part'?: string;
  }
}

export const contractVersion = 2 as const;
export const ui = {
  "component": "button",
  "behavior": {
    "kind": "native",
    "requirements": [
      "Application actions are external. Use submit only inside the intended form."
    ]
  },
  "parts": {
    "root": {
      "node": "root",
      "styleRole": "action",
      "state": {
        "active": {
          "source": {
            "node": "root",
            "pseudo": "active"
          }
        },
        "disabled": {
          "source": {
            "node": "root",
            "pseudo": "disabled"
          }
        },
        "focusVisible": {
          "source": {
            "node": "root",
            "pseudo": "focus-visible"
          }
        },
        "hover": {
          "source": {
            "node": "root",
            "pseudo": "hover"
          }
        }
      }
    }
  }
} as const;

export type ButtonStyle<Style = string> = Style | { mode: "replace"; value: Style } | { mode: "omit" };

export interface ButtonClasses<Style = string> {
  root?: {
    base?: ButtonStyle<Style>;
    unstyled?: boolean;
    state?: {
      active?: ButtonStyle<Style>;
      disabled?: ButtonStyle<Style>;
      focusVisible?: ButtonStyle<Style>;
      hover?: ButtonStyle<Style>;
    };
  };
}
</script>

<script setup lang="ts" vapor>
import { ref as _htmlUiRef, watch as _htmlUiWatch, onMounted as _htmlUiOnMounted, onUpdated as _htmlUiOnUpdated, onBeforeUnmount as _htmlUiOnBeforeUnmount, watchEffect as _htmlUiWatchEffect } from 'vue'

interface Props {
  "disabled"?: boolean
  "type"?: "button" | "submit" | "reset"
}
const _htmlUiProps = withDefaults(defineProps<Props>(), {
  "disabled": false,
  "type": "button",
})
defineSlots<{
  "label": () => unknown
}>()
const _htmlUiEmit = defineEmits<{
  "click": [event: MouseEvent]
}>()
const vHtmlUiBind0 = (node: Element) => {
  _htmlUiWatchEffect(() => {
    {
      const value = _htmlUiProps.disabled
      if (value !== undefined) Reflect.set(node, "disabled", value)
    }
    {
      const value = _htmlUiProps.type
      if (value !== undefined) Reflect.set(node, "type", value)
    }
  })
}
function _htmlUiEvent0(event: MouseEvent) {
  _htmlUiEmit("click", event)
}
</script>

<template>
  <button data-ui="button" data-ui-part="root" v-html-ui-bind0 @click="_htmlUiEvent0">
    <slot name="label" />
  </button>
</template>
