# College Resource Hub Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from productivity platforms like Notion and Linear, combined with educational platforms like Khan Academy for a clean, academic-focused interface that prioritizes usability and content discovery.

## Core Design Elements

### A. Color Palette
**Primary Greys (Dark Mode)**:
- Background: 220 8% 8% (deep charcoal)
- Surface: 220 8% 12% (elevated surfaces)
- Border: 220 8% 18% (subtle divisions)
- Text Primary: 220 8% 95% (high contrast)
- Text Secondary: 220 8% 70% (muted content)

**Primary Greys (Light Mode)**:
- Background: 220 8% 98% (warm white)
- Surface: 220 8% 100% (pure white)
- Border: 220 8% 88% (soft divisions)
- Text Primary: 220 8% 15% (dark charcoal)
- Text Secondary: 220 8% 45% (medium grey)

**Accent Colors**:
- Primary: 210 85% 55% (professional blue for CTAs)
- Success: 142 76% 45% (green for ratings/uploads)
- Warning: 38 92% 50% (amber for notifications)
- Error: 0 84% 60% (red for validation)

### B. Typography
- **Primary Font**: Inter (Google Fonts) - clean, readable for UI text
- **Secondary Font**: JetBrains Mono (Google Fonts) - for file names and technical content
- **Hierarchy**: text-xs to text-3xl, with font-medium for headings, font-normal for body

### C. Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, m-2 (component internals)
- Standard spacing: p-4, m-4, gap-4 (card padding, basic margins)
- Section spacing: p-8, m-8 (page sections, major components)
- Layout spacing: p-12, p-16 (page containers, hero sections)

### D. Component Library

**Navigation**:
- Clean sidebar with grey-on-grey icons
- Breadcrumb navigation for deep category browsing
- Search bar with subtle grey background and blue focus states

**Cards & Content**:
- Resource cards with soft grey backgrounds and subtle shadows
- Rating stars in gold/amber for warmth against grey palette
- File type icons using Heroicons library
- Upload areas with dashed grey borders

**Forms & Inputs**:
- Minimal input styling with grey borders and blue focus rings
- Dropdown menus with grey backgrounds and subtle shadows
- Tag inputs with grey pill-style tags

**Data Display**:
- Clean tables with alternating grey row backgrounds
- Statistics cards with large numbers and descriptive labels
- Progress indicators for upload status

**Interactive Elements**:
- Primary buttons: blue background with white text
- Secondary buttons: outline style with grey borders
- Icon buttons: subtle grey hover states

### E. Animations
**Minimal Motion**: 
- Subtle hover transitions (150ms duration)
- Page transitions with fade effects
- Loading states with grey skeleton screens
- No distracting animations during core workflows

## Key Design Principles

1. **Academic Professionalism**: Clean, distraction-free interface that feels serious and trustworthy
2. **Content-First**: Typography and layout prioritize readability and information hierarchy
3. **Subtle Sophistication**: Premium feel through careful use of spacing, typography, and restrained color
4. **Functional Beauty**: Every design element serves a clear purpose in the user's academic workflow
5. **Accessible Contrast**: All grey combinations meet WCAG AA standards for text readability

## Images
No large hero images required. Focus on:
- Small avatar placeholders for user profiles
- File type icons and thumbnails for uploaded resources
- Empty state illustrations in light grey tones
- Simple iconography throughout the interface using Heroicons

This creates a premium, academic-focused platform that feels both professional and approachable for student users.