---
name: NYU Course Catalog Assistant
description: A chat interface for grounded, cited course-planning answers, with a live catalog panel and citation-to-course linking.
colors:
  canvas: "#fafaf8"
  surface: "#ffffff"
  sidebar: "#f3f2ef"
  border: "#e5e3de"
  ink: "#1c1b19"
  muted: "#6b6862"
  faint: "#756f66"
  accent: "#7c3aed"
  accent-hover: "#6d28d9"
  accent-soft: "#f2ecff"
  accent-ink: "#5b21b6"
  danger: "#b23b32"
  danger-soft: "#fbe9e6"
  orb-from: "#ede9fe"
  orb-via: "#a78bfa"
  orb-to: "#6d28d9"
  top-glow: "linear-gradient(180deg, rgba(124,58,237,0.16), transparent)"
typography:
  headline:
    fontFamily: "IBM Plex Sans, ui-sans-serif, -apple-system, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "IBM Plex Sans, ui-sans-serif, -apple-system, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, -apple-system, Segoe UI, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "16px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "8px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  citation-chip:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 6px"
  sidebar-item-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
---

# Design System: NYU Course Catalog Assistant

## Overview

**Creative North Star: "The Citation Index"**

The system's one idea: a citation is a pointer, not a footnote. Everywhere the product cites a course, that citation is clickable and lands you on the live record it's drawn from — the catalog panel scrolls to it and holds it lit. Everything else stays out of the way of that idea: a warm, near-monochrome canvas; one committed violet accent spent only on things you can act on; a gradient violet orb as the assistant's one signature mark; IBM Plex Sans for reading, IBM Plex Mono wherever a course code or a number needs to be counted rather than read.

This is an Operate surface, not a Persuade one — the visual language plays the modern AI-chat convention straight (sidebar history, conversational thread, bottom-pinned composer), filling the viewport edge-to-edge with a soft violet glow anchored to the top of the screen, in both themes, rather than any card chrome. **Revision history:** this system originally ran a committed-cobalt, strictly-flat, no-gradient palette and explicitly named NYU's institutional violet and torch mark as anti-references, reasoning that an independent product identity shouldn't borrow the school's own branding. That direction was deliberately replaced at the user's explicit request: a pinned external reference (a chat UI called "ThinkAI") was recolored from its original green to violet and copied structurally, including its gradient orb — the user was told this reintroduces the violet the system had previously avoided and confirmed it anyway (recorded in PRODUCT.md Brand Commitments). Treat this as the current, intentional direction, not an unreviewed drift.

