<script setup lang="ts" vapor>
import {onMounted,ref} from 'vue'
import {Card,Grid,Button,IconButton,Dialog,AlertDialog,Drawer,Sheet,Popover,Tabs,Toggle,ToggleGroup,Toolbar,Menubar,DropdownMenu,ContextMenu,Tooltip,Calendar,DatePicker,Combobox,Command,Select,InputOtp,NavigationMenu,DataTable,Attachment,Bubble,Marker,Message,MessageScroller,Carousel,Chart,Resizable,Sidebar,Questionnaire,Toast,Checkbox} from '~/components/html-ui-plugin-batch'
const ready=ref(false),dark=ref(false),pressed=ref(false),date=ref('2026-09-29'),code=ref('0123'),notice=ref(''),action=ref('none'),first=ref(false),second=ref(false)
onMounted(()=>{dark.value=document.documentElement.classList.contains('dark');ready.value=true})
function theme(){dark.value=document.documentElement.classList.toggle('dark')}
function reset(){notice.value=''}
</script>
<template>
 <main :data-ready="ready" class="min-h-screen bg-background p-6 text-foreground">
  <Grid gap="xl" class="mx-auto max-w-4xl">
   <header class="flex items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold">Remaining UI contracts</h1><p class="mt-2 text-sm text-muted-foreground">Local interactions and native alternatives. Each recipe remains editable.</p></div><IconButton :label="dark?'Light theme':'Dark theme'" variant="outline" @click="theme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg></IconButton></header>
   <Card><h2 class="text-lg font-semibold">Modal surfaces</h2><div class="flex flex-wrap gap-2">
    <Dialog id="demo-dialog" title-id="demo-dialog-title"><template #trigger>Open dialog</template><template #title>Edit profile</template><p>Native modal focus and Escape handling.</p><input aria-label="Profile name" class="rounded-lg border border-input bg-background p-2"/><template #close>Close dialog</template></Dialog>
    <AlertDialog id="demo-alert" title-id="demo-alert-title" description-id="demo-alert-description"><template #trigger>Delete report</template><template #title>Delete report?</template><p id="demo-alert-description">This example makes no changes to your data.</p><button autofocus type="button" command="close" commandfor="demo-alert">Cancel deletion</button><template #close>Confirm deletion</template></AlertDialog>
    <Drawer id="demo-drawer" title-id="demo-drawer-title"><template #trigger>Open drawer</template><template #title>Details drawer</template><p>Native edge-positioned dialog.</p><template #close>Close drawer</template></Drawer>
    <Sheet id="demo-sheet" title-id="demo-sheet-title"><template #trigger>Open sheet</template><template #title>Mobile navigation</template><NavigationMenu label="Mobile"><a href="#overview">Overview</a></NavigationMenu><template #close>Close sheet</template></Sheet>
    <Popover id="demo-popover"><template #trigger>Open popover</template><p>Native nonmodal popup.</p><Button variant="outline">Popup action</Button></Popover>
   </div></Card>
   <Card><h2 class="text-lg font-semibold">Keyboard interactions</h2>
    <Tabs label="Account sections" data-testid="tabs"><template #tabs><Button role="tab" id="account-tab" aria-controls="account-panel" aria-selected="true" variant="ghost">Account</Button><Button role="tab" id="billing-tab" aria-controls="billing-panel" variant="ghost" disabled>Billing</Button><Button role="tab" id="security-tab" aria-controls="security-panel" variant="ghost">Security</Button></template><section role="tabpanel" id="account-panel" aria-labelledby="account-tab" tabindex="0">Account settings</section><section role="tabpanel" id="billing-panel" aria-labelledby="billing-tab" hidden>Billing settings</section><section role="tabpanel" id="security-panel" aria-labelledby="security-tab" tabindex="0" hidden>Security settings</section></Tabs>
    <div class="flex flex-wrap items-center gap-3"><Toggle v-model:pressed="pressed">Pin report</Toggle><output data-testid="pressed">{{pressed}}</output><Tooltip id="demo-tooltip"><template #trigger>Explain pinning</template>Keep a report at the top.</Tooltip></div>
    <ToggleGroup label="Text formatting"><Toggle v-model:pressed="first">Bold</Toggle><Toggle v-model:pressed="second">Italic</Toggle></ToggleGroup>
    <Toolbar label="Editing actions"><Button variant="outline">Cut</Button><div hidden><Button variant="outline">Hidden command</Button></div><Button variant="outline" disabled>Copy</Button><Button variant="outline">Paste</Button></Toolbar>
    <Menubar label="Document menu"><Button role="menuitem" variant="ghost">File</Button><Button role="menuitem" variant="ghost">Edit</Button></Menubar>
    <div class="flex flex-wrap gap-3"><DropdownMenu id="demo-menu" label="Report actions menu"><template #trigger>Report actions</template><div aria-label="Report actions menu"><Button role="menuitem" variant="ghost" @click="action='export'">Export report</Button><Button role="menuitem" variant="ghost" aria-disabled="true" @click="action='blocked'">Blocked action</Button><Button role="menuitem" variant="ghost" disabled>Unavailable action</Button><Button role="menuitem" variant="ghost" @click="action='archive'">Archive report</Button></div></DropdownMenu><ContextMenu id="demo-context" label="Context actions menu"><template #trigger>Context actions</template><Button role="menuitem" variant="ghost" @click="action='inspect'">Inspect report</Button><Button role="menuitem" variant="ghost">Copy address</Button></ContextMenu><output data-testid="action">{{action}}</output></div>
   </Card>
   <Card><h2 class="text-lg font-semibold">Native input alternatives</h2><p class="text-sm text-muted-foreground">Browser date picker and datalist; no custom month grid or command palette.</p>
    <form data-testid="native-form" @submit.prevent @reset="reset"><Grid gap="default" columns="1" md-columns="2">
     <DatePicker name="date" v-model:value="date" min="2026-01-01" max="2026-12-31">Report date</DatePicker><Calendar name="calendar" :value="date">Calendar alternative</Calendar>
     <Combobox name="project" list-id="projects">Project suggestions<template #options><option value="Atlas"/><option value="Orbit"/></template></Combobox>
     <Command name="command" list-id="commands">Command search<template #options><option value="New report"/><option value="Open settings"/></template></Command>
     <Select name="status">Status<template #options><option value="draft">Draft</option><option value="published">Published</option></template></Select>
     <InputOtp name="code" v-model:value="code" :max-length="6">Verification code</InputOtp>
     <Questionnaire name="questions"><template #legend>Notifications</template><Checkbox name="updates">Product updates</Checkbox></Questionnaire>
     <div><Button type="reset" variant="outline">Reset inputs</Button><output data-testid="date-value">{{date}}</output><output data-testid="code-value">{{code}}</output></div>
    </Grid></form>
   </Card>
   <Card><h2 class="text-lg font-semibold">Content and layout</h2><NavigationMenu label="Report navigation"><a href="#overview" aria-current="page">Overview</a><a href="#activity">Activity</a></NavigationMenu>
    <Grid columns="1" md-columns="2" gap="default"><Sidebar label="Report sidebar"><h3 class="font-semibold">Workspace</h3><a class="underline" href="#reports">Reports</a></Sidebar><Resizable><h3 class="font-semibold">Resizable surface</h3><p>Use the native corner grip. This is not a split-pane controller.</p></Resizable></Grid>
    <MessageScroller label="Conversation"><Message label="Message from Alex"><Marker>Today</Marker><Bubble>All report components are generated locally.</Bubble><Attachment href="#download" download="report.txt">Download report.txt</Attachment></Message><Message label="Your reply"><Bubble>The recipes use our shared theme.</Bubble></Message></MessageScroller>
    <Carousel label="Featured reports"><Card><h3>Quarter one</h3><p>Swipe or scroll horizontally.</p></Card><Card><h3>Quarter two</h3></Card><Card><h3>Quarter three</h3></Card></Carousel>
    <Chart><svg viewBox="0 0 300 100" role="img" aria-label="Illustrative upward trend" class="h-24 w-full" fill="none" stroke="currentColor" stroke-width="3"><path d="M10 90L100 60L180 70L290 10"/></svg><template #caption>Caller-supplied graphic; Chart owns the figure and caption.</template></Chart>
    <DataTable><template #caption>Recent reports</template><template #head><tr><th scope="col">Report</th><th scope="col">Status</th></tr></template><tr><td>Quarter one</td><td>Draft</td></tr></DataTable>
    <div class="flex flex-wrap gap-2"><Button @click="notice='Report saved'">Show notification</Button><Button variant="outline" @click="notice=''">Dismiss notification</Button></div><Toast data-testid="notification">{{notice}}</Toast>
   </Card>
  </Grid>
 </main>
</template>
