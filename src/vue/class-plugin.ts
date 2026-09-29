import { parse as parseSFC } from "@vue/compiler-sfc";
import { parse as parseJS } from "@babel/parser";
import {
  baseParse,
  NodeTypes,
  type TemplateChildNode,
} from "@vue/compiler-dom";
import MagicString from "magic-string";
import { parseVue } from "./parse.js";
import { cleanGenerated, digest } from "./transform.js";
import { injectMotion } from "../motion/inject.js";
import {injectInteraction,validateInteraction} from '../interaction/inject.js';
import { parsePlugin, type UIPlugin } from "../plugins/schema.js";
const stamp = /^<!-- html-ui-plugin:([a-f0-9]{20}):([a-f0-9]{20}) -->\n/;
const js = (v: unknown) =>
  JSON.stringify(v).replace(/<\/script/gi, "<\\/script");
export function applyClassPlugin(
  source: string,
  raw: unknown,
  options: { component: string; filename: string; motionRuntimePath?: string; interactionRuntimePath?:string },
): { source: string; warnings: string[] } {
  const plugin = parsePlugin(raw),
    hash = digest(JSON.stringify(plugin)),
    previous = source.match(stamp);
  if (previous) {
    const body = source.slice(previous[0].length);
    if (digest(body) !== previous[2])
      throw new Error(
        "generated component was edited; regenerate from primitive source and review the diff",
      );
    if (previous[1] !== hash)
      throw new Error(
        "plugin changed; regenerate from primitive source and review the diff",
      );
    return { source, warnings: [] };
  }
  source = cleanGenerated(source);
  const input = parseVue(source, options.filename),
    component = plugin.components[options.component];
  if (!component || component.primitive !== input.ui.component)
    throw new Error(
      `plugin has no mapping for primitive ${input.ui.component}`,
    );
  validateInteraction(input,component);
  if (input.ui.behavior.kind === "adapter-required" && !component.interaction)
    throw new Error(`${input.ui.component} needs an interaction adapter`);
  for (const [part] of Object.entries(component.parts))
    if (!input.ui.parts[part]) throw new Error(`unknown part ${part}`);
  for (const req of component.requirements) {
    if (req.state && !input.ui.parts[req.part]?.state?.[req.state])
      throw new Error(
        `missing state ${req.part}.${req.state}: ${req.description}`,
      );
    if (req.hook)
      throw new Error(`unsupported hook ${req.hook}: ${req.description}`);
  }
  const { descriptor } = parseSFC(source),
    setup = descriptor.scriptSetup!;
  const ast = parseJS(setup.content, {
    sourceType: "module",
    plugins: ["typescript"],
  });
  const props = ast.program.body.find(
    (n) => n.type === "TSInterfaceDeclaration" && n.id.name === "Props",
  );
  if (props?.type !== "TSInterfaceDeclaration")
    throw new Error("expected generated Props interface");
  const propMembers = props.body.body;
  const native = new Set(
    propMembers.flatMap((n) =>
      n.type === "TSPropertySignature"
        ? [
            n.key.type === "Identifier"
              ? n.key.name
              : n.key.type === "StringLiteral"
                ? n.key.value
                : "",
          ]
        : [],
    ),
  );
  const axes: Record<
    string,
    { type: string; values: Set<string>; default?: string | boolean }
  > = {};
  for (const r of Object.values(component.parts))
    for (const [a, choices] of Object.entries(r.variants)) {
      if (native.has(a) || ["classes", "styles", "unstyled"].includes(a) || (a === "motion" && Object.keys(component.motion ?? {}).length))
        throw new Error(`presentation prop collision: ${a}`);
      axes[a] ??= {
        type: r.axisTypes[a],
        values: new Set(),
        default: r.defaultVariants[a],
      };
      for (const v of Object.keys(choices)) axes[a].values.add(v);
    }
  for (const name of ["classes", "styles", "unstyled"])
    if (native.has(name))
      throw new Error(`presentation prop collision: ${name}`);
  const edits = new MagicString(source),
    offset = setup.loc.start.offset;
  if (setup.content.includes("uiRecipe") || setup.content.includes("uiCva"))
    throw new Error("reserved generated recipe identifier collision");
  edits.appendLeft(
    offset,
    `\nimport { cva as uiCva } from 'class-variance-authority'\nimport type { CSSProperties as UiCSSProperties, HTMLAttributes as UiHTMLAttributes } from 'vue'\n`,
  );
  const partUnion = Object.keys(component.parts).map(js).join(" | ");
  const types = Object.entries(axes)
    .map(
      ([a, x]) =>
        `  ${js(a)}?: ${x.type === "boolean" ? "boolean" : [...x.values].map(js).join(" | ")};`,
    )
    .join("\n");
  const propName = (name: string) => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  const forwardNames = options.component === 'button'
    ? ['id','role','tabindex','title','dir','inert','aria-label','aria-labelledby','aria-describedby','aria-controls','aria-selected','aria-disabled','aria-current','aria-haspopup','aria-expanded','aria-pressed']
        .filter(name=>!native.has(propName(name)))
    : [];
  // Vue normalizes hyphenated component attributes to camelCase prop names.
  // Keep the DOM spelling for the binding, but read the normalized prop.
  const forwarded=forwardNames.map(name=>`  ${js(propName(name))}?: UiHTMLAttributes[${js(name)}];`).join('\n');
  if(forwardNames.length){
    const root=input.nodes.find(n=>n.part==='root');
    if(!root||root.tag!=='button')throw new Error('Button HTML attributes require a native button root');
    edits.appendLeft(root.start,forwardNames.map(name=>` :${name}="_htmlUiProps['${propName(name)}']"`).join(''));
  }
  edits.appendLeft(
    offset + props.body.end! - 1,
    `\n${types}\n${forwarded}\n  classes?: Partial<Record<${partUnion}, string>>;\n  styles?: Partial<Record<${partUnion}, UiCSSProperties>>;\n  unstyled?: boolean;\n`,
  );
  for (const n of ast.program.body)
    if (n.type === "VariableDeclaration")
      for (const d of n.declarations) {
        const call = d.init;
        if (
          d.id.type === "Identifier" &&
          d.id.name === "_htmlUiProps" &&
          call?.type === "CallExpression" &&
          call.callee.type === "Identifier" &&
          call.callee.name === "withDefaults"
        ) {
          const defaults = call.arguments[1];
          if (defaults?.type !== "ObjectExpression")
            throw new Error("expected literal prop defaults");
          const entries = Object.entries(axes).map(
            ([a, x]) =>
              `${js(a)}: ${x.default === undefined ? "undefined" : js(x.default)}`,
          );
          // Vue casts absent Booleanish props to false unless the default is
          // explicitly undefined. An absent aria-pressed/expanded attribute
          // must stay absent on ordinary buttons.
          entries.push(...forwardNames
            .filter(name => ["aria-selected", "aria-disabled", "aria-current", "aria-haspopup", "aria-expanded", "aria-pressed"].includes(name))
            .map(name => `${js(propName(name))}: undefined`));
          if (entries.length)
            edits.appendLeft(
              offset + defaults.end! - 1,
              `\n${entries.join(",\n")},\n`,
            );
        }
      }
  let recipes = "\n";
  const quote = (s: string) => `'${s}'`;
  const expressions: Record<string, string> = {};
  let index = 0;
  for (const [part, r] of Object.entries(component.parts)) {
    const name = `uiRecipe${index++}`;
    const config = {
      variants: Object.fromEntries(
        Object.entries(r.variants).map(([axis, choices]) => [
          axis,
          Object.fromEntries(
            [...axes[axis].values].map((value) => [
              value,
              choices[value] ?? [],
            ]),
          ),
        ]),
      ),
      defaultVariants: r.defaultVariants,
      compoundVariants: r.compoundVariants.map((c) => ({
        ...c.when,
        class: c.classes,
      })),
    };
    recipes += `const ${name} = uiCva(${js(r.base)}, ${JSON.stringify(config, null, 2).replace(/<\/script/gi, "<\\/script")})\n`;
    expressions[part] =
      `[_htmlUiProps.unstyled ? undefined : ${name}({ ${Object.keys(r.variants)
        .map((a) => `${quote(a)}: _htmlUiProps[${quote(a)}]`)
        .join(", ")} }), _htmlUiProps.classes?.[${quote(part)}]]`;
  }
  edits.appendLeft(setup.loc.end.offset, recipes);
  const attributes = [
    ...new Set((component.hooks ?? []).map((h) => h.attribute)),
  ];
  if (attributes.length)
    edits.appendLeft(
      descriptor.script!.loc.end.offset,
      `\ndeclare module 'vue' { interface HTMLAttributes { ${attributes.map((a) => `${js(a)}?: string;`).join(" ")} } }\n`,
    );
  const templateOffset = descriptor.template!.loc.start.offset;
  function visit(children: TemplateChildNode[]) {
    for (const n of children) {
      if (n.type !== NodeTypes.ELEMENT) continue;
      const attr = n.props.find(
        (p) => p.type === NodeTypes.ATTRIBUTE && p.name === "data-ui-part",
      );
      const part =
        attr?.type === NodeTypes.ATTRIBUTE ? attr.value?.content : undefined;
      if (part && expressions[part]) {
        if (
          n.props.some(
            (p) =>
              (p.type === NodeTypes.ATTRIBUTE &&
                ["class", "style"].includes(p.name)) ||
              (p.type === NodeTypes.DIRECTIVE &&
                p.name === "bind" &&
                p.arg?.type === NodeTypes.SIMPLE_EXPRESSION &&
                ["class", "style"].includes(p.arg.content)),
          )
        )
          throw new Error(
            `existing class/style binding on ${part}; use a recipe override`,
          );
        const esc = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        const node = input.nodes.find((x) => x.part === part)!;
        edits.appendLeft(
          node.start,
          ` :class="${esc(expressions[part])}" :style="${esc(`_htmlUiProps.styles?.[${quote(part)}]`)}"`,
        );
        for (const h of component.hooks ?? [])
          if (h.part === part) {
            const member = propMembers.find(
              (m) =>
                m.type === "TSPropertySignature" &&
                (m.key.type === "StringLiteral"
                  ? m.key.value
                  : m.key.type === "Identifier"
                    ? m.key.name
                    : "") === h.prop,
            );
            if (
              member?.type !== "TSPropertySignature" ||
              member.typeAnnotation?.typeAnnotation.type !== "TSBooleanKeyword"
            )
              throw new Error(
                `presence hook requires a boolean prop: ${h.prop}`,
              );
            if (!native.has(h.prop))
              throw new Error(`hook requires native prop ${h.prop}`);
            if (
              n.props.some(
                (p) => p.type === NodeTypes.ATTRIBUTE && p.name === h.attribute,
              )
            )
              throw new Error(`hook attribute collision ${h.attribute}`);
            edits.appendLeft(
              node.start,
              ` :${h.attribute}="${esc(`_htmlUiProps[${quote(h.prop)}] ? '' : undefined`)}"`,
            );
          }
      }
      if (n.tag === "slot")
        for (const p of n.props)
          if (
            p.type === NodeTypes.ATTRIBUTE &&
            p.name === "name" &&
            p.value &&
            component.slots[p.value.content]
          ) {
            edits.overwrite(
              templateOffset + p.loc.start.offset,
              templateOffset + p.loc.end.offset,
              `name=${js(component.slots[p.value.content])}`,
            );
          }
      visit(n.children);
    }
  }
  const tree = baseParse(descriptor.template!.content);
  const slotNames = new Set<string>();
  const collect = (children: TemplateChildNode[]) => {
    for (const n of children)
      if (n.type === NodeTypes.ELEMENT) {
        if (n.tag === "slot") {
          const a = n.props.find(
            (p) => p.type === NodeTypes.ATTRIBUTE && p.name === "name",
          );
          slotNames.add(
            a?.type === NodeTypes.ATTRIBUTE
              ? (a.value?.content ?? "default")
              : "default",
          );
        }
        collect(n.children);
      }
  };
  collect(tree.children);
  for (const slot of Object.keys(component.slots))
    if (!slotNames.has(slot)) throw new Error(`unknown source slot ${slot}`);
  const targets = [...slotNames].map((s) => component.slots[s] ?? s);
  if (new Set(targets).size !== targets.length)
    throw new Error("duplicate public slot");
  visit(tree.children);
  // The emitter's slot type keys are literal strings. Limit edits to defineSlots' type AST.
  for (const n of ast.program.body)
    if (
      n.type === "ExpressionStatement" &&
      n.expression.type === "CallExpression" &&
      n.expression.callee.type === "Identifier" &&
      n.expression.callee.name === "defineSlots"
    ) {
      const param = n.expression.typeParameters?.params[0];
      if (param?.type === "TSTypeLiteral")
        for (const member of param.members)
          if (
            (member.type === "TSPropertySignature" ||
              member.type === "TSMethodSignature") &&
            member.key.type === "StringLiteral" &&
            component.slots[member.key.value]
          )
            edits.overwrite(
              offset + member.key.start!,
              offset + member.key.end!,
              js(component.slots[member.key.value]),
            );
    }
  injectMotion(source, input, component, edits, options.motionRuntimePath);
  injectInteraction(source,input,component,edits,options.interactionRuntimePath);
  const body = edits.toString();
  return {
    source: `<!-- html-ui-plugin:${hash}:${digest(body)} -->\n${body}`,
    warnings: [],
  };
}