**Key Characteristics:**
- One accent, spent only on interactive/citable elements — never a background field, with two named exceptions: the gradient orb and the top glow.
- Warm-neutral canvas, edge-to-edge, with a soft violet glow anchored to the top of the screen in both themes — the system's one ambient (non-interactive) use of the accent hue.
- Monospace reserved for data (course codes, credits) — never a costume for "technical."
- Flat at rest, with one named exception: every text-input surface (chat composer, its send button, catalog search, department select, chat search) is liquid glass — translucent, blurred, refracted, rimmed with a lit highlight — at the user's explicit request, superseding this system's earlier "no glass/blur as decoration" stance for that one category of element. Everything else (rows, chips, panels, buttons that aren't inputs) stays flat.
- Full light/dark support, either following the visitor's system preference or their own explicit toggle (header, sun/moon icon) — the choice persists once made.

## Colors

A warm, restrained neutral field carries the interface; one committed violet is the system's only color statement, spent exclusively on things the visitor can click or act on, plus the gradient orb and the top glow as the system's two named, purely decorative exceptions.

### Primary
- **Committed Violet** (`#7c3aed` light / `#a78bfa` dark): the system's one accent. New-chat button, active sidebar item, citation chips, links, the composer's send button, and focus rings — nothing else. It never fills a background region.
- **Orb Gradient** (top-to-bottom: `#6d28d9 → #a78bfa → #ede9fe → #ffffff` light / `#4c1d95 → #8b5cf6 → #c4b5fd → #ffffff` dark): the assistant's one signature mark — the empty-state greeting icon and the small avatar beside every assistant message. Deep violet at the top softening to white at the bottom, in both themes — a deliberate glow-into-light effect, not a flat tint. Along with the top glow, this is one of only two gradients in the system; neither ever appears on anything else (no gradient text, no gradient buttons, no other gradient backgrounds).
- **Top Glow** (`rgba(124,58,237,0.16) → transparent` light / `rgba(167,139,250,0.28) → transparent` dark, top to ~75% down the viewport): a soft ambient wash anchored to the top of the screen, behind the whole app (sidebar included). The system's only other non-flat fill besides the orb; it is decorative atmosphere, not a clickable surface, so it carries no border and no shadow.

### Neutral
- **Warm Paper Canvas** (`#fafaf8` light / `#18181a` dark): the page background. Warm-neutral, not stark white, not AI-default cream.
- **Clean Surface** (`#ffffff` light / `#202023` dark): elevated surfaces — the composer, the user's message bubble, catalog rows at rest.
- **Soft Graphite Wash** (`#f3f2ef` light / `#141416` dark): the sidebar's own ground, one step darker/dimmer than canvas so the app reads as three distinct regions at a glance.
- **Hairline Warm Gray** (`#e5e3de` light / `#2c2c30` dark): every border in the system. Always 1px.
- **Near-Black Ink** (`#1c1b19` light / `#f0efec` dark): primary text.
- **Warm Slate** (`#6b6862` light / `#9d9a94` dark): secondary text — header titles, prerequisite copy, muted labels.
- **Quiet Slate** (`#756f66` light / `#8f8b82` dark): tertiary text — placeholders, hints, timestamps, the eval-credibility line. Tuned to clear 4.5:1 against canvas in both themes; do not darken further toward `muted` without rechecking contrast.
- **Grading-Pen Red** (`#b23b32` light / `#ff8a7a` dark): errors only, paired with its `-soft` tint for the banner fill.

### Named Rules
**The One Accent Rule.** Violet is reserved for elements the visitor can act on — a button, a link, a citation, an active state. If an element isn't clickable, it doesn't get the accent color. The orb gradient and the top glow are the rule's two named exceptions (they mark identity and atmosphere, not action) and must not be extended to any other element.

**The Theme-Follows-System-Or-Choice Rule.** Light and dark are both fully authored token sets. They switch by `prefers-color-scheme` when the visitor hasn't chosen, and by an explicit `data-theme` attribute (set via the header's sun/moon toggle, persisted to `localStorage`) when they have — an explicit choice always wins over the system preference. Dark is not an afterthought: `accent`, `accent-ink`, and `accent-soft` are independently tuned per theme, not a blind opacity flip of the light values.

## Typography

**Body/UI Font:** IBM Plex Sans (with `ui-sans-serif, -apple-system, Segoe UI, system-ui, sans-serif`)
**Label/Mono Font:** IBM Plex Mono (with `ui-monospace, SFMono-Regular, Menlo, monospace`)

**Character:** A workhorse pairing, deliberately chosen over the more common Inter/Roboto default for an Operate surface — IBM Plex's own mono and sans share a family, so course codes set in mono read as the same system speaking in its data register, not a second typeface bolted on.

### Hierarchy
- **Headline** (600, 1.25rem/20px, 1.3 line-height, -0.01em tracking): the empty-state welcome ("Ask about the CS course catalog"). The only display-scale moment in the system — this is an Operate surface, not a hero-driven one.
- **Title** (600, 0.875rem/14px): panel and section headers ("Course catalog"), the sidebar wordmark.
- **Body** (400, 0.95rem/15.2px, 1.65 line-height): chat messages and answers. Max measure ~72ch (`max-w-measure`).
- **Label** (500, 0.75rem/12px, mono): course codes, credit counts, citation chip text — anywhere a value is being counted rather than read as prose.

### Named Rules
**The Counted-Not-Read Rule.** Mono type appears only where a value is data: a course code, a credit count, a citation. It never appears as a "technical-looking" display face for headings or body copy.

## Layout

The app fills the viewport edge-to-edge — no floating shell, no page inset. The top glow sits behind the whole shell (sidebar included), anchored to the top and fading out by roughly 75% of the viewport height, so it reads as ambient light on the app itself rather than a separate backdrop.

Three-region shell: a fixed 288px sidebar (conversation history), a fluid center column capped at `max-w-3xl` (chat thread + composer), and a fixed 320px catalog panel (`xl` breakpoint and above). Below `xl`, the catalog panel becomes a full-width slide-over from the right; below `lg`, the sidebar becomes a slide-over from the left, both with a dimmed backdrop and a close control. The chat column is always what remains full-width on narrow viewports — it is the surface's primary task and never collapses.

