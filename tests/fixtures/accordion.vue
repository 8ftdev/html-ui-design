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
  "component": "accordion",
  "behavior": {
    "kind": "native",
    "requirements": [
      "The summary is the first child. Its native activation opens or closes the details.",
      "Read root.open on toggle to synchronize adapter state; slot scope is an initial snapshot in the native factory.",
      "For exclusive groups use the same nonempty name in the same tree, not necessarily siblings. Do not nest members of the same named group."
    ]
  },
  "parts": {
    "root": {
      "node": "root",
      "styleRole": "disclosure",
      "state": {
        "expanded": {
          "source": {
            "node": "root",
            "attribute": "open",
            "present": true
          }
        }
      }
    },
    "trigger": {
      "node": "summary",
      "styleRole": "disclosure-trigger",
      "state": {
        "expanded": {
          "source": {
            "node": "root",
            "attribute": "open",
            "present": true
          }
        },
        "focusVisible": {
          "source": {
            "node": "summary",
            "pseudo": "focus-visible"
          }
        },
        "hover": {
          "source": {
            "node": "summary",
            "pseudo": "hover"
          }
        }
      }
    }
  }
} as const;

export type AccordionStyle<Style = string> = Style | { mode: "replace"; value: Style } | { mode: "omit" };

export interface AccordionClasses<Style = string> {
  root?: {
    base?: AccordionStyle<Style>;
    unstyled?: boolean;
    state?: {
      expanded?: AccordionStyle<Style>;
    };
  };
  trigger?: {
    base?: AccordionStyle<Style>;
    unstyled?: boolean;
    state?: {
      expanded?: AccordionStyle<Style>;
      focusVisible?: AccordionStyle<Style>;
      hover?: AccordionStyle<Style>;
    };
  };
}
</script>

<script setup lang="ts" vapor>
import { ref as _htmlUiRef, watch as _htmlUiWatch, onMounted as _htmlUiOnMounted, onUpdated as _htmlUiOnUpdated, onBeforeUnmount as _htmlUiOnBeforeUnmount, watchEffect as _htmlUiWatchEffect } from 'vue'

interface Props {
  "name"?: string
  "open"?: boolean
}
const _htmlUiProps = withDefaults(defineProps<Props>(), {
  "open": false,
})
defineSlots<{
  "summary": () => unknown
  "content"?: (scope: { "open": boolean; }) => unknown
}>()
const _htmlUiEmit = defineEmits<{
  "toggle": [event: ToggleEvent]
  "update:open": [value: boolean]
}>()
const _htmlUiState0 = _htmlUiRef<boolean>(_htmlUiProps["open"])
_htmlUiWatch(() => _htmlUiProps["open"], value => { _htmlUiState0.value = value })
const _htmlUiNode0 = _htmlUiRef<HTMLDetailsElement | null>(null)
const vHtmlUiBind0 = (node: Element) => {
  _htmlUiWatchEffect(() => {
    {
      const value = _htmlUiProps.name
      if (value === undefined) node.removeAttribute("name")
      else node.setAttribute("name", String(value))
    }
    {
      const value = _htmlUiState0.value
      if (value !== undefined) Reflect.set(node, "open", value)
    }
    _htmlUiSyncForms()
    _htmlUiScheduleNativeRead()
  })
}
function _htmlUiEvent0(event: ToggleEvent) {
  const node = event.currentTarget as HTMLDetailsElement
  if (!Object.is(_htmlUiState0.value, node["open"])) {
    _htmlUiState0.value = node["open"]
    _htmlUiEmit("update:open", _htmlUiState0.value)
  }
  _htmlUiEmit("toggle", event)
}
let _htmlUiDisposed = false
const _htmlUiForms = new Set<HTMLFormElement>()
function _htmlUiReadNativeState() {
  if (_htmlUiNode0.value) {
    const next = _htmlUiNode0.value["open"]
    if (!Object.is(_htmlUiState0.value, next)) {
      _htmlUiState0.value = next
      _htmlUiEmit("update:open", next)
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
  <details data-ui="accordion" data-ui-part="root" v-html-ui-bind0 @toggle="_htmlUiEvent0" ref="_htmlUiNode0">
    <summary data-ui="accordion" data-ui-part="trigger">
      <slot name="summary" />
    </summary>
    <slot name="content" v-bind="{ open: _htmlUiState0 }" />
  </details>
</template>
