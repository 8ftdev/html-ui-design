<!-- Final compact component contracts; application logic owns authentication and notification queues. -->
<script setup lang="ts" vapor>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import {InputOtp,Resizable,Toast,Button,IconButton,Grid,Card,Accordion,Checkbox,Input} from '~/components/html-ui-plugin-batch'
const dark=ref(false),rtl=ref(false),code=ref('012345'),locked=ref(true),split=ref(40),vertical=ref(false),toastOpen=ref(false),timerOpen=ref(false),mount=ref(true),override=ref(false),actions=ref(0),queue=ref(['Report exported','Settings saved'])
let previousDark=false
onMounted(()=>{previousDark=document.documentElement.classList.contains('dark');document.documentElement.classList.remove('dark')})
watch(dark,v=>document.documentElement.classList.toggle('dark',v))
onBeforeUnmount(()=>document.documentElement.classList.toggle('dark',previousDark))
</script>
<template>
 <main class="final-lab min-h-screen bg-background p-6 text-foreground" :class="{dark}" :dir="rtl?'rtl':'ltr'">
  <div class="mx-auto grid max-w-4xl gap-10">
   <header class="flex flex-wrap items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold">Codes, split panes and notifications</h1><p class="text-sm text-muted-foreground">Local Vue/Vapor components · Base Nova · editable owned parts</p></div><div class="flex gap-2"><Button size="sm" variant="outline" @click="rtl=!rtl">{{rtl?'LTR':'RTL'}}</Button><IconButton :label="dark?'Light theme':'Dark theme'" variant="outline" @click="dark=!dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg></IconButton></div></header>
   <section class="grid gap-5"><div><h2 class="text-lg font-medium">One-time codes</h2><p class="text-sm text-muted-foreground">One real input, six square cells. Paste and autofill preserve leading zeros.</p></div>
    <form data-testid="otp-form" class="grid gap-4" @submit.prevent>
     <InputOtp id="code" name="code" v-model:value="code" required :min-length="6" :max-length="6" :classes="override?{cell:'data-[group-start=true]:rounded-s-none data-[group-end=true]:rounded-e-none'}:undefined">Verification code</InputOtp>
     <p role="status" data-testid="code-model" class="text-sm text-muted-foreground">{{code||'No code'}}</p>
     <div class="flex flex-wrap gap-2"><Button type="reset" variant="outline">Reset code</Button><Button type="button" variant="outline" @click="code='009876'">Set leading zeros</Button><Button type="button" variant="outline" @click="override=!override">{{override?'Default cells':'Square cell override'}}</Button></div>
    </form>
    <Grid md-columns="2" gap="lg"><InputOtp :max-length="4" :group-size="4" value="0123" read-only>Read-only PIN</InputOtp><fieldset :disabled="locked" class="grid gap-3"><InputOtp value="123456">Disabled code</InputOtp></fieldset></Grid><Button class="w-fit" size="sm" variant="outline" @click="locked=!locked">{{locked?'Enable code':'Disable code'}}</Button>
   </section>
   <section class="grid gap-5"><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-lg font-medium">Resizable workspaces</h2><p class="text-sm text-muted-foreground">Drag the separator or use arrows, Home and End. Shift changes size in larger steps.</p></div><Button size="sm" variant="outline" @click="vertical=!vertical">{{vertical?'Horizontal panes':'Vertical panes'}}</Button></div>
    <Resizable id="files-pane" label="Resize files panel" v-model:size="split" :min="20" :max="80" :step="5" :orientation="vertical?'vertical':'horizontal'" :classes="{root:'h-56 rounded-lg border border-border'}">
     <template #start><div class="grid gap-3 p-4"><h3 class="text-sm font-medium">Files</h3><p class="text-sm text-muted-foreground">report.csv<br>notes.md<br>settings.json</p></div></template>
     <template #end><div class="grid gap-3 p-4"><h3 class="text-sm font-medium">Editor</h3><p class="text-sm text-muted-foreground">Pane content stays local and keeps its own styles.</p><Input placeholder="Search files">Search</Input></div></template>
    </Resizable><p role="status" data-testid="split-model" class="text-sm text-muted-foreground">{{Math.round(split)}}%</p>
    <Resizable id="locked-pane" label="Locked layout" :size="50" disabled :classes="{root:'h-20 rounded-lg border border-border'}"><template #start><p class="p-4 text-sm">Fixed left</p></template><template #end><p class="p-4 text-sm">Fixed right</p></template></Resizable>
   </section>
   <section class="grid gap-5"><div><h2 class="text-lg font-medium">Notifications</h2><p class="text-sm text-muted-foreground">Open state and dismissal are local. Timers pause while hovered or focused; queues stay in your application.</p></div>
    <div class="flex flex-wrap gap-2"><Button @click="toastOpen=true">Save changes</Button><Button variant="outline" @click="timerOpen=true">Timed notification</Button><Button variant="outline" @click="mount=!mount">{{mount?'Unmount notifications':'Mount notifications'}}</Button></div>
    <div v-if="mount" class="grid max-w-lg gap-3">
     <Toast v-model:open="toastOpen" data-testid="saved-toast"><template #title>Changes saved</template>Your report is ready to share.<template #action><Button variant="outline" size="sm" @click="actions++;toastOpen=false">Undo</Button></template></Toast>
     <Toast v-model:open="timerOpen" :duration="1200" data-testid="timed-toast"><template #title>Export complete</template>This notification closes after interaction ends.</Toast>
    </div><p role="status" data-testid="toast-model" class="text-sm text-muted-foreground">{{toastOpen?'Open':'Closed'}} · {{actions}} undo actions</p>
    <div class="grid max-w-lg gap-3"><Toast v-for="message in queue" :key="message" :open="true" @update:open="v=>{if(!v)queue=queue.filter(m=>m!==message)}"><template #title>{{message}}</template>Queued by the consumer.</Toast></div>
   </section>
   <section class="grid gap-4"><h2 class="text-lg font-medium">Composition and visual rhythm</h2><Card><h3 class="text-base font-medium">Workspace preferences</h3><p class="text-sm text-muted-foreground">Consistent primitives provide the building blocks.</p><Checkbox>Send weekly reports</Checkbox><Accordion><template #summary>Advanced settings</template><p>Independent primitive styles remain editable.</p></Accordion></Card></section>
   <section class="grid gap-3"><h2 class="text-lg font-medium">Compact APIs</h2><pre class="max-w-full overflow-auto rounded-lg bg-muted p-4 text-sm"><code>&lt;InputOtp v-model:value="code" :max-length="6"&gt;Code&lt;/InputOtp&gt;
&lt;Resizable id="files" label="Resize files" v-model:size="size"&gt;
  &lt;template #start&gt;...&lt;/template&gt;
  &lt;template #end&gt;...&lt;/template&gt;
&lt;/Resizable&gt;
&lt;Toast v-model:open="open" :duration="5000"&gt;
  &lt;template #title&gt;Saved&lt;/template&gt;Changes are saved.
&lt;/Toast&gt;</code></pre></section>
  </div>
 </main>
</template>
<style scoped>
.final-lab {
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
.final-lab.dark {
  --popover: oklch(.205 0 0); --popover-foreground: oklch(.985 0 0); --accent: oklch(.269 0 0); --accent-foreground: oklch(.985 0 0); --background: oklch(.145 0 0); --foreground: oklch(.985 0 0);
  --primary: oklch(.922 0 0); --primary-foreground: oklch(.205 0 0);
  --muted: oklch(.269 0 0); --muted-foreground: oklch(.708 0 0);
  --destructive: oklch(.704 .191 22.216); --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%); --ring: oklch(.556 0 0);
  color-scheme: dark;
}
</style>
