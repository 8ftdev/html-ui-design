<!-- Local generated HoverCard and Tooltip integration preview. -->
<script setup lang="ts" vapor>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import {Tooltip,HoverCard,IconButton,Button,Dialog,Direction,Fieldset} from '~/components/html-ui-plugin-batch'
const longTip=ref(false),profileId=ref('profile-preview')
const dark=ref(false),locked=ref(false),mounted=ref(true),side=ref<'top'|'bottom'|'left'|'right'>('top')
let previousDark=false
onMounted(()=>{previousDark=document.documentElement.classList.contains('dark');document.documentElement.classList.remove('dark')})
watch(dark,value=>document.documentElement.classList.toggle('dark',value))
onBeforeUnmount(()=>document.documentElement.classList.toggle('dark',previousDark))
const nextSide=()=>{const sides=['top','right','bottom','left'] as const;side.value=sides[(sides.indexOf(side.value)+1)%4]!}
</script>
<template>
 <main class="parity-lab min-h-screen bg-background p-6 text-foreground" :class="{dark}">
  <div class="mx-auto grid max-w-4xl gap-8">
   <header class="flex items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold">Hover overlays</h1><p class="text-sm text-muted-foreground">Local Vue/Vapor · Base Nova recipes · shared collision positioning</p></div><IconButton :label="dark?'Light theme':'Dark theme'" variant="outline" @click="dark=!dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg></IconButton></header>
   <div class="grid gap-8 md:grid-cols-2">
    <section class="grid content-start gap-4"><h2 class="text-base font-medium">Tooltip</h2><p class="text-sm text-muted-foreground">Focus or hover the button. Escape dismisses without moving focus.</p>
     <div class="w-fit overflow-hidden rounded-lg border border-border p-3" data-testid="clip"><Tooltip id="help-tip" variant="outline" :side="side"><template #trigger>Publish report</template>{{longTip?'Supplementary descriptive text. '.repeat(50):'Share this report with your workspace.'}}</Tooltip></div>
     <div class="flex flex-wrap gap-2"><Button variant="outline" @click="nextSide">Placement: {{side}}</Button><Button variant="outline" @click="longTip=!longTip">Toggle long description</Button></div>
     <div class="flex flex-wrap gap-4"><Tooltip id="left-tip" side="left" variant="outline"><template #trigger>Left edge</template>This stays inside the viewport.</Tooltip><Tooltip id="right-tip" side="right" variant="outline"><template #trigger>Right edge</template>Four sides share one positioning helper.</Tooltip></div>
     <p class="text-sm text-muted-foreground">The first example deliberately clips its wrapper. The tooltip uses the native top layer.</p>
    </section>
    <section class="grid content-start gap-4"><h2 class="text-base font-medium">HoverCard</h2><p class="text-sm text-muted-foreground">Hover briefly, use keyboard focus, or tap to open a compact profile preview.</p>
     <HoverCard :id="profileId" variant="link" :open-delay="120"><template #trigger>@korestack</template><div class="grid gap-2"><p class="font-medium">Korestack</p><p class="text-muted-foreground">A workspace built from local, editable UI primitives.</p><a href="#profile" class="w-fit underline underline-offset-4">View profile</a></div></HoverCard>
     <div class="flex flex-wrap gap-2"><Button variant="outline">After preview</Button><Button variant="outline" @click="profileId=profileId==='profile-preview'?'renamed-profile':'profile-preview'">Change preview ID</Button></div>
     <Direction dir="rtl"><HoverCard id="rtl-preview" variant="outline" side="left" align="start"><template #trigger>معاينة الحساب</template><p>مكونات واجهة محلية قابلة للتعديل.</p></HoverCard></Direction>
    </section>
   </div>
   <section class="grid gap-4 border-t border-border pt-6"><h2 class="text-base font-medium">Native disabled inheritance</h2><Fieldset :disabled="locked"><template #legend>Workspace actions</template><div class="flex flex-wrap gap-4"><Tooltip id="disabled-tip" variant="outline"><template #trigger>Describe action</template>Disabled fieldsets block opening.</Tooltip><HoverCard id="disabled-preview" variant="outline" :open-delay="0"><template #trigger>Preview workspace</template>Disabled ancestry is shared with native controls.</HoverCard></div></Fieldset><Button variant="outline" class="w-fit" @click="locked=!locked">{{locked?'Enable controls':'Disable controls'}}</Button></section>
   <section class="grid gap-4 border-t border-border pt-6"><h2 class="text-base font-medium">Local composition and cleanup</h2><div class="flex flex-wrap items-start gap-4"><Dialog close-size="default" id="hover-dialog" title-id="hover-dialog-title"><template #trigger>Open tooltip dialog</template><template #title>Report settings</template><Tooltip id="dialog-tip" variant="outline"><template #trigger>Explain setting</template>Escape dismisses this tooltip before the dialog.</Tooltip><template #close>Close dialog</template></Dialog><Button variant="outline" @click="mounted=!mounted">{{mounted?'Unmount overlay':'Mount overlay'}}</Button><HoverCard v-if="mounted" id="override-preview" variant="outline" :open-delay="120" :styles="{popup:{maxWidth:'12rem'}}" :classes="{popup:'rounded-none'}"><template #trigger>Local override</template>Every owned part remains editable.</HoverCard></div></section>
   <section class="grid gap-3 border-t border-border pt-6"><h2 class="text-base font-medium">Compact consumer API</h2><pre class="overflow-auto text-xs"><code>&lt;Tooltip id="publish-tip" side="top"&gt;
  &lt;template #trigger&gt;Publish&lt;/template&gt;
  Share with your workspace.
&lt;/Tooltip&gt;

&lt;HoverCard id="profile" :open-delay="120"&gt;
  &lt;template #trigger&gt;@korestack&lt;/template&gt;
  &lt;Card&gt;Profile details&lt;/Card&gt;
&lt;/HoverCard&gt;</code></pre></section>
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
