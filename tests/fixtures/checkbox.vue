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
  "component": "checkbox",
  "behavior": {
    "kind": "native",
    "requirements": [
      "The label slot must contain noninteractive phrasing content. The enclosing label associates it with the input.",
      "Read the current control property after input/change; these factories only initialize values.",
      "Indeterminate is a separate DOM property, not an HTML attribute. Set it in the adapter if needed.",
      "Initialize both defaultChecked and checked so native form reset restores the supplied initial state. Adapters choose whether later updates change the reset baseline."
    ]
  },
  "parts": {
    "control": {
      "node": "control",
      "styleRole": "checkbox",
      "state": {
        "checked": {
          "source": {
            "node": "control",
            "pseudo": "checked"
          }
        },
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

export type CheckboxStyle<Style = string> = Style | { mode: "replace"; value: Style } | { mode: "omit" };

export interface CheckboxClasses<Style = string> {
  control?: {
    base?: CheckboxStyle<Style>;
    unstyled?: boolean;
    state?: {
      checked?: CheckboxStyle<Style>;
      disabled?: CheckboxStyle<Style>;
      focusVisible?: CheckboxStyle<Style>;
      hover?: CheckboxStyle<Style>;
      invalid?: CheckboxStyle<Style>;
      required?: CheckboxStyle<Style>;
    };
  };
  root?: {
    base?: CheckboxStyle<Style>;
    unstyled?: boolean;
    state?: {
      disabled?: CheckboxStyle<Style>;
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
  "checked"?: boolean
  "value"?: string
}
const _htmlUiProps = withDefaults(defineProps<Props>(), {
  "disabled": false,
  "required": false,
  "checked": false,
  "value": "on",
})
defineSlots<{
  "label": () => unknown
}>()
const _htmlUiEmit = defineEmits<{
  "input": [event: Event]
  "change": [event: Event]
  "update:checked": [value: boolean]
}>()
const _htmlUiState0 = _htmlUiRef<boolean>(_htmlUiProps["checked"])
_htmlUiWatch(() => _htmlUiProps["checked"], value => { _htmlUiState0.value = value })
const _htmlUiNode1 = _htmlUiRef<HTMLInputElement | null>(null)
const _htmlUiBaseline1_3 = _htmlUiProps["checked"]
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
      if (value !== undefined) Reflect.set(node, "defaultChecked", value)
    }
    {
      const value = _htmlUiState0.value
      if (value !== undefined) Reflect.set(node, "checked", value)
    }
    {
      const value = _htmlUiProps.value
      Reflect.set(node, "value", value ?? '')
    }
    _htmlUiSyncForms()
    _htmlUiScheduleNativeRead()
  })
}
function _htmlUiEvent0(event: Event) {
  const node = event.currentTarget as HTMLInputElement
  if (!Object.is(_htmlUiState0.value, node["checked"])) {
    _htmlUiState0.value = node["checked"]
    _htmlUiEmit("update:checked", _htmlUiState0.value)
  }
  _htmlUiEmit("input", event)
}
function _htmlUiEvent1(event: Event) {
  const node = event.currentTarget as HTMLInputElement
  if (!Object.is(_htmlUiState0.value, node["checked"])) {
    _htmlUiState0.value = node["checked"]
    _htmlUiEmit("update:checked", _htmlUiState0.value)
  }
  _htmlUiEmit("change", event)
}
let _htmlUiDisposed = false
const _htmlUiForms = new Set<HTMLFormElement>()
function _htmlUiReadNativeState() {
  if (_htmlUiNode1.value) {
    const next = _htmlUiNode1.value["checked"]
    if (!Object.is(_htmlUiState0.value, next)) {
      _htmlUiState0.value = next
      _htmlUiEmit("update:checked", next)
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
  <label data-ui="checkbox" data-ui-part="root">
    <slot name="label" />
    <input type="checkbox" data-ui="checkbox" data-ui-part="control" v-html-ui-bind1 @input="_htmlUiEvent0" @change="_htmlUiEvent1" ref="_htmlUiNode1" />
  </label>
</template>
