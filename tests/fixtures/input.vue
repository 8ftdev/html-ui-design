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
  "component": "input",
  "behavior": {
    "kind": "native",
    "requirements": [
      "The label slot must contain noninteractive phrasing content. The enclosing label associates it with the input.",
      "Read the current control property after input/change; these factories only initialize values.",
      "Initialize both defaultValue and value so native form reset restores the supplied initial text. Adapters choose whether later updates change the reset baseline."
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

export type InputStyle<Style = string> = Style | { mode: "replace"; value: Style } | { mode: "omit" };

export interface InputClasses<Style = string> {
  control?: {
    base?: InputStyle<Style>;
    unstyled?: boolean;
    state?: {
      disabled?: InputStyle<Style>;
      focusVisible?: InputStyle<Style>;
      hover?: InputStyle<Style>;
      invalid?: InputStyle<Style>;
      required?: InputStyle<Style>;
    };
  };
  root?: {
    base?: InputStyle<Style>;
    unstyled?: boolean;
    state?: {
      disabled?: InputStyle<Style>;
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
  "value"?: string
  "placeholder"?: string
}
const _htmlUiProps = withDefaults(defineProps<Props>(), {
  "disabled": false,
  "required": false,
  "value": "",
})
defineSlots<{
  "label": () => unknown
}>()
const _htmlUiEmit = defineEmits<{
  "input": [event: Event]
  "change": [event: Event]
  "update:value": [value: string]
}>()
const _htmlUiState0 = _htmlUiRef<string>(_htmlUiProps["value"])
_htmlUiWatch(() => _htmlUiProps["value"], value => { _htmlUiState0.value = value })
const _htmlUiNode1 = _htmlUiRef<HTMLInputElement | null>(null)
const _htmlUiBaseline1_3 = _htmlUiProps["value"]
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
      const value = _htmlUiBaseline1_3
      if (value !== undefined) Reflect.set(node, "defaultValue", value)
    }
    {
      const value = _htmlUiState0.value
      Reflect.set(node, "value", value ?? '')
    }
    {
      const value = _htmlUiProps.placeholder
      if (value === undefined) node.removeAttribute("placeholder")
      else node.setAttribute("placeholder", String(value))
    }
    _htmlUiSyncForms()
    _htmlUiScheduleNativeRead()
  })
}
function _htmlUiEvent0(event: Event) {
  const node = event.currentTarget as HTMLInputElement
  if (!Object.is(_htmlUiState0.value, node["value"])) {
    _htmlUiState0.value = node["value"]
    _htmlUiEmit("update:value", _htmlUiState0.value)
  }
  _htmlUiEmit("input", event)
}
function _htmlUiEvent1(event: Event) {
  const node = event.currentTarget as HTMLInputElement
  if (!Object.is(_htmlUiState0.value, node["value"])) {
    _htmlUiState0.value = node["value"]
    _htmlUiEmit("update:value", _htmlUiState0.value)
  }
  _htmlUiEmit("change", event)
}
let _htmlUiDisposed = false
const _htmlUiForms = new Set<HTMLFormElement>()
function _htmlUiReadNativeState() {
  if (_htmlUiNode1.value) {
    const next = _htmlUiNode1.value["value"]
    if (!Object.is(_htmlUiState0.value, next)) {
      _htmlUiState0.value = next
      _htmlUiEmit("update:value", next)
    }
  }
}
let _htmlUiReadQueued = false
function _htmlUiScheduleNativeRead() {
  if (_htmlUiReadQueued || _htmlUiDisposed) return
  _htmlUiReadQueued = true
  queueMicrotask(() => {
    _htmlUiReadQueued = false
    if (!_htmlUiDisposed) _htmlUiReadNativeState()
  })
}
function _htmlUiOnReset(event: Event) {
  queueMicrotask(() => {
    if (_htmlUiDisposed || event.defaultPrevented) return
    _htmlUiReadNativeState()
  })
}
function _htmlUiDetachResetListeners() {
  for (const form of _htmlUiForms) form.removeEventListener('reset', _htmlUiOnReset)
  _htmlUiForms.clear()
}
function _htmlUiSyncForms() {
  const next = new Set<HTMLFormElement>()
  if (_htmlUiNode1.value?.form) next.add(_htmlUiNode1.value.form)
  for (const form of _htmlUiForms) if (!next.has(form)) form.removeEventListener('reset', _htmlUiOnReset)
  for (const form of next) if (!_htmlUiForms.has(form)) form.addEventListener('reset', _htmlUiOnReset)
  _htmlUiForms.clear()
  for (const form of next) _htmlUiForms.add(form)
}
_htmlUiOnMounted(() => { _htmlUiSyncForms(); _htmlUiReadNativeState() })
_htmlUiOnUpdated(() => { _htmlUiSyncForms(); _htmlUiReadNativeState() })
_htmlUiOnBeforeUnmount(() => { _htmlUiDisposed = true; _htmlUiDetachResetListeners() })
</script>

<template>
  <label data-ui="input" data-ui-part="root">
    <slot name="label" />
    <input type="text" data-ui="input" data-ui-part="control" v-html-ui-bind1 @input="_htmlUiEvent0" @change="_htmlUiEvent1" ref="_htmlUiNode1" />
  </label>
</template>
