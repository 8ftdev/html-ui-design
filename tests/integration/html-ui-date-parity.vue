<!-- Local single-date building blocks; booking/business logic stays in the consumer. -->
<script setup lang="ts" vapor>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import {Calendar,DatePicker,NativeDatePicker,Button,IconButton,Grid,Fieldset,Dialog} from '~/components/html-ui-plugin-batch'
const dark=ref(false),rtl=ref(false),locale=ref('en-US'),weekStart=ref(0),booking=ref('2024-02-29'),requiredDate=ref(''),locked=ref(true),overrides=ref(false),mounted=ref(true)
let previousDark=false
onMounted(()=>{previousDark=document.documentElement.classList.contains('dark');document.documentElement.classList.remove('dark')})
watch(dark,v=>document.documentElement.classList.toggle('dark',v))
onBeforeUnmount(()=>document.documentElement.classList.toggle('dark',previousDark))
</script>
<template>
 <main class="date-lab min-h-screen bg-background p-6 text-foreground" :class="{dark}" :dir="rtl?'rtl':'ltr'">
  <div class="mx-auto grid max-w-4xl gap-8">
   <header class="flex flex-wrap items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold">Calendars and date pickers</h1><p class="text-sm text-muted-foreground">Local Vue/Vapor · Base Nova · date-only native form values</p></div><div class="flex gap-2"><Button variant="outline" size="sm" @click="rtl=!rtl">{{rtl?'LTR':'RTL'}}</Button><Button variant="outline" size="sm" @click="locale=locale==='en-US'?'es-ES':'en-US'">{{locale==='en-US'?'Spanish labels':'English labels'}}</Button><IconButton :label="dark?'Light theme':'Dark theme'" variant="outline" @click="dark=!dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg></IconButton></div></header>
   <form data-testid="date-form" class="grid gap-8" @submit.prevent>
    <Grid columns="1" md-columns="2" gap="xl">
     <section class="grid content-start gap-4"><h2 class="font-medium">Calendar</h2><p class="text-sm text-muted-foreground">One month, one date, one keyboard tab stop. Navigation leaves the selected date unchanged.</p>
      <Calendar id="booking-calendar" popup-id="booking-month" name="booking" v-model:value="booking" min="2024-01-01" max="2025-12-31" :locale="locale" :first-day-of-week="weekStart" :classes="{popup:'rounded-lg ring-1 ring-border',day:overrides?'rounded-none':''}" :styles="{day:overrides?{borderRadius:'0px'}:{}}">Booking date</Calendar>
      <p role="status" data-testid="booking-model" class="text-sm text-muted-foreground">{{booking}}</p><div class="flex flex-wrap gap-2"><Button variant="outline" size="sm" @click="weekStart=weekStart===0?1:0">{{weekStart===0?'Monday first':'Sunday first'}}</Button><Button variant="outline" size="sm" @click="booking='2024-12-31'">Set December 31</Button><Button variant="outline" size="sm" @click="booking=''">Clear booking</Button><Button variant="outline" size="sm" @click="overrides=!overrides">{{overrides?'Restore day styles':'Square day override'}}</Button></div>
     </section>
     <section class="grid content-start gap-4"><h2 class="font-medium">DatePicker</h2><p class="text-sm text-muted-foreground">A compact popup using the same grid, with focus return and viewport collision handling.</p>
      <DatePicker id="required-date" popup-id="required-month" name="requiredDate" v-model:value="requiredDate" required min="2024-02-27" max="2024-03-02" default-month="2024-02" :locale="locale" :first-day-of-week="weekStart" :classes="{root:'w-full'}">Required arrival</DatePicker><p role="status" data-testid="required-model" class="text-sm text-muted-foreground">{{requiredDate||'No date selected'}}</p>
      <NativeDatePicker id="browser-date" name="nativeDate" value="2024-02-29">Native browser alternative</NativeDatePicker>
      <div class="flex gap-2"><Button type="submit">Validate dates</Button><Button type="reset" variant="outline">Reset dates</Button></div>
     </section>
    </Grid>
   </form>
   <Grid columns="1" md-columns="2" gap="xl">
    <section class="grid content-start gap-4"><h2 class="font-medium">Disabled and lifecycle</h2><Fieldset :disabled="locked"><template #legend>Team booking</template><DatePicker id="locked-date" popup-id="locked-month" value="2024-02-29">Disabled date</DatePicker></Fieldset><Button variant="outline" class="w-fit" @click="locked=!locked">{{locked?'Enable dates':'Disable dates'}}</Button>
     <DatePicker v-if="mounted" id="cleanup-date" popup-id="cleanup-month" value="2024-02-29">Lifecycle date</DatePicker><Button variant="outline" class="w-fit" @click="mounted=!mounted">{{mounted?'Unmount picker':'Mount picker'}}</Button>
    </section>
    <section class="grid content-start gap-4"><h2 class="font-medium">Compose inside Dialog</h2><p class="text-sm text-muted-foreground">The same local picker works inside a native modal.</p><Dialog id="date-dialog" title-id="date-dialog-title" variant="outline" close-size="default"><template #trigger>Schedule in dialog</template><template #title>Schedule report</template><DatePicker id="dialog-date" popup-id="dialog-month" value="2024-02-29">Report date</DatePicker><template #close>Close scheduling</template></Dialog></section>
   </Grid>
   <section class="grid gap-3 border-t border-border pt-6"><h2 class="font-medium">Compact consumer API</h2><pre class="overflow-auto text-xs"><code>&lt;Calendar id="booking" popup-id="booking-month" v-model:value="date" /&gt;
&lt;DatePicker id="arrival" popup-id="arrival-month" v-model:value="date"&gt;
  Arrival date
&lt;/DatePicker&gt;</code></pre><p class="text-sm text-muted-foreground">Single Gregorian dates. Range selection, time selection and month/year dropdowns remain outside this contract.</p></section>
  </div>
 </main>
</template>
<style scoped>
.date-lab {
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
.date-lab.dark {
  --popover: oklch(.205 0 0); --popover-foreground: oklch(.985 0 0); --accent: oklch(.269 0 0); --accent-foreground: oklch(.985 0 0); --background: oklch(.145 0 0); --foreground: oklch(.985 0 0);
  --primary: oklch(.922 0 0); --primary-foreground: oklch(.205 0 0);
  --muted: oklch(.269 0 0); --muted-foreground: oklch(.708 0 0);
  --destructive: oklch(.704 .191 22.216); --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%); --ring: oklch(.556 0 0);
  color-scheme: dark;
}
</style>
