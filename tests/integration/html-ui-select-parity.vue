<!-- Generated integration fixture: portable Select parity. -->
<script setup lang="ts" vapor>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import {Button,Select,NativeSelect,Field,Fieldset,Direction,Dialog} from '~/components/html-ui-plugin-batch'
const dark=ref(false),status=ref('draft'),requiredValue=ref(''),extra=ref(false),locked=ref(true),mounted=ref(true),align=ref<'start'|'end'>('start')
const options=Array.from({length:30},(_,i)=>({value:String(i+1),label:`Workspace ${i+1}`}))
let previousDark=false
onMounted(()=>{previousDark=document.documentElement.classList.contains('dark');document.documentElement.classList.remove('dark')})
watch(dark,value=>document.documentElement.classList.toggle('dark',value))
onBeforeUnmount(()=>document.documentElement.classList.toggle('dark',previousDark))
</script>
<template>
 <main class="parity-lab min-h-screen bg-background p-6 text-foreground" :class="{dark}">
  <div class="mx-auto grid max-w-5xl gap-6">
   <header class="flex flex-wrap items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold">Select parity</h1><p class="text-sm text-muted-foreground">Local Vue/Vapor · Base Nova recipes · native form values</p></div><Button variant="outline" @click="dark=!dark">{{dark?'Light theme':'Dark theme'}}</Button></header>
   <form data-testid="select-form" class="grid gap-6 md:grid-cols-2" @submit.prevent>
    <section class="grid content-start gap-4 rounded-xl border border-border p-4">
     <h2 class="text-base font-medium">Compact options API</h2>
     <Field id="portable-status" description-id="status-help"><template #label>Status</template><template #control="{id}">
      <Select :id="id" popup-id="status-options" name="status" v-model:value="status" aria-describedby="status-help" :align="align" :classes="{trigger:'w-full'}"><template #options><option value="draft">Draft</option><optgroup label="Public"><option value="published">Published</option><option value="blocked" disabled>Blocked</option></optgroup><option value="archived">Archived</option><option v-if="extra" value="review">In review</option></template></Select>
     </template><template #description>Arrow keys navigate. Enter selects. Escape cancels.</template></Field>
     <p data-testid="status-model" class="text-sm text-muted-foreground">{{status}}</p>
     <div class="flex flex-wrap gap-2"><Button type="button" variant="outline" @click="status='published'">Set published</Button><Button type="button" variant="outline" @click="extra=!extra">{{extra?'Remove review option':'Add review option'}}</Button><Button type="button" variant="outline" @click="align=align==='start'?'end':'start'">Change alignment</Button></div>
     <NativeSelect name="native-status">Native alternative<template #options><option value="draft">Draft</option><option value="published">Published</option></template></NativeSelect>
     <Select id="compact-select" popup-id="compact-options" size="sm" value="personal">Compact size<template #options><option value="personal">Personal</option><option value="team">Team</option></template></Select>
     <div class="flex gap-2"><Button type="reset" variant="outline">Reset form</Button><Button type="submit">Submit form</Button></div>
    </section>
    <section class="grid content-start gap-4 rounded-xl border border-border p-4">
     <h2 class="text-base font-medium">Validation and composition</h2>
     <Select id="required-select" popup-id="required-options" name="required" required v-model:value="requiredValue" placeholder="Choose a plan" :classes="{trigger:'w-full'}">Required plan<template #options><option value="" hidden>Choose a plan</option><option value="personal">Personal</option><option value="team">Team</option></template></Select>
     <Fieldset :disabled="locked"><template #legend>Inherited disabled</template><Select id="locked-select" popup-id="locked-options" name="locked">Access<template #options><option value="member">Member</option><option value="owner">Owner</option></template></Select></Fieldset>
     <Button type="button" variant="outline" @click="locked=!locked">{{locked?'Enable fieldset':'Disable fieldset'}}</Button>
     <Direction dir="rtl"><Select id="rtl-select" popup-id="rtl-options" :classes="{trigger:'w-full'}">اتجاه من اليمين<template #options><option value="draft">مسودة</option><option value="published">منشور</option></template></Select></Direction>
     <Dialog id="select-dialog" title-id="select-dialog-title"><template #trigger>Open dialog</template><template #title>Select inside a dialog</template><Select id="dialog-select" popup-id="dialog-options">Team<template #options><option>Design</option><option>Engineering</option></template></Select><template #close>Close dialog</template></Dialog>
     <Button type="button" variant="outline" @click="mounted=!mounted">{{mounted?'Unmount select':'Mount select'}}</Button>
     <Select v-if="mounted" id="cleanup-select" popup-id="cleanup-options" :styles="{popup:{maxHeight:'8rem'}}" :classes="{option:'rounded-none'}">Local overrides<template #options><option v-for="item in options" :key="item.value" :value="item.value">{{item.label}}</option></template></Select>
    </section>
   </form>
   <section class="grid content-start gap-4 rounded-xl border border-border p-4"><h2 class="text-base font-medium">Viewport collision</h2><p class="text-sm text-muted-foreground">The popup flips and scrolls when space is limited.</p><Select id="long-select" popup-id="long-options" name="workspace" :classes="{trigger:'w-full'}">Workspace<template #options><option v-for="item in options" :key="item.value" :value="item.value">{{item.label}}</option></template></Select></section>
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
