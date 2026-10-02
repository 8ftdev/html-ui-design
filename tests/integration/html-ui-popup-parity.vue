<!-- Local generated popup/menu parity preview. -->
<script setup lang="ts" vapor>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import {Popover,DropdownMenu,ContextMenu,Button,Icon,IconButton,Input,Separator,Dialog,Direction,Fieldset} from '~/components/html-ui-plugin-batch'
const dark=ref(false),side=ref<'top'|'bottom'|'left'|'right'>('bottom'),align=ref<'start'|'center'|'end'>('start'),action=ref('None'),locked=ref(false),mounted=ref(true),extra=ref(false),customRow=ref(false),popupId=ref('workspace-menu')
let previousDark=false
onMounted(()=>{previousDark=document.documentElement.classList.contains('dark');document.documentElement.classList.remove('dark')})
watch(dark,v=>document.documentElement.classList.toggle('dark',v))
onBeforeUnmount(()=>document.documentElement.classList.toggle('dark',previousDark))
const nextSide=()=>{const values=['bottom','left','top','right'] as const;side.value=values[(values.indexOf(side.value)+1)%4]!}
const nextAlign=()=>{const values=['start','center','end'] as const;align.value=values[(values.indexOf(align.value)+1)%3]!}
</script>
<template>
 <main class="parity-lab min-h-screen bg-background p-6 text-foreground" :class="{dark}">
  <div class="mx-auto grid max-w-4xl gap-8">
   <header class="flex items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold">Popups and menus</h1><p class="text-sm text-muted-foreground">Local Vue/Vapor · Base Nova surfaces · pointer and keyboard anchors</p></div><IconButton :label="dark?'Light theme':'Dark theme'" variant="outline" @click="dark=!dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg></IconButton></header>
   <div class="grid items-start gap-8 md:grid-cols-2">
    <section class="grid gap-4"><h2 class="font-medium">Popover</h2><p class="text-sm text-muted-foreground">An editable form inside a compact, anchored surface.</p>
     <div class="w-fit overflow-hidden rounded-lg border border-border p-3"><Popover id="settings-popup" variant="outline" :side="side" :align="align" :side-offset="6"><template #trigger>Workspace settings</template><h3 class="font-medium">Dimensions</h3><p class="text-muted-foreground">Set the size for your report preview.</p><Input id="popup-width" value="100%">Width</Input><Input id="popup-height" value="200px">Height</Input></Popover></div>
     <div class="flex flex-wrap gap-2"><Button variant="outline" @click="nextSide">Side: {{side}}</Button><Button variant="outline" @click="nextAlign">Align: {{align}}</Button></div>
    </section>
    <section class="grid gap-4"><h2 class="font-medium">DropdownMenu</h2><p class="text-sm text-muted-foreground">Arrow keys skip disabled rows. Type a label to move focus.</p>
     <div class="flex flex-wrap items-start gap-2"><DropdownMenu :id="popupId" label="Workspace actions" variant="outline" :side="side" :align="align"><template #trigger>Workspace actions</template>
      <Button role="menuitem" variant="menu" :classes="{root:customRow?'h-12 justify-center bg-destructive focus:bg-destructive':''}" @click="action='New report'"><Icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></Icon>New report<span data-ui-shortcut aria-hidden="true">⌘N</span></Button>
      <Button role="menuitem" variant="menu" :aria-disabled="true" @click="action='Blocked'">Locked report</Button>
      <Button v-if="extra" role="menuitem" variant="menu" @click="action='Duplicate report'">Duplicate report</Button>
      <Separator />
      <Button role="menuitem" variant="menu" @click="action='Export report'">Export report<span data-ui-shortcut aria-hidden="true">⌘E</span></Button>
      <Button role="menuitem" variant="menu" data-variant="destructive" @click="action='Delete report'">Delete report</Button>
     </DropdownMenu><Button variant="outline">After actions</Button></div>
     <div class="flex flex-wrap gap-2"><Button variant="outline" @click="extra=!extra">{{extra?'Remove duplicate':'Add duplicate'}}</Button><Button variant="outline" @click="popupId=popupId==='workspace-menu'?'renamed-menu':'workspace-menu'">Change menu ID</Button></div>
     <Button variant="outline" @click="customRow=!customRow">{{customRow?'Default row style':'Custom row style'}}</Button><p class="text-sm" data-testid="last-action">Last action: {{action}}</p>
    </section>
   </div>
   <section class="grid gap-4 border-t border-border pt-6"><h2 class="font-medium">ContextMenu</h2><p class="text-sm text-muted-foreground">Right-click at any point in the target. Shift+F10 or clicking uses its button anchor.</p>
    <ContextMenu id="context-popup" label="Report context actions" variant="outline" :classes="{trigger:'h-28 w-full border-dashed'}"><template #trigger>Report context target</template><Button role="menuitem" variant="menu" @click="action='Inspect report'">Inspect report</Button><Button role="menuitem" variant="menu" @click="action='Copy report link'">Copy report link</Button><Button role="menuitem" variant="menu" @click="action='Archive report'">Archive report</Button></ContextMenu>
   </section>
   <section class="grid gap-4 border-t border-border pt-6"><h2 class="font-medium">Disabled and RTL composition</h2>
    <Fieldset :disabled="locked"><template #legend>Workspace controls</template><div class="flex flex-wrap gap-4"><Popover id="disabled-popup" variant="outline"><template #trigger>Disabled settings</template>Unavailable when the fieldset is disabled.</Popover><DropdownMenu id="disabled-menu" label="Disabled actions" variant="outline"><template #trigger>Disabled actions</template><Button role="menuitem" variant="menu">Save settings</Button></DropdownMenu></div></Fieldset>
    <Button variant="outline" class="w-fit" @click="locked=!locked">{{locked?'Enable controls':'Disable controls'}}</Button>
    <Direction dir="rtl"><DropdownMenu id="rtl-menu" label="إجراءات الحساب" variant="outline" align="end"><template #trigger>إجراءات الحساب</template><Button role="menuitem" variant="menu">تعديل الحساب</Button><Button role="menuitem" variant="menu">تسجيل الخروج</Button></DropdownMenu></Direction>
   </section>
   <section class="grid gap-4 border-t border-border pt-6"><h2 class="font-medium">Dialog composition and cleanup</h2><div class="flex flex-wrap items-start gap-4">
    <Dialog close-size="default" id="popup-dialog" title-id="popup-dialog-title"><template #trigger>Open menu dialog</template><template #title>Report settings</template><DropdownMenu id="dialog-menu" label="Dialog actions" variant="outline"><template #trigger>Dialog actions</template><Button role="menuitem" variant="menu">Save draft</Button></DropdownMenu><template #close>Close dialog</template></Dialog>
    <Button variant="outline" @click="mounted=!mounted">{{mounted?'Unmount popup':'Mount popup'}}</Button><Popover v-if="mounted" id="override-popup" variant="outline" side="left" :styles="{popup:{maxWidth:'12rem'}}" :classes="{popup:'rounded-none'}"><template #trigger>Local override</template>Owned parts stay editable.</Popover>
   </div></section>
   <section class="grid gap-3 border-t border-border pt-6"><h2 class="font-medium">Compact consumer API</h2><pre class="overflow-auto text-xs"><code>&lt;DropdownMenu id="actions" label="Report actions" side="bottom"&gt;
  &lt;template #trigger&gt;Actions&lt;/template&gt;
  &lt;Button role="menuitem" variant="menu" @click="exportReport"&gt;Export&lt;/Button&gt;
