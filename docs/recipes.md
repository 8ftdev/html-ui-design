# Recipes

Top-level JSON shape: `components: { componentName: { partName: PartRecipe } }`. A PartRecipe accepts optional `base`, `state`, and `unstyled`. State keys must exist in the selected component's UI contract. The file can contain overrides for multiple components; only the current component is applied. Unknown part/state paths for that component are errors.

Each base/state branch is a CSS declaration object with kebab-case properties and string values, a replace operation with a declaration value, or an omit operation. CSS custom properties are supported. Values containing declaration/block delimiters, HTML delimiters, or !important are rejected in this initial grammar. Arbitrary selectors, at-rules, responsive recipe axes, compound recipes, and Tailwind class strings are not supported payloads in this release. Custom CSS values should refer to tokens available in the consuming application.

Role defaults supply reusable declarations; disclosure-trigger and action roles share the appropriate recipe between components. All current catalog roles are recognized; structural roles may intentionally add no declarations. Unknown roles warn and use neutral styles; --strict turns that warning into an error. Token validation occurs after branch resolution so omitted defaults do not demand unused tokens.

Merge operates on CSS property keys. It is not shorthand expansion: replacing background-color does not remove a separate background shorthand. Prefer longhands when mixing independently authored recipe contributions. Later contributions at the same property are emitted later; replace removes all earlier properties at that branch.

Appearance order is base, required, expanded, open, checked, indeterminate, pressed, selected, hover, active, invalid, disabled, focusWithin, focusVisible. Hover is gated by `(hover: hover)`; hover/active recipes exclude the part's declared disabled condition. Focus remains available on focusable aria-disabled controls. Busy, inert, disabled, and invalid are not interchangeable.

Unstyled and omit remove only generated recipe contributions. Browser defaults, inherited appearance, unrelated application CSS, and semantic visibility remain. No CSS declaration can change the native meaning of disabled or create missing behavior.

Recipes use a small documented default scale: 0.25/0.5/0.75/1rem spacing, 0.875rem control text, 1.125rem headings, a 2.25rem minimum control height, and 2px focus outlines. Colors and radius use semantic theme tokens. These defaults can all be replaced through declaration recipes.