The sidebar's own collapse control hides it completely at every breakpoint (width and layout reservation both go to zero) rather than leaving a persistent icon-only rail — there is no intermediate "collapsed but still visible" state. The empty-state (new-chat) content is centered on the true viewport width via `position: fixed`, independent of whichever sidebar/catalog state is currently reserving space, so it doesn't visually shift depending on what's open; the sidebar and catalog panel are given explicit stacking (`z-40`, `position: relative` when pushing layout) so they correctly render on top of that fixed layer at narrower widths where they'd otherwise overlap.

Spacing rhythm runs on a tight base-2 (Tailwind default) scale: `gap-1.5`–`gap-2` inside icon+label clusters, `px-3`–`px-4`/`py-2`–`py-3` for controls and panel headers, `gap-5` (20px) between chat messages, `py-6` for the thread's outer padding. More space separates message groups than sits inside one.

## Elevation & Depth

Flat by default. Catalog rows, sidebar items, and panel chrome carry no shadow at rest — depth comes from the three background tones (canvas / sidebar / surface) and 1px hairline borders, not from elevation. Shadow is reserved for surfaces that visually float over the thread: the composer and, more subtly, resting cards against the canvas.

### Shadow Vocabulary
- **`panel`** (`0 1px 3px rgb(0 0 0 / 0.04)`): the ambient lift under catalog rows and other resting surface cards — barely there, a hint of separation from canvas.
- **`composer`** (`0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.18)`): the floating chat input, the one element in the system that visually sits above the page.

### Named Rules
**The Ambient-Not-Structural Rule.** Shadow never stands in for hierarchy that color and spacing should carry. It marks exactly one thing: "this floats above the surface beneath it."

## Materials: Liquid Glass

Glass, not flat, is now this system's default surface for anything the visitor reads as a discrete, interactive unit: the chat composer and its send button, the catalog search box and department `<select>`, the chat-search input and its "New chat" button (both copies, sidebar and search page), the empty-state suggestion chips, the user's own chat bubble, catalog course rows, and the favorite-department chips (`.glass-surface` / `.glass-accent` in `index.css`). This is a deliberate, named exception to the Ambient-Not-Structural Rule above and to this system's original flat-only stance — added at the user's explicit request in two steps: first scoped to text inputs referencing Apple's Liquid Glass and iOS/ChatGPT screenshots, then widened to every one of the surfaces just listed ("wherever applicable"). Not a generic "add some blur" pass either time.

**Recipe:** a translucent tint (`--glass-fill`, ~50% white in light / ~8% white in dark) over `backdrop-filter: blur() saturate()`; a `url(#liquid-glass-lens)` SVG filter (`feTurbulence` + `feDisplacementMap`, defined once in `LiquidGlassDefs.tsx` and mounted at the app root) that warps the blurred backdrop to fake light refracting through curved glass; a hairline translucent border; and inset shadows faking a lit top edge and a shadowed underside (`inset 0 1px 1px` light, `inset 0 -1px` dark). Accent-colored elements (the send button, a favorited department chip) get `.glass-accent` (`--glass-accent-fill`) rather than a solid violet fill, so they read as colored glass, not a flat CTA sitting in a glass field. An element that needs to show an active/"you are here" state without losing its glass (a highlighted catalog row) adds `.is-active`, which swaps just the border to `--accent` — layered after `.glass-surface` in the stylesheet so it wins the border-color that shorthand also sets. Safari drops the lens (no combined `backdrop-filter` + `url()` support) and falls back to plain frosted blur via `-webkit-backdrop-filter` — an accepted graceful degradation, not a bug to fix.

**Where it does and doesn't shine:** the effect is most visible where something textured sits behind the glass to blur (the ambient top-glow, or scrolled content) — it reads as a legitimate translucent material even at rest, but don't expect a dramatic distortion over a flat panel background with nothing behind it to warp.

### Named Rules
**The Discrete-Unit Rule** (supersedes the original Inputs-Only Rule). Glass applies to things the visitor reads as one countable, actionable object — an input, a button, a chip, a message bubble, a list row. It does not apply to structural chrome: the sidebar, header, and panel backgrounds stay flat, or glass would stop reading as a material and start reading as a screen-wide filter.

## Shapes

Two radius steps carry the whole system: **8px** (`rounded-lg`) for controls, inputs, and catalog rows; **16px** (`rounded-2xl`) for the user's message bubble, softened further with a `rounded-br-md` (6px) tail corner toward the sender. Interactive pills — citation chips, the send button, example-question chips, and the chat composer itself — use a **full** radius, as does the orb: the composer deliberately matches the rounding of the example-question chips it sits below, so the one thing the visitor types into and the prompts that suggest what to type read as the same family of control. No nested-card chrome anywhere: a catalog row or sidebar item is a single flat surface with one border, never a card inside a card.

