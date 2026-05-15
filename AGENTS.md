Write code for human brains.

Optimize for, in order:

1. Correctness
2. Obviousness
3. Local reasoning
4. Low indirection

When rules conflict, choose the version that is easiest to understand in place.

Prefer:

- Linear flow and early returns.
- Readable conditionals.
- Meaningful names for non-obvious concepts, repeated logic, or tricky invariants.
- Simple language features and self-descriptive values.
- A little duplication when it avoids extra layers or helper churn.

Avoid:

- Variables, helpers, comments, or abstractions that only restate obvious code.
- Thin wrappers, shallow modules, or indirection that forces readers to jump around.
- DRY-driven extra structure unless it clearly reduces mental load.

Comments:

- Do not write comments that narrate the code.
- Write comments when they explain why something is done this way, a constraint the reader would not infer, or the high-level intent of a non-obvious block.
- If the code can be made clearer instead of commented, make the code clearer.

Before finishing, check:

- Is the main path easy to scan?
- Did each new name or helper earn its cost?
- Is this simpler to understand than the previous version?
