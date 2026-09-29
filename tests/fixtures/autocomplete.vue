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
  "component": "autocomplete",
  "behavior": {
    "kind": "native",
    "requirements": [
      "The control is associated with its enclosing label. Supply valid option elements.",
      "Datalist is a basic suggestion UI; it does not provide rich controlled combobox behavior, async filtering, or a fixed option-only value.",
      "The native factory takes one HTMLElement per slot; framework converters can map the slot to their own multi-node content representation."
    ]
  },
  "parts": {
    "control": {
      "node": "control",
      "styleRole": "input",
      "state": {
        "disabled": {
          "source": {
            "node": "control",
            "pseudo": "disabled"
          }
        },
        "focusVisible": {
          "source": {
            "node": "control",
            "pseudo": "focus-visible"
          }
        },
        "hover": {
          "source": {
            "node": "control",
            "pseudo": "hover"
          }
        },
        "invalid": {
          "source": {
            "node": "control",
            "pseudo": "invalid"
          }
        },
        "required": {
          "source": {
            "node": "control",
            "pseudo": "required"
          }
        }
      }
    },
    "options": {
      "node": "options",
      "styleRole": "options"
    },
    "root": {
      "node": "root",
      "styleRole": "field",
      "state": {
        "disabled": {
          "source": {
            "node": "control",
            "pseudo": "disabled"
          }
        }
      }
    }
  }
} as const;

export type AutocompleteStyle<Style = string> = Style | { mode: "replace"; value: Style } | { mode: "omit" };

export interface AutocompleteClasses<Style = string> {
  control?: {
    base?: AutocompleteStyle<Style>;
    unstyled?: boolean;
    state?: {
      disabled?: AutocompleteStyle<Style>;
      focusVisible?: AutocompleteStyle<Style>;
      hover?: AutocompleteStyle<Style>;
      invalid?: AutocompleteStyle<Style>;
      required?: AutocompleteStyle<Style>;
    };
  };
  options?: {
    base?: AutocompleteStyle<Style>;
    unstyled?: boolean;
  };
  root?: {
    base?: AutocompleteStyle<Style>;
    unstyled?: boolean;
    state?: {
      disabled?: AutocompleteStyle<Style>;
    };
  };
}
</script>

<script setup lang="ts" vapor>
import { ref as _htmlUiRef, watch as _htmlUiWatch, onMounted as _htmlUiOnMounted, onUpdated as _htmlUiOnUpdated, onBeforeUnmount as _htmlUiOnBeforeUnmount, watchEffect as _htmlUiWatchEffect } from 'vue'

interface Props {
  "name"?: string
  "disabled"?: boolean
  "required"?: boolean
  "listId": string
}
const _htmlUiProps = withDefaults(defineProps<Props>(), {
  "disabled": false,
  "required": false,
})
defineSlots<{
  "label": () => unknown
  "options": () => unknown
}>()
const _htmlUiEmit = defineEmits<{
  "input": [event: Event]
  "change": [event: Event]
}>()
const vHtmlUiBind1 = (node: Element) => {
  _htmlUiWatchEffect(() => {
    {
      const value = _htmlUiProps.name
      if (value === undefined) node.removeAttribute("name")
      else node.setAttribute("name", String(value))
    }
    {
      const value = _htmlUiProps.disabled
      if (value !== undefined) Reflect.set(node, "disabled", value)
    }
    {
      const value = _htmlUiProps.required
      if (value !== undefined) Reflect.set(node, "required", value)
    }
    {
      const value = _htmlUiProps.listId
      if (value === undefined) node.removeAttribute("list")
      else node.setAttribute("list", String(value))
    }
  })
}
const vHtmlUiBind2 = (node: Element) => {
  _htmlUiWatchEffect(() => {
    {
      const value = _htmlUiProps.listId
      if (value === undefined) node.removeAttribute("id")
      else node.setAttribute("id", String(value))
    }
  })
}
function _htmlUiEvent0(event: Event) {
  _htmlUiEmit("input", event)
}
function _htmlUiEvent1(event: Event) {
  _htmlUiEmit("change", event)
}
</script>

<template>
  <label data-ui="autocomplete" data-ui-part="root">
    <slot name="label" />
    <input type="text" data-ui="autocomplete" data-ui-part="control" v-html-ui-bind1 @input="_htmlUiEvent0" @change="_htmlUiEvent1" />
    <datalist data-ui="autocomplete" data-ui-part="options" v-html-ui-bind2>
      <slot name="options" />
    </datalist>
  </label>
</template>
