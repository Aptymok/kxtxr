# KXTXR · React Grimoire Shell

Phase 2 source for the visual shell of the KXTXR Open Grimoire.

This directory is intentionally isolated from the current static production root. The repository does not currently contain a React build pipeline, so this phase defines the component and its visual contract without forcing a framework migration.

## Files

- `KxtxrGrimoireShell.jsx` — reusable React component.
- `KxtxrGrimoireShell.css` — CSS-only visual system and motion.
- `grimoire-shell-content.json` — eight menu nodes plus Sanskrit/runic/Spanish overlay labels.

## Visual contract

The shell represents the final post-opening state:

```text
OPEN GRIMOIRE
      ↓
HOLOGRAPHIC CONSOLE
      ↓
BREATHING KXTXR SIGIL
      ↓
INTERMITTENT CSS GLITCH
      ↓
8 NAVIGATION NODES
```

The open book is drawn in CSS and acts as the source of the holographic projection.

No Three.js is required.

## Eight nodes

```text
Creation              Field
Frecuency              Alchemical Lab
Notes                  Objects
[ T - 0.00001 ]        Reconstructions
```

Desktop positions the nodes around the central console. Narrow layouts collapse them into a responsive grid.

## Language behavior

Sanskrit and runes are always present.

The toggle only adds a Spanish translation layer:

```text
RITUAL LAYER
संस्कृत + RUNES
      +
OPTIONAL ES OVERLAY
```

It never replaces or removes the ritual layer.

Hover/focus exposes a tooltip for each node.

## Logo behavior

The central sigil has two separate motion systems:

1. slow breathing glow;
2. three intermittent CSS glitch layers with different periods.

The corner sigil rotates slowly inside a two-ring orbital console.

## Component API

```jsx
<KxtxrGrimoireShell
  content={content}
  initialNode="creation"
  onNavigate={(node) => console.log(node)}
/>
```

If `content.menu` is absent, the component uses its built-in eight-node fallback.

`onNavigate` is deliberately transport-agnostic. Phase 3 can map nodes to hashes, routes, existing KXTXR surfaces or future React views without changing the shell.

## Production boundary

This phase does **not** replace the current `index.html` and does not add React dependencies to production.

The next integration decision is explicit:

- migrate the KXTXR root to a small React/Vite runtime; or
- mount the shell progressively while preserving the existing static runtime.
