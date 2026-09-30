<!-- Generated integration fixture: form-control parity batch. -->
<script setup lang="ts" vapor>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import {Button,Input,Textarea,Checkbox,Radio,RadioGroup,Switch,Slider,NativeSelect,Field,Fieldset,Skeleton} from '~/components/html-ui-plugin-batch'
const dark=ref(false),checked=ref(false),volume=ref(40),text=ref('Atlas')
let previousDark=false
onMounted(()=>{previousDark=document.documentElement.classList.contains('dark');document.documentElement.classList.remove('dark')})
watch(dark,value=>document.documentElement.classList.toggle('dark',value))
onBeforeUnmount(()=>document.documentElement.classList.toggle('dark',previousDark))
</script>
<template>
  <main class="parity-lab min-h-screen bg-background p-6 text-foreground" :class="{dark}">
    <div class="mx-auto grid max-w-5xl gap-6">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div><h1 class="text-2xl font-semibold">Form-control parity</h1><p class="text-sm text-muted-foreground">Local Vue/Vapor components · Base Nova recipes · neutral tokens</p></div>
        <Button variant="outline" @click="dark=!dark">{{dark?'Light theme':'Dark theme'}}</Button>
      </header>
      <form class="grid gap-6 md:grid-cols-2" @submit.prevent>
        <section class="grid content-start gap-4 rounded-xl border border-border p-4">
          <h2 class="text-base font-medium">Text and validation</h2>
          <Field id="parity-project" description-id="parity-help">
            <template #label>Project</template>
            <template #control="{id}"><Input :id="id" v-model:value="text" name="project" aria-describedby="parity-help" placeholder="Project name" /></template>
            <template #description>Generated Input with an external Field label.</template>
          </Field>
          <Field id="parity-email" error-id="parity-email-error" invalid>
            <template #label>Email address</template>
            <template #control="{id}"><Input :id="id" name="email" type="email" aria-invalid="true" aria-describedby="parity-email-error" placeholder="you@example.com" /></template>
            <template #error>Enter a valid email address.</template>
          </Field>
          <Textarea name="notes" placeholder="Add a note">Notes</Textarea>
          <Input name="disabled-text" disabled value="Unavailable">Disabled input</Input>
          <Skeleton class="h-5 w-40" data-testid="width-override" />
        </section>
        <section class="grid content-start gap-4 rounded-xl border border-border p-4">
          <h2 class="text-base font-medium">Selection and native semantics</h2>
          <Checkbox name="updates" v-model:checked="checked">Product updates</Checkbox>
          <Checkbox name="mixed" indeterminate>Mixed selection</Checkbox>
          <Checkbox name="disabled-check" disabled checked>Disabled selection</Checkbox>
          <Field id="parity-digest" description-id="parity-digest-help" orientation="horizontal">
            <template #label>Weekly digest</template>
            <template #control="{id}"><Checkbox :id="id" name="digest" aria-describedby="parity-digest-help" /></template>
            <template #description>A control-first horizontal Field.</template>
          </Field>
          <RadioGroup name="delivery"><template #legend>Delivery</template><Radio name="delivery" value="email" default-checked>Email</Radio><Radio name="delivery" value="sms">SMS</Radio></RadioGroup>
          <Switch name="notifications">Notifications</Switch>
          <Switch name="compact" size="sm" checked>Compact switch</Switch>
          <Slider name="volume" v-model:value="volume">Volume {{volume}}</Slider>
          <NativeSelect name="status">Status<template #options><option value="draft">Draft</option><option value="published">Published</option><option value="archived" disabled>Archived</option></template></NativeSelect>
          <Fieldset disabled><template #legend>Disabled fieldset</template><template #description>Native disabling also reaches descendant inputs.</template><Checkbox name="fieldset-check">Inherited disabled</Checkbox></Fieldset>
          <div class="flex gap-2"><Button type="reset" variant="outline">Reset form</Button><Button>Continue</Button></div>
        </section>
      </form>
    </div>
  </main>
</template>
<style scoped>
.parity-lab {
  --background: oklch(1 0 0); --foreground: oklch(.145 0 0);
  --primary: oklch(.205 0 0); --primary-foreground: oklch(.985 0 0);
  --muted: oklch(.97 0 0); --muted-foreground: oklch(.556 0 0);
  --destructive: oklch(.577 .245 27.325); --border: oklch(.922 0 0);
  --input: oklch(.922 0 0); --ring: oklch(.708 0 0);
  --color-background:var(--background); --color-foreground:var(--foreground);
  --color-primary:var(--primary); --color-primary-foreground:var(--primary-foreground);
  --color-muted:var(--muted); --color-muted-foreground:var(--muted-foreground);
  --color-destructive:var(--destructive); --color-border:var(--border);
  --color-input:var(--input); --color-ring:var(--ring);
  color-scheme: light;
}
.parity-lab.dark {
  --background: oklch(.145 0 0); --foreground: oklch(.985 0 0);
  --primary: oklch(.922 0 0); --primary-foreground: oklch(.205 0 0);
  --muted: oklch(.269 0 0); --muted-foreground: oklch(.708 0 0);
  --destructive: oklch(.704 .191 22.216); --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%); --ring: oklch(.556 0 0);
  color-scheme: dark;
}
</style>
