import type MagicString from 'magic-string';
import {parse as parseJS} from '@babel/parser';
import {parse as parseSFC} from '@vue/compiler-sfc';
import type {ComponentRecipe} from '../plugins/schema';
import type {VueInput} from '../model';
import {motionRuntimeSource} from './runtime-source';

export function injectMotion(source:string, input:VueInput, mapping:ComponentRecipe, edits:MagicString, runtimePath?:string) {
  const entries=Object.entries(mapping.motion ?? {});
  if (!entries.length) return;
  const root=input.nodes.find(n=>n.part==='root');
  const trigger=input.nodes.find(n=>n.part==='trigger');
  const panel=input.nodes.find(n=>n.part===entries[0][0]);
  const state=input.ui.parts[entries[0][0]]?.state?.expanded?.source;
  if(entries.length!==1 || entries[0][0]!=='content' || root?.tag!=='details' || trigger?.tag!=='summary' || trigger.parent!==root.node || panel?.parent!==root.node || panel.tag!=='div' || state?.node!==root.node || !('attribute' in state) || state.attribute!=='open' || !('present' in state) || state.present!==true)
    throw new Error('disclosure motion requires details root, summary trigger and owned content.expanded bound to root.open');
  const {descriptor}=parseSFC(source);
  const setup=descriptor.scriptSetup!;
  if(setup.content.includes('_uiMotion') || source.includes('v-ui-motion')) throw new Error('reserved motion identifier collision');
  const offset=setup.loc.start.offset;
  const body=parseJS(setup.content,{sourceType:'module',plugins:['typescript']}).program;
  let sets=0, reads=0;
  const walk=(node:any)=>{
    if(!node || typeof node!=='object')return;
    if(node.type==='CallExpression' && node.callee.type==='MemberExpression' && node.callee.object.name==='Reflect' && node.callee.property.name==='set' && node.arguments[1]?.value==='open') {
      const args=[node.arguments[0],node.arguments[2]].map((n:any)=>setup.content.slice(n.start,n.end));
      edits.overwrite(offset+node.start,offset+node.end,`_uiMotionSetOpen(${args.join(', ')})`);sets++;
    } else if(node.type==='MemberExpression' && node.computed && node.property?.value==='open' && (node.object.name==='node' || (node.object.type==='MemberExpression' && node.object.object.name==='_htmlUiNode0' && node.object.property.name==='value'))) {
      edits.overwrite(offset+node.start,offset+node.end,`_uiMotionReadOpen(${setup.content.slice(node.object.start,node.object.end)})`);reads++;
    }
    for(const value of Object.values(node))if(Array.isArray(value))value.forEach(walk);else if(value && typeof value==='object')walk(value);
  };
  walk(body);
  if(sets!==1 || reads!==3 || !setup.content.includes('const _htmlUiState0 =')) throw new Error(`unsupported disclosure state bridge in generated Vue profile (sets=${sets}, reads=${reads})`);
  const prop=JSON.stringify(entries[0][0]);
  const props=body.body.find(n=>n.type==='TSInterfaceDeclaration'&&n.id.name==='Props');
  if(props?.type!=='TSInterfaceDeclaration') throw new Error('missing generated Props');
  edits.appendLeft(offset+props.body.end!-1, `\n  motion?: false | { ${prop}?: { expanded?: { preset?: 'disclosure'; duration?: string; easing?: string } } };\n`);
  edits.appendLeft(offset, `\nimport { watchPostEffect as _uiMotionEffect } from 'vue'\n` + (runtimePath ? `import { uiDisclosureMotion } from ${JSON.stringify(runtimePath)}\n` : motionRuntimeSource.replace(/^export /gm,'')));
  const defaults=JSON.stringify(entries[0][1].expanded).replace(/<\/script/gi,'<\\/script');
  edits.appendLeft(setup.loc.end.offset, `
const _uiMotionControllers = new WeakMap<HTMLDetailsElement, ReturnType<typeof uiDisclosureMotion>>()
const _uiMotionReadOpen = (node: HTMLDetailsElement): boolean => _uiMotionControllers.get(node)?.readOpen() ?? node.open
const _uiMotionSetOpen = (node: Element, value: boolean): void => {
  const root = node as HTMLDetailsElement
  const controller = _uiMotionControllers.get(root)
  if (controller) controller.setOpen(value)
  else root.open = value
}
const _uiMotionOptions = () => ({ ...${defaults}, ...(_htmlUiProps.motion === false ? {} : _htmlUiProps.motion?.[${prop}]?.expanded), enabled: _htmlUiProps.motion !== false && !_htmlUiProps.unstyled })
const vUiMotion = (root: HTMLDetailsElement) => {
  let disposed = false
  const stop = _uiMotionEffect(() => {
    if (disposed) return
    const options = _uiMotionOptions()
    let controller = _uiMotionControllers.get(root)
    if (!controller) {
      const panel = root.querySelector<HTMLElement>(':scope > [data-ui-part="content"]')!
      controller = uiDisclosureMotion(root, panel, options, value => {
        if (!Object.is(_htmlUiState0.value, value)) {
          _htmlUiState0.value = value
          _htmlUiEmit('update:open', value)
        }
      })
      _uiMotionControllers.set(root, controller)
    }
    controller.update(options)
  })
  return () => { disposed = true; stop(); _uiMotionControllers.get(root)?.dispose(); _uiMotionControllers.delete(root) }

}

`);
  edits.appendLeft(root.start,' v-ui-motion');
}