## Components

### Buttons
- **Shape:** full radius (`rounded-full`) for the composer's send button and example-question chips; 8px (`rounded-lg`) for "New chat" and other rectangular actions.
- **Primary (send):** violet fill, white icon, 32px circle; disabled state drops to `faint/50` fill rather than a lower-opacity violet.
- **Secondary ("New chat"):** surface background, hairline border, ink text; hover shifts the border toward accent and the text toward `accent-ink`. No fill change.
- **Hover/Focus:** color/background transitions only (no scale or shadow pop); focus-visible gets a 2px cobalt outline with 2px offset, themed via `:focus-visible`, not the browser default.

### Chips
- **Citation chip:** `accent-soft` background, `accent-ink` text, mono label type, full radius, hairline `accent/25` border. Hover deepens the border and background slightly — it must read as clickable before the visitor clicks it.
- **Example-question chip (empty state):** surface background, hairline border, muted text; hover shifts border and text toward accent, same language as the secondary button.

### Cards / Containers (catalog rows)
- **Corner Style:** 8px.
- **Background:** canvas at rest; `accent-soft` with an `accent/40` border when the row is the target of an active citation link — the system's one persistent "you are here" state.
- **Shadow:** none.
- **Border:** transparent at rest (reserves the highlighted state's border without a layout shift), hairline once highlighted.
- **Internal Padding:** `px-3 py-2`.

### Inputs / Fields
- **Style:** hairline border, canvas or surface background depending on context; 8px radius for search/select fields, **full** radius for the chat composer (matches the example-question chips).
- **Focus:** border shifts to `accent/50`; the composer's whole container gets the focus treatment via `focus-within`, not just the textarea.
- **Disabled:** 60% opacity, no border change.
- **Vertical alignment:** the composer centers its textarea and send button on the cross-axis (`items-center`), so single-line placeholder and typed text sit centered in the pill rather than pinned to one edge.

### Navigation (sidebar)
- Flat list, no dividers between items — separation comes from the 2px gap and the active item's `accent-soft` fill. Active state is the only state with a background; inactive items are transparent until hover, which takes `surface` (not accent) so hover never competes visually with the true active state.

### Citation-to-Catalog Link (signature component)
The system's one behavioral signature: an inline `[COURSE-CODE]` citation in an answer is a real button. Clicking it sets the catalog panel's highlighted course, which smooth-scrolls that row into view and applies the highlighted-card treatment above. On narrow viewports the same click also opens the catalog slide-over. This is the built expression of the North Star and should not be diluted into a plain link or tooltip in future work.

### The Orb (signature mark)
The assistant's identity in one shape: a violet gradient circle, used at two sizes only — 56px for the empty-state greeting icon, 24px (20px in the sidebar wordmark) as the avatar beside every assistant message and the thinking indicator. Along with the top glow, it is one of the One Accent Rule's two named exceptions; do not add a third gradient element, and do not resize the orb to a third size without updating this doc.

## Do's and Don'ts

### Do:
- **Do** spend violet only on things the visitor can act on (the One Accent Rule), plus the orb.
- **Do** set course codes, credit counts, and citations in IBM Plex Mono; everything else in IBM Plex Sans.
- **Do** keep catalog rows and sidebar items flat at rest — reach for background-tone and border changes before reaching for shadow.
- **Do** route every citation through the same click → highlight → scroll behavior; it's the one interaction the whole identity is built on.
- **Do** author both light and dark values together for any new token; this system has no "dark mode as an afterthought."

### Don't:
- **Don't** introduce a second accent color, or any gradient beyond the orb and the top glow; the One Accent Rule covers the whole system, with those two named exceptions.
- **Don't** reach for cream/parchment tones or a display serif — those were the rolled-and-declined direction (Academic Typesetting), not this system.
- **Don't** add card-in-card nesting (a bordered row inside a bordered panel inside a bordered column). One border per surface.
- **Don't** treat violet as available for anything beyond the accent and the orb; it reintroduces an association (NYU's institutional color) this project previously avoided on purpose, kept only because the user explicitly confirmed it after being told (see PRODUCT.md Brand Commitments) — it is not license to add more NYU-branded material.