&lt;/DropdownMenu&gt;</code></pre></section>
  </div>
 </main>
</template>
<style scoped>
.parity-lab {
  --popover: oklch(1 0 0); --popover-foreground: oklch(.145 0 0); --accent: oklch(.97 0 0); --accent-foreground: oklch(.205 0 0); --background: oklch(1 0 0); --foreground: oklch(.145 0 0);
  --primary: oklch(.205 0 0); --primary-foreground: oklch(.985 0 0);
  --muted: oklch(.97 0 0); --muted-foreground: oklch(.556 0 0);
  --destructive: oklch(.577 .245 27.325); --border: oklch(.922 0 0);
  --input: oklch(.922 0 0); --ring: oklch(.708 0 0);
  --color-background:var(--background); --color-foreground:var(--foreground);
  --color-primary:var(--primary); --color-primary-foreground:var(--primary-foreground);
  --color-muted:var(--muted); --color-muted-foreground:var(--muted-foreground);
  --color-destructive:var(--destructive); --color-border:var(--border);
  --color-input:var(--input); --color-ring:var(--ring);
  --color-popover:var(--popover); --color-popover-foreground:var(--popover-foreground); --color-accent:var(--accent); --color-accent-foreground:var(--accent-foreground);
  color-scheme: light;
}
.parity-lab.dark {
  --popover: oklch(.205 0 0); --popover-foreground: oklch(.985 0 0); --accent: oklch(.269 0 0); --accent-foreground: oklch(.985 0 0); --background: oklch(.145 0 0); --foreground: oklch(.985 0 0);
  --primary: oklch(.922 0 0); --primary-foreground: oklch(.205 0 0);
  --muted: oklch(.269 0 0); --muted-foreground: oklch(.708 0 0);
  --destructive: oklch(.704 .191 22.216); --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%); --ring: oklch(.556 0 0);
  color-scheme: dark;
}
</style>
