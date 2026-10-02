<!-- Generated integration fixture: local searchable Combobox and Command. -->
<script setup lang="ts" vapor>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import {Combobox,Command,Button,IconButton,Field,Fieldset,Dialog,Direction} from '~/components/html-ui-plugin-batch'
const dark=ref(false),framework=ref('nuxt'),requiredValue=ref(''),locked=ref(true),extra=ref(false),mounted=ref(true),actions=ref<string[]>([])
const teams=Array.from({length:40},(_,i)=>({value:String(i+1),label:`Workspace ${i+1}`}))
let previousDark=false
onMounted(()=>{previousDark=document.documentElement.classList.contains('dark');document.documentElement.classList.remove('dark')})
watch(dark,value=>document.documentElement.classList.toggle('dark',value))
onBeforeUnmount(()=>document.documentElement.classList.toggle('dark',previousDark))
const run=(value:string)=>{actions.value=[...actions.value,value]}
</script>
<template>
 <main class="parity-lab min-h-screen bg-background p-6 text-foreground" :class="{dark}">
  <div class="mx-auto grid max-w-5xl gap-6">
   <header class="flex items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold">Searchable primitives</h1><p class="text-sm text-muted-foreground">Local Vue/Vapor · Base Nova recipes · native values, shared option projection</p></div><IconButton :label="dark?'Light theme':'Dark theme'" variant="outline" @click="dark=!dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg></IconButton></header>
   <div class="grid items-start gap-6 md:grid-cols-2">
    <form data-testid="search-form" class="grid gap-4 rounded-xl border border-border p-4" @submit.prevent>
     <h2 class="text-base font-medium">Combobox</h2>
     <Field id="search-framework" description-id="framework-help"><template #label>Framework</template><template #control="{id}"><Combobox :id="id" popup-id="framework-options" name="framework" v-model:value="framework" aria-describedby="framework-help" placeholder="Search frameworks…"><template #options><option value="" hidden>Choose framework</option><option value="nuxt">Nuxt</option><optgroup label="Alternatives"><option value="next" disabled>Next.js (unavailable)</option><option value="astro" data-keywords="stars static">Astro</option><option value="svelte">SvelteKit</option><option v-if="extra" value="qwik">Qwik</option></optgroup></template></Combobox></template><template #description>Type to filter. Enter selects. Escape cancels.</template></Field>
     <p data-testid="framework-model" class="text-sm text-muted-foreground">{{framework}}</p>
     <div class="flex flex-wrap gap-2"><Button type="button" variant="outline" @click="framework='astro'">Set Astro</Button><Button type="button" variant="outline" @click="framework=''">Clear selection</Button><Button type="button" variant="outline" @click="extra=!extra">{{extra?'Remove Qwik':'Add Qwik'}}</Button></div>
     <Combobox id="required-search" popup-id="required-search-options" name="required" required v-model:value="requiredValue" placeholder="Choose a plan…">Required plan<template #options><option value="" hidden>Choose plan</option><option value="personal">Personal</option><option value="team">Team</option></template></Combobox>
     <Fieldset :disabled="locked"><template #legend>Inherited disabled</template><Combobox id="locked-search" popup-id="locked-search-options">Access<template #options><option value="member">Member</option><option value="owner">Owner</option></template></Combobox></Fieldset>
     <Button type="button" variant="outline" @click="locked=!locked">{{locked?'Enable fieldset':'Disable fieldset'}}</Button>
     <div class="flex gap-2"><Button type="reset" variant="outline">Reset form</Button><Button type="submit">Submit form</Button></div>
    </form>
    <section class="grid gap-4 rounded-xl border border-border p-4">
     <h2 class="text-base font-medium">Command</h2>
     <p class="text-sm text-muted-foreground">Search actions. Each activation emits its value; application logic runs the action.</p>
     <Command id="action-search" popup-id="action-options" placeholder="Search actions…" @select="run">Actions<template #options><optgroup label="Reports"><option value="new" data-keywords="create">New report</option><option value="export">Export report</option><option value="delete" disabled>Delete report (unavailable)</option></optgroup><optgroup label="Settings"><option value="profile">Profile</option><option value="billing">Billing</option></optgroup></template></Command>
     <p data-testid="command-events" class="text-sm text-muted-foreground">{{actions.join(', ')||'No actions yet'}}</p>
     <Dialog close-size="default" id="command-dialog" title-id="command-title"><template #trigger>Open command dialog</template><template #title>Command palette</template><Command id="dialog-action-search" popup-id="dialog-action-options" aria-label="Palette actions" :classes="{label:'sr-only'}" @select="run"><template #options><option value="settings">Open settings</option><option value="help">Help</option></template></Command><template #close>Close dialog</template></Dialog>
     <Direction dir="rtl"><Combobox id="rtl-search" popup-id="rtl-search-options" align="end">الاتجاه<template #options><option value="draft">مسودة</option><option value="public">منشور</option></template></Combobox></Direction>
     <Button type="button" variant="outline" @click="mounted=!mounted">{{mounted?'Unmount combobox':'Mount combobox'}}</Button>
     <Combobox v-if="mounted" id="override-search" popup-id="override-options" :styles="{popup:{maxHeight:'8rem'}}" :classes="{option:'rounded-none'}">Local overrides<template #options><option v-for="team in teams" :key="team.value" :value="team.value">{{team.label}}</option></template></Combobox>
    </section>
   </div>
   <section class="grid gap-4 rounded-xl border border-border p-4"><h2 class="text-base font-medium">Viewport collision and scrolling</h2><Combobox id="workspace-search" popup-id="workspace-search-options" placeholder="Search workspaces…">Workspace<template #options><option v-for="team in teams" :key="team.value" :value="team.value">{{team.label}}</option></template></Combobox></section>
   <section class="grid gap-3 rounded-xl border border-border p-4"><h2 class="text-base font-medium">Compact consumer API</h2><pre class="overflow-auto text-xs"><code>&lt;Combobox id="framework" popup-id="framework-options" v-model:value="value"&gt;
  Framework
  &lt;template #options&gt;
    &lt;option value="nuxt"&gt;Nuxt&lt;/option&gt;
    &lt;option value="astro"&gt;Astro&lt;/option&gt;
  &lt;/template&gt;
&lt;/Combobox&gt;

&lt;Command id="actions" popup-id="actions-list" @select="runAction"&gt;
  Actions
  &lt;template #options&gt;
    &lt;option value="new"&gt;New report&lt;/option&gt;
  &lt;/template&gt;
&lt;/Command&gt;</code></pre></section>
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
