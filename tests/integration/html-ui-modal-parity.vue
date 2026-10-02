<!-- Compact local modal building blocks; application actions remain local. -->
<script setup lang="ts" vapor>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import {Dialog,AlertDialog,Drawer,Sheet,Button,Icon,IconButton,Input,Grid,Checkbox,Fieldset} from '~/components/html-ui-plugin-batch'
const dark=ref(false),rtl=ref(false),sheetSide=ref<'top'|'bottom'|'left'|'right'>('right'),drawerSide=ref<'top'|'bottom'|'left'|'right'>('bottom'),small=ref(false),prevent=ref(false),mounted=ref(true),locked=ref(false),action=ref('None')
let previousDark=false
onMounted(()=>{previousDark=document.documentElement.classList.contains('dark');document.documentElement.classList.remove('dark')})
watch(dark,v=>document.documentElement.classList.toggle('dark',v))
onBeforeUnmount(()=>document.documentElement.classList.toggle('dark',previousDark))
const cycle=(v:'top'|'bottom'|'left'|'right')=>{const sides=['right','bottom','left','top'] as const;return sides[(sides.indexOf(v)+1)%4]!}
const cancel=(e:Event)=>{if(prevent.value)e.preventDefault()}
</script>
<template>
 <main class="modal-lab min-h-screen bg-background p-6 text-foreground" :class="{dark}" :dir="rtl?'rtl':'ltr'">
  <div class="mx-auto grid max-w-4xl gap-8">
   <header class="flex items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold">Dialogs and panels</h1><p class="text-sm text-muted-foreground">Local Vue/Vapor · Base Nova · native modal focus</p></div><div class="flex gap-2"><Button variant="outline" size="sm" @click="rtl=!rtl">{{rtl?'LTR':'RTL'}}</Button><IconButton :label="dark?'Light theme':'Dark theme'" variant="outline" @click="dark=!dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg></IconButton></div></header>
   <Grid columns="1" gap="lg" class="md:grid-cols-2">
    <section class="grid content-start gap-4"><h2 class="font-medium">Dialog</h2><p class="text-sm text-muted-foreground">Header, connected description and footer without separate component exports.</p>
     <Dialog id="profile-modal" title-id="profile-title" description-id="profile-description" variant="outline" @cancel="cancel"><template #trigger>Edit profile</template><template #title>Edit profile</template><template #description>Make changes to your profile here. Save when you are done.</template><Grid gap="default"><Input id="profile-name" value="Alex">Name</Input><Input id="profile-user" value="@alex">Username</Input></Grid><template #footer><Button command="close" command-for="profile-modal" @click="action='Profile saved'">Save changes</Button></template><template #close><Icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg></Icon><span class="sr-only">Close profile</span></template></Dialog>
     <Checkbox v-model:checked="prevent">Keep profile open on cancellation</Checkbox>
    </section>
    <section class="grid content-start gap-4"><h2 class="font-medium">AlertDialog</h2><p class="text-sm text-muted-foreground">Cancel receives initial focus. Backdrop clicks preserve the confirmation.</p>
     <AlertDialog id="delete-modal" title-id="delete-title" description-id="delete-description" variant="outline" :content-size="small?'sm':'default'"><template #trigger>Delete report</template><template #title>Are you absolutely sure?</template><template #description>This example only changes the status shown below. Your data is untouched.</template><template #close>Cancel deletion</template><template #footer><Button variant="destructive" command="close" command-for="delete-modal" @click="action='Deletion confirmed'">Continue</Button></template></AlertDialog><Button variant="outline" class="w-fit" @click="small=!small">{{small?'Default alert':'Small alert'}}</Button>
    </section>
    <section class="grid content-start gap-4"><h2 class="font-medium">Drawer</h2><p class="text-sm text-muted-foreground">A bottom panel by default, with native focus and optional edge placement.</p>
     <Drawer id="goal-modal" title-id="goal-title" description-id="goal-description" variant="outline" :side="drawerSide"><template #trigger>Set activity goal</template><template #title>Move goal</template><template #description>Set your daily activity goal.</template><Grid gap="default"><Input id="goal-count" value="350">Daily target</Input></Grid><template #close>Cancel goal</template><template #footer><Button command="close" command-for="goal-modal" @click="action='Goal saved'">Submit goal</Button></template></Drawer><Button variant="outline" class="w-fit" @click="drawerSide=cycle(drawerSide)">Drawer side: {{drawerSide}}</Button>
    </section>
    <section class="grid content-start gap-4"><h2 class="font-medium">Sheet</h2><p class="text-sm text-muted-foreground">A side panel with footer actions and an independent close-button recipe.</p>
     <Sheet id="workspace-modal" title-id="workspace-title" description-id="workspace-description" variant="outline" :side="sheetSide"><template #trigger>Workspace settings</template><template #title>Workspace settings</template><template #description>Update the shared settings for your team.</template><Grid gap="default"><Input id="workspace-name" value="Acme Inc.">Workspace</Input><Checkbox>Send weekly updates</Checkbox></Grid><template #footer><Button command="close" command-for="workspace-modal" @click="action='Workspace saved'">Save workspace</Button></template><template #close><Icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg></Icon><span class="sr-only">Close workspace</span></template></Sheet><Button variant="outline" class="w-fit" @click="sheetSide=cycle(sheetSide)">Sheet side: {{sheetSide}}</Button>
    </section>
   </Grid>
   <section class="grid gap-4 border-t border-border pt-6"><h2 class="font-medium">Local overrides and cleanup</h2><div class="flex flex-wrap gap-4"><Button variant="outline" @click="mounted=!mounted">{{mounted?'Unmount dialog':'Mount dialog'}}</Button><Dialog v-if="mounted" id="override-modal" title-id="override-title" variant="outline" close-size="default" :classes="{dialog:'rounded-none max-w-xs',close:'static w-fit'}"><template #trigger>Local dialog</template><template #title>Owned styles</template>All parts remain editable.<template #close>Close local dialog</template><template #footer><Button variant="outline" @click="mounted=false">Unmount from inside</Button></template></Dialog></div>
    <Fieldset :disabled="locked"><template #legend>Disabled inheritance</template><Dialog id="disabled-modal" title-id="disabled-title" variant="outline" close-size="default"><template #trigger>Disabled dialog</template><template #title>Native inheritance</template><template #close>Close disabled dialog</template></Dialog></Fieldset><Button variant="outline" class="w-fit" @click="locked=!locked">{{locked?'Enable dialog':'Disable dialog'}}</Button>
    <output data-testid="modal-action">Last action: {{action}}</output>
   </section>
   <section class="grid gap-3 border-t border-border pt-6"><h2 class="font-medium">Compact consumer API</h2><pre class="overflow-auto text-xs"><code>&lt;Dialog id="profile" title-id="profile-title" description-id="profile-help"&gt;
  &lt;template #trigger&gt;Edit profile&lt;/template&gt;
  &lt;template #title&gt;Edit profile&lt;/template&gt;
  &lt;template #description&gt;Update your profile.&lt;/template&gt;
  &lt;Grid&gt;&lt;Input&gt;Name&lt;/Input&gt;&lt;/Grid&gt;
  &lt;template #footer&gt;&lt;Button command="close" command-for="profile"&gt;Save&lt;/Button&gt;&lt;/template&gt;
  &lt;template #close&gt;&lt;Icon&gt;...&lt;/Icon&gt;&lt;span class="sr-only"&gt;Close&lt;/span&gt;&lt;/template&gt;
&lt;/Dialog&gt;</code></pre></section>
  </div>
 </main>
</template>
<style scoped>
.modal-lab {
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
.modal-lab.dark {
  --popover: oklch(.205 0 0); --popover-foreground: oklch(.985 0 0); --accent: oklch(.269 0 0); --accent-foreground: oklch(.985 0 0); --background: oklch(.145 0 0); --foreground: oklch(.985 0 0);
  --primary: oklch(.922 0 0); --primary-foreground: oklch(.205 0 0);
  --muted: oklch(.269 0 0); --muted-foreground: oklch(.708 0 0);
  --destructive: oklch(.704 .191 22.216); --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%); --ring: oklch(.556 0 0);
  color-scheme: dark;
}
</style>
