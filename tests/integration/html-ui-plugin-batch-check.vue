<script setup lang="ts" vapor>
import {onMounted,ref} from 'vue'
import {Accordion,Collapsible,Avatar,Field,Fieldset,Separator,Progress,Switch,ScrollArea,NativeSelect,Button,IconButton,Icon,Checkbox,Grid} from '~/components/html-ui-plugin-batch'
import {uiRecipe1 as inputRecipe} from '~/components/html-ui-plugin-batch/Input.recipe'
const ready=ref(false),dark=ref(false),accordionOpen=ref(false),collapsibleOpen=ref(false),checked=ref(true),disabled=ref(false),motion=ref(true),show=ref(true),plan=ref('personal'),customStyles=ref(false)
const avatar='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#2345aa"/><text x="20" y="25" text-anchor="middle" font-family="sans-serif" font-size="16" fill="white">UI</text></svg>')
onMounted(()=>{dark.value=document.documentElement.classList.contains('dark');ready.value=true})
function toggleTheme(){dark.value=document.documentElement.classList.toggle('dark')}
function selectPlan(event:Event){plan.value=(event.target as HTMLSelectElement).value}
</script>
<template>
  <main :data-ready="ready" class="min-h-screen bg-background px-6 py-12 text-foreground">
    <div class="fixed right-6 top-6"><IconButton variant="outline" :label="dark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17m10-10 1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0"/></svg></IconButton></div>
    <Grid gap="xl" class="mx-auto max-w-3xl">
      <header><h1 class="text-2xl font-semibold">Native contract batch</h1><p class="mt-2 text-sm text-muted-foreground">Ten new blocks, shared theme recipes, and local disclosure motion.</p></header>
      <Grid gap="sm"><Checkbox v-model:checked="motion">Animate disclosures</Checkbox><Button variant="outline" @click="accordionOpen=!accordionOpen">Toggle from application</Button><Button variant="ghost" @click="show=!show">Mount or remove disclosure</Button></Grid>
      <section><h2 class="mb-3 text-lg font-medium">Disclosures</h2><Button variant="outline" @click="customStyles=!customStyles">Change content styles</Button>
        <Accordion v-if="show" v-model:open="accordionOpen" :motion="motion ? undefined : false" :styles="{content:customStyles ? {overflow:'scroll',boxSizing:'border-box'} : {overflow:'auto',boxSizing:'content-box'}}" :classes="{content:'tracking-wide'}" data-testid="animated-accordion"><template #summary>Account details</template><Grid gap="sm"><p>Content comes from local primitives.</p><Button variant="outline">Edit account</Button><p>Motion shares duration and easing tokens with the theme.</p></Grid></Accordion>
        <output data-testid="accordion-state">{{accordionOpen}}</output>
        <Collapsible v-model:open="collapsibleOpen" :motion="motion ? undefined : false" data-testid="animated-collapsible"><template #summary>Additional preferences</template><p class="py-3">Optional settings remain native disclosure content.</p></Collapsible>
        <output data-testid="collapsible-state">{{collapsibleOpen}}</output>
        <Accordion name="batch-exclusive"><template #summary>First exclusive item</template><p class="py-3">First item content</p></Accordion>
        <Accordion name="batch-exclusive"><template #summary>Second exclusive item</template><p class="py-3">Second item content</p></Accordion>
      </section>
      <Separator data-testid="separator"/>
      <section><h2 class="mb-3 text-lg font-medium">Profile and fields</h2><Grid gap="lg">
        <div class="flex items-center gap-3"><Avatar :src="avatar" alt="Demo avatar" size="lg"/><span class="text-sm">Local image primitive</span></div>
        <Field id="batch-name" description-id="batch-name-help"><template #label>Account name</template><template #control="{id}"><input :id="id" aria-describedby="batch-name-help" :class="inputRecipe()"/></template><template #description>The scoped id connects the label to your control.</template></Field>
        <Checkbox v-model:checked="disabled">Disable preference group</Checkbox>
        <form><Fieldset :disabled="disabled"><template #legend>Preferences</template><Grid gap="lg"><Switch v-model:checked="checked" name="notifications">Email notifications</Switch><NativeSelect name="plan" @change="selectPlan"><template #default>Plan</template><template #options><option value="personal">Personal</option><option value="team">Team</option></template></NativeSelect><Button type="reset" variant="outline">Reset preferences</Button></Grid></Fieldset></form>
        <output data-testid="switch-state">{{checked}}</output><output data-testid="plan-state">{{plan}}</output>
      </Grid></section>
      <section><h2 class="mb-3 text-lg font-medium">Progress</h2><Grid gap="lg"><Progress label="Upload progress" :value="0.6"/><Progress label="Waiting for upload"/></Grid></section>
      <section><h2 class="mb-3 text-lg font-medium">Scrollable content</h2><ScrollArea label="Activity history" :classes="{root:'border border-border p-4'}"><Grid gap="sm"><p v-for="item in 40" :key="item" class="text-sm">Activity item {{item}}</p></Grid></ScrollArea></section>
    </Grid>
  </main>
</template>
<style scoped>
main { --motion-duration-normal: 240ms; --motion-easing-standard: cubic-bezier(0.2, 0, 0, 1); }
</style>
