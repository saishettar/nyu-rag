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
  accent: "#2e4dd4"
  accent-hover: "#263fb3"
  accent-soft: "#e8ecfd"
  accent-ink: "#22348f"
  danger: "#b23b32"
  danger-soft: "#fbe9e6"
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

The system's one idea: a citation is a pointer, not a footnote. Everywhere the product cites a course, that citation is clickable and lands you on the live record it's drawn from — the catalog panel scrolls to it and holds it lit. Everything else stays out of the way of that idea: a warm, near-monochrome canvas; one committed cobalt accent spent only on things you can act on; IBM Plex Sans for reading, IBM Plex Mono wherever a course code or a number needs to be counted rather than read.

This is an Operate surface, not a Persuade one — the visual language plays the modern AI-chat convention straight (sidebar history, conversational thread, bottom-pinned composer), deliberately choosing familiarity and craft over novelty. It was built this way after being offered a bespoke visual world and declining it in favor of the category's own vocabulary, executed at the finish level of Claude and ChatGPT rather than a generic clone of either. Confirmed anti-reference: no NYU institutional colors or marks (violet, torch); this is an independent product identity that happens to serve NYU students.

**Key Characteristics:**
- One accent, spent only on interactive/citable elements — never a background field.
- Warm-neutral canvas, not stark white and not AI-cliché cream paper.
- Monospace reserved for data (course codes, credits) — never a costume for "technical."
- Flat at rest; soft ambient shadow only on floating, interactive surfaces (the composer).
- Full light/dark support driven by the visitor's system preference, not a fixed choice.

## Colors

A warm, restrained neutral field carries the interface; one committed cobalt is the system's only color statement, and it is spent exclusively on things the visitor can click or act on.

### Primary
- **Committed Cobalt** (`#2e4dd4` light / `#7c93ff` dark): the system's one accent. New-chat button, active sidebar item, citation chips, links, the composer's send button, and focus rings — nothing else. It never fills a background region.

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
**The One Accent Rule.** Cobalt is reserved for elements the visitor can act on — a button, a link, a citation, an active state. If an element isn't clickable, it doesn't get the accent color.

**The Theme-Follows-System Rule.** Light and dark are both fully authored token sets, switched by `prefers-color-scheme`, never by category default. Dark is not an afterthought: `accent`, `accent-ink`, and `accent-soft` are independently tuned per theme, not a blind opacity flip of the light values.

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

Three-region shell: a fixed 288px sidebar (conversation history), a fluid center column capped at `max-w-3xl` (chat thread + composer), and a fixed 320px catalog panel (`xl` breakpoint and above). Below `xl`, the catalog panel becomes a full-width slide-over from the right; below `lg`, the sidebar becomes a slide-over from the left, both with a dimmed backdrop and a close control. The chat column is always what remains full-width on narrow viewports — it is the surface's primary task and never collapses.

Spacing rhythm runs on a tight base-2 (Tailwind default) scale: `gap-1.5`–`gap-2` inside icon+label clusters, `px-3`–`px-4`/`py-2`–`py-3` for controls and panel headers, `gap-5` (20px) between chat messages, `py-6` for the thread's outer padding. More space separates message groups than sits inside one.

## Elevation & Depth

Flat by default. Catalog rows, sidebar items, and panel chrome carry no shadow at rest — depth comes from the three background tones (canvas / sidebar / surface) and 1px hairline borders, not from elevation. Shadow is reserved for surfaces that visually float over the thread: the composer and, more subtly, resting cards against the canvas.

### Shadow Vocabulary
- **`panel`** (`0 1px 3px rgb(0 0 0 / 0.04)`): the ambient lift under catalog rows and other resting surface cards — barely there, a hint of separation from canvas.
- **`composer`** (`0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.18)`): the floating chat input, the one element in the system that visually sits above the page.

### Named Rules
**The Ambient-Not-Structural Rule.** Shadow never stands in for hierarchy that color and spacing should carry. It marks exactly one thing: "this floats above the surface beneath it."

## Shapes

Two radius steps carry the whole system: **8px** (`rounded-lg`) for controls, inputs, and catalog rows; **16px** (`rounded-2xl`) for the one element that visually floats above the thread with rectangular geometry — the user's message bubble, softened further with a `rounded-br-md` (6px) tail corner toward the sender. Interactive pills — citation chips, the send button, example-question chips, and the chat composer itself — use a **full** radius: the composer deliberately matches the rounding of the example-question chips it sits below, so the one thing the visitor types into and the prompts that suggest what to type read as the same family of control. No nested-card chrome anywhere: a catalog row or sidebar item is a single flat surface with one border, never a card inside a card.

## Components

### Buttons
- **Shape:** full radius (`rounded-full`) for the composer's send button and example-question chips; 8px (`rounded-lg`) for "New chat" and other rectangular actions.
- **Primary (send):** cobalt fill, white icon, 32px circle; disabled state drops to `faint/50` fill rather than a lower-opacity cobalt.
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

## Do's and Don'ts

### Do:
- **Do** spend cobalt only on things the visitor can act on (the One Accent Rule).
- **Do** set course codes, credit counts, and citations in IBM Plex Mono; everything else in IBM Plex Sans.
- **Do** keep catalog rows and sidebar items flat at rest — reach for background-tone and border changes before reaching for shadow.
- **Do** route every citation through the same click → highlight → scroll behavior; it's the one interaction the whole identity is built on.
- **Do** author both light and dark values together for any new token; this system has no "dark mode as an afterthought."

### Don't:
- **Don't** introduce a second accent color or a gradient; the One Accent Rule covers the whole system, not just the components documented above.
- **Don't** reach for cream/parchment tones or a display serif — those were the rolled-and-declined direction (Academic Typesetting), not this system.
- **Don't** add card-in-card nesting (a bordered row inside a bordered panel inside a bordered column). One border per surface.
- **Don't** use NYU's institutional violet or torch mark anywhere in this system; the identity is deliberately independent (see PRODUCT.md Brand Commitments).
