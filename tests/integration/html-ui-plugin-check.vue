<!-- Handwritten integration example for generated local UI blocks. -->
<script setup lang="ts" vapor>
import { onMounted, ref } from 'vue'
import Accordion from '~/components/html-ui-generated/GeneratedAccordion.vue'
import { Button, Card, Checkbox, Grid, Icon, IconButton, Input } from '~/components/html-ui-plugin'
const email = ref('')
const password = ref('')
const remember = ref(false)
const submissions = ref(0)
const helpClicks = ref(0)
const isDark = ref(false)
const clientReady = ref(false)
const showRecovery = ref(false)
onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  clientReady.value = true
})
function toggleTheme() {
  isDark.value = document.documentElement.classList.toggle('dark')
}
</script>

<template>
  <main :data-ready="clientReady" class="grid min-h-screen place-items-center bg-background px-6 py-12 text-foreground">
    <div class="fixed right-6 top-6">
      <IconButton :label="isDark ? 'Switch to light theme' : 'Switch to dark theme'" variant="outline" @click="toggleTheme">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path :d="isDark ? 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5' : 'M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z'" />
        </svg>
      </IconButton>
    </div>
    <div class="w-full max-w-sm">
      <Grid gap="lg">
        <div class="flex items-center justify-center gap-2 text-sm font-medium">
          <Icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 9h8M8 13h8M8 17h4" /></svg></Icon>
          Local UI
        </div>
        <Card>
          <Grid gap="lg">
            <div class="text-center">
              <h1 class="text-xl font-semibold">Welcome back</h1>
              <p class="mt-2 text-sm text-muted-foreground">Your components. Your application.</p>
            </div>
            <Button variant="outline">
              <Icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg></Icon>
              Continue with email
            </Button>
            <form @submit.prevent="submissions++">
              <Grid gap="lg">
                <Input id="plugin-email" type="email" autocomplete="email" placeholder="you@example.com" required v-model:value="email">Email</Input>
                <div class="relative">
                  <Input id="plugin-password" type="password" autocomplete="current-password" required v-model:value="password">Password</Input>
                  <a href="#password-recovery" class="absolute right-0 top-0 rounded-sm text-sm text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" @click="showRecovery = true">Forgot your password?</a>
                </div>
                <p v-show="showRecovery" id="password-recovery" role="status" class="text-sm text-muted-foreground">Connect this link to your application's password recovery flow.</p>
                <Checkbox v-model:checked="remember">Remember me</Checkbox>
                <Button type="submit">Login</Button>
                <div data-testid="responsive-grid">
                  <Grid gap="sm" columns="1" mdColumns="2">
                    <Button type="reset" variant="ghost">Reset</Button>
                    <Button disabled @click="submissions++">Unavailable</Button>
                  </Grid>
                </div>
              </Grid>
            </form>
          </Grid>
        </Card>
        <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          Need help?
          <IconButton label="Help" variant="ghost" @click="helpClicks++"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 16v1" /></svg></IconButton>
        </div>
        <Accordion>
          <template #summary>Integration values</template>
          <template #content>
            <Grid gap="sm">
              <p>Submissions: <output data-testid="submit-count">{{ submissions }}</output></p>
              <p>Help: <output data-testid="help-count">{{ helpClicks }}</output></p>
              <output data-testid="model">{{ email }} / {{ remember }}</output>
            </Grid>
          </template>
        </Accordion>
      </Grid>
    </div>
  </main>
</template>
