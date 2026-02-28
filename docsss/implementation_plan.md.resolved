# Aceternity UI Enhancement Plan — Dark Theme Polish

Enhance the existing dark UI with Aceternity UI free components, framer-motion animations, and micro-interactions. **No layout or functionality changes** — just visual polish.

---

## Installation Required

Run this **once** before implementation:

```bash
npx shadcn@latest add @aceternity/card-spotlight @aceternity/text-generate-effect @aceternity/meteors @aceternity/sparkles @aceternity/spotlight @aceternity/file-upload @aceternity/multi-step-loader @aceternity/card-hover-effect @aceternity/moving-border @aceternity/floating-navbar @aceternity/glowing-effect
```

> [!IMPORTANT]
> This uses the `shadcn` CLI to install Aceternity components directly into `src/components/ui/`. Each component is **free** and copy-paste. If any command fails due to disk space, we can install them one at a time.

---

## Component Mapping — What Changes Where

### 1. Login Page (`login/page.tsx`)

| Current Element | Aceternity Component | What Changes |
|---|---|---|
| Static "Welcome Back" title | **Text Generate Effect** | Words fade in one-by-one on page load |
| Plain `<button>` Sign In | **Moving Border** | Animated gradient border orbits the button |
| Static dark card | **Spotlight** | A subtle spotlight sweeps across the card on load |
| Plain `<input>` fields | Framer `whileFocus` | Inputs glow purple on focus with scale micro-animation |
| BackgroundBeams (already used) | Keep as-is | No change |

### 2. Signup Page (`signup/page.tsx`)

Same enhancements as Login:
- **Text Generate Effect** on "Create Account" heading
- **Moving Border** on "Create Account" button
- **Spotlight** sweep on the card
- Framer `whileFocus` glow on inputs

---

### 3. Dashboard (`dashboard/page.tsx`)

| Current Element | Aceternity Component | What Changes |
|---|---|---|
| Static navbar | **Floating Navbar** | Navbar hides on scroll down, reveals on scroll up |
| "Your Projects" title | **Text Generate Effect** | Words fade in on page load |
| Project cards (plain hover) | **Card Spotlight** | Mouse-following radial spotlight on card hover |
| "New Project" button | **Moving Border** | Animated gradient border rotation |
| Empty state icon area | **Sparkles** | Sparkle particles around the empty state icon |
| Create button in form | Framer `whileTap` / `whileHover` | Scale + glow micro-animations |

### 4. Project Workspace (`project/[id]/page.tsx`)

| Current Element | Aceternity Component | What Changes |
|---|---|---|
| Coverage stat cards | **Meteors** | Subtle meteor streaks in the background of each stat card |
| Upload drop zones | **File Upload** (Aceternity) | Animated drag-and-drop with grid background + micro-interactions |
| "Generate All" button | **Moving Border** | Animated gradient border + framer `whileTap` scale |
| Q&A answer cards | **Card Spotlight** | Mouse-following spotlight on hover |
| Generating answers | **Multi-Step Loader** | Full-screen overlay showing step-by-step progress: "Parsing questions…", "Searching documents…", "Generating answers…", "Finalizing…" |
| Evidence panel expand | Framer `layout` | Smooth height animation with spring physics |
| Confidence score badges | **Glowing Effect** | Subtle glow border matching confidence color (green/yellow/red) |

### 5. History Page (`project/[id]/history/page.tsx`)

| Current Element | Aceternity Component | What Changes |
|---|---|---|
| "Version History" title | **Text Generate Effect** | Words fade in on load |
| Version list items | **Hover Effect** (Card Hover) | Sliding highlight that follows the hovered item |
| Version detail card | **Card Spotlight** | Radial gradient follows mouse on the detail panel |
| Compare mode toggle | **Moving Border** | Animated border when compare mode is active |

---

## Custom Framer Animations (No Extra Components)

These use `framer-motion` (already installed) for polish:

| Animation | Where | Effect |
|---|---|---|
| `staggerChildren` | Dashboard cards, Q&A list | Cards appear one-by-one with 50ms delay |
| `whileHover={{ scale: 1.02, y: -2 }}` | All interactive cards | Subtle lift on hover |
| `whileTap={{ scale: 0.98 }}` | All buttons | Press-down feedback |
| Spring-based `layout` | Evidence panel, new project form | Smooth height/position transitions |
| `initial={{ opacity: 0, y: 20 }}` | Page sections on mount | Fade-up entrance |
| Pulse animation | "New Project" button icon | Subtle pulse to draw attention |
| Gradient shimmer | Loading skeleton states | Animated gradient sweep while loading |

---

## CSS Enhancements (globals.css)

Add to `globals.css` for Aceternity component support:

```css
@theme inline {
  --animate-meteor-effect: meteor 5s linear infinite;
  --animate-spotlight: spotlight 2s ease 0.75s 1 forwards;
}

@keyframes meteor {
  0% { transform: rotate(215deg) translateX(0); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
}

@keyframes spotlight {
  0% { opacity: 0; transform: translate(-72%, -62%) scale(0.5); }
  100% { opacity: 1; transform: translate(-50%, -40%) scale(1); }
}
```

---

## Implementation Order

| Step | Files | Components Used |
|---|---|---|
| **1. Install** | Terminal | `npx shadcn@latest add ...` (all at once) |
| **2. CSS Tokens** | `globals.css` | Meteor + Spotlight keyframes |
| **3. Login/Signup** | `login/page.tsx`, `signup/page.tsx` | Text Generate, Moving Border, Spotlight |
| **4. Dashboard** | `dashboard/page.tsx` | Card Spotlight, Sparkles, Floating Navbar, Text Generate, Moving Border |
| **5. Project Workspace** | `project/[id]/page.tsx` | File Upload, Multi-Step Loader, Meteors, Card Spotlight, Glowing Effect, Moving Border |
| **6. History** | `history/page.tsx` | Hover Effect, Card Spotlight, Text Generate, Moving Border |
| **7. Verify** | Build + Visual | `npm run build`, browser testing |

---

## Verification Plan

### Build Test
```bash
npm run build
```
Must pass with 0 errors, all 14 routes.

### Visual Checklist
- [ ] Login: Text fades in, spotlight sweeps, button border animates
- [ ] Dashboard: Cards have spotlight hover, navbar floats, sparkles on empty state
- [ ] Project: File upload has drag-drop animation, multi-step loader during generation
- [ ] History: Hover effect slides between items, compare button has moving border

> [!NOTE]
> All changes are **purely visual**. No functionality, routes, or data flows are modified. If any Aceternity component has dependency issues, we skip it and use pure framer-motion instead.
