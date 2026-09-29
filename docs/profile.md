# Generated Vue profile

Accepted input has a regular TypeScript script exporting literal `contractVersion = 2`, literal `ui`, and the matching generated Style/Classes declarations; a TypeScript setup script (Vapor optional); and one HTML template with a single owned native root. Every owned native element has static data-ui and data-ui-part markers. Slots are insertion points, not implicit owned parts.

The parser verifies literal shape, duplicate/unknown fields, anatomy, state-source references, native pseudo applicability, and type/metadata agreement without evaluating source. It rejects dynamic part markers, external SFC blocks, owned-node structural conditions/loops, teleport/component anatomy, and slot fallback structures outside the emitter profile. It is not an arbitrary Vue transformation service.

Behavior scripts and template bindings survive unchanged. The only script addition is a precise type-only Vue HTMLAttributes augmentation for data-html-ui-style, required by the pinned Vue types. Each owned node gains that deterministic marker and the SFC gains a scoped stylesheet. Existing styles remain intact.

Repeat transformation validates and replaces only the tool-owned marker/style/type additions. Identical source and configuration produce byte-stable output. Edited generated styles cause an error; express edits in recipes or a separate style block. Different resolved recipes receive different markers, avoiding collisions between variants of the same primitive.

State sources can be on the styled node or another owned node. The selector compiler follows direct structural paths, using :has for descendant/sibling sources. It never relies on any matching ancestor. Native CSS continues to determine state, with no added listeners or state mirroring.

Input markup with adapter-required behavior retains that limitation and emits a stderr warning. The theme stage cannot generate collection keyboard navigation or enforce aria-disabled activation.

Class-plugin mode (`--plugin`) adds typed presentation props and CVA bindings instead of the declaration stylesheet. It validates declared state/part requirements and boolean presence hooks. Pipe output retains this profile; final library output separates metadata and recipes and is not accepted as standalone pipeline input. See [plugins](plugins.md).
