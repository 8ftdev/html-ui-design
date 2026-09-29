<script setup lang="ts" vapor>
import {onMounted,ref} from 'vue'
import {Empty,Item,InputGroup,Kbd,Pagination,Typography,Direction,RadioGroup,Radio,Slider,Card,Grid,Button,IconButton,Icon,Checkbox,Separator} from '~/components/html-ui-plugin-batch'
const ready=ref(false),dark=ref(false),query=ref('demo@example.com'),volume=ref(40),disabled=ref(false),emailReadonly=ref(false),delivery=ref('email'),submitted=ref(''),direction=ref<'ltr'|'rtl'>('ltr'),itemVariant=ref<'outline'|'muted'>('outline')
onMounted(()=>{dark.value=document.documentElement.classList.contains('dark');ready.value=true})
function toggleTheme(){dark.value=document.documentElement.classList.toggle('dark')}
function selectDelivery(event:Event){delivery.value=(event.target as HTMLInputElement).value}
function submit(event:Event){const data=new FormData(event.currentTarget as HTMLFormElement);submitted.value=JSON.stringify(Object.fromEntries(data))}
function reset(){delivery.value='email';submitted.value=''}
</script>
<template>
 <main :data-ready="ready" class="min-h-screen bg-background px-6 py-12 text-foreground">
  <div class="fixed right-6 top-6"><IconButton variant="outline" :label="dark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/></svg></IconButton></div>
  <Grid gap="xl" class="mx-auto max-w-3xl">
   <header><h1 class="text-2xl font-semibold">Forms and content contracts</h1><p class="mt-2 text-sm text-muted-foreground">Ten more local blocks: native controls, reusable content rows and shared typography.</p></header>
   <Card><Grid gap="lg">
    <h2 class="text-lg font-medium">Preferences</h2>
    <div class="flex flex-wrap gap-4"><Checkbox v-model:checked="disabled">Disable form controls</Checkbox><Checkbox v-model:checked="emailReadonly">Read-only email</Checkbox></div>
    <form data-testid="preferences-form" @submit.prevent="submit" @reset="reset"><Grid gap="lg">
     <InputGroup id="batch-three-email" name="email" type="email" v-model:value="query" :disabled="disabled" :read-only="emailReadonly" required :min-length="3" :max-length="80" placeholder="you@example.com" data-testid="email-group">
      Email address
      <template #start><Icon aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg></Icon></template>
      <template #end><Button size="xs" variant="ghost" :disabled="disabled || emailReadonly" @click="query=''">Clear</Button></template>
     </InputGroup>
     <RadioGroup name="delivery" :disabled="disabled" @change="selectDelivery"><template #legend>Delivery method</template><template #default="{name}"><Radio :name="name" value="email" default-checked required>Email delivery</Radio><Radio :name="name" value="sms" required>Text message</Radio></template></RadioGroup>
     <Slider name="volume" v-model:value="volume" :min="0" :max="100" :step="10" :disabled="disabled">Notification volume</Slider>
     <div class="flex flex-wrap gap-2"><Button type="submit">Save preferences</Button><Button type="reset" variant="outline">Reset preferences</Button><Button variant="ghost" :disabled="disabled" @click="volume=200">Test upper bound</Button></div>
    </Grid></form>
    <p class="text-sm text-muted-foreground">Selected delivery: <output data-testid="delivery-state">{{delivery}}</output> · Volume: <output data-testid="volume-state">{{volume}}</output></p>
    <output data-testid="submission" class="break-all text-sm">{{submitted}}</output>
   </Grid></Card>
   <section><h2 class="mb-3 text-lg font-medium">Content blocks</h2><Grid gap="lg">
    <Empty variant="icon" data-testid="empty-state"><template #media><Icon aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8m-4-4v8"/></svg></Icon></template><template #title><h3>No saved reports</h3></template><template #description>Create your first report using local primitives.</template><Button variant="outline">Create report</Button></Empty>
    <Empty data-testid="minimal-empty"><template #title>Nothing here yet</template></Empty>
    <Item :variant="itemVariant" data-testid="content-item"><template #media><Icon aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></Icon></template><template #title>Local component library</template>All visual recipes stay editable in your project.<template #actions><Button size="sm" variant="outline" @click="itemVariant=itemVariant==='outline' ? 'muted' : 'outline'">Change item style</Button></template></Item>
    <Item size="xs" data-testid="minimal-item"><template #title>Compact title-only row</template></Item>
    <Item variant="outline" data-testid="image-item"><template #media><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='500'%3E%3Crect width='100' height='500' fill='currentColor'/%3E%3C/svg%3E" alt="Tall image preview"/></template><template #title>Image media stays within its row</template>Images retain a bounded media box.</Item>
    <p class="text-sm">Search shortcut: <span aria-label="Command K"><Kbd>⌘</Kbd> <Kbd>K</Kbd></span></p>
   </Grid></section>
   <Separator/>
   <section><h2 class="mb-3 text-lg font-medium">Reading and direction</h2><Grid gap="lg">
    <Button variant="outline" @click="direction=direction==='ltr' ? 'rtl' : 'ltr'">Toggle writing direction</Button>
    <Direction :dir="direction" data-testid="direction"><Typography data-testid="prose"><h3>Shared typography</h3><p>Semantic HTML gains consistent spacing and theme colors. You can still edit every recipe.</p><blockquote>Compose behavior locally. Share visual contracts.</blockquote><ul><li>Native form controls</li><li><a href="#more-content">Editable local styles</a></li></ul><p>Use <code>html-ui</code> to generate the building blocks.</p></Typography></Direction>
   </Grid></section>
   <Pagination label="Report pages" data-testid="pagination"><li><a href="#page-1" aria-current="page">1</a></li><li><a href="#page-2">2</a></li><li><a href="#page-3">3</a></li><li><a href="#page-4">Next</a></li></Pagination>
  </Grid>
 </main>
</template>
