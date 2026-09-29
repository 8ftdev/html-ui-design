# Native forms and content batch

Continue the approved HTML → validated contract → Vue/Vapor → local shadcn recipe pipeline. Ten blocks: Empty, Item, InputGroup, Kbd, Pagination, Typography, Direction, RadioGroup, Radio and Slider. Keep the v2 protocol and existing disclosure WAAPI unchanged.

Use owned parts and slots rather than a file for every visual fragment. InputGroup owns a single native input and separate associated label, with start/end addons accepting local primitives. RadioGroup scopes the native name; Radio supplies native defaultChecked, labels and change events. Group selection is read through events/FormData, avoiding independent boolean models that become stale when native radios uncheck their siblings. Slider keeps one native range input and numeric model/reset. Direction uses HTML dir inheritance; Typography styles caller-owned semantic markup. Pagination owns nav/list, with callers providing list items and links.

1. Publish the verified preceding batch on main (done in all three libraries).
2. Pin official Base Nova visual recipes and current documentation.
3. Add producer anatomy/state tests, then implement native catalog definitions.
4. Add plugin recipes, boundaries, compile tests and strict consumer type checks.
5. Generate locally into Nuxt nightly/Vapor; verify keyboard, naming, reset, disabled submission, styles, themes, mobile overflow and hydration in Chromium/Firefox/WebKit.
6. Review changes and update the support matrix/verification report. Keep this new batch local for review.

Completed and independently reviewed. See [verification report](batch-three-verification.md) for 125 plugin tests, strict consumers, 58 real catalog pipelines, 24 new development browser checks and 129 full production browser checks.
