# AirLens - Portfolio Template

A premium single-page portfolio template with a dark forest theme, featuring cinematic scroll animations, parallax effects, and a photography/creative-focused design.

## Features

- **Hero Section** - Full-screen parallax layered hero with large background text, cutout model image, and overlay text
- **Intro Grid** - Split-line mask reveal title with masonry image grid featuring per-image directional clip-path reveals, Ken Burns zoom, and varied-depth parallax
- **Services** - Two-column layout with animated heading and staggered service cards in a 2x2 grid
- **Why Choose Me** - Feature cards with clip-path reveal animations, animated stat counters, and a wide landscape image with center-expand reveal
- **Featured Projects** - Alternating layout project cards with clip-path reveals, parallax images, viewfinder overlays, and staggered text animations
- **Testimonials** - Auto-playing Swiper carousel with hover color-invert effect and gradient fade overlays
- **FAQ** - Radix UI accordion with staggered reveal animations and CTA button
- **Footer** - Massive SVG logo text, three-column layout with contact info, navigation, and social links

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS 3** - Utility-first styling
- **GSAP** + **ScrollTrigger** - Scroll-driven animations and parallax
- **Lenis** - Smooth scroll
- **Swiper** - Testimonials carousel
- **Radix UI** - Accessible accordion component
- **Lucide React** - Icon library

## Quick Start

```bash
npm install
npm run dev
```

## Configuration

All content is managed through `src/config.ts`. Each section has its own typed configuration object with empty placeholder values. Fill in the config objects to populate the site.

Each section has a null check - if the config is empty (no title and no array items), the section will not render.

### Config Objects

- `siteConfig` - Site title, description, language
- `heroConfig` - Background text, hero image, overlay text, brand name, navigation links
- `introGridConfig` - Title lines, description, portfolio images, accent text
- `featuredProjectsConfig` - Section titles, projects with images/descriptions
- `servicesConfig` - Section titles, service items with icons
- `whyChooseMeConfig` - Feature cards, stats, wide landscape image
- `testimonialsConfig` - Testimonial cards with quotes and author info
- `faqConfig` - FAQ items, CTA button
- `footerConfig` - Logo, contact info, navigation, social links, copyright

## Required Images

Place images in the `public/` directory:

- **Hero**: A cutout/transparent PNG for the hero model image (recommended: ~500px wide)
- **Portfolio**: 5 images for the masonry grid (various aspect ratios)
- **Featured Projects**: 1 image per project (4:3 aspect ratio recommended)
- **Why Choose Me**: 2 portrait images (3:4 aspect ratio), 1 wide landscape (21:9 or 3:1 aspect ratio)
- **Testimonials**: 1 avatar image per testimonial (square, small)

## Design

- **Color Theme**: Deep forest charcoal (#0d1310) with off-white (#f4f4f4) alternating sections
- **Typography**: Manrope (headings), Playfair Display (italic accents), DM Sans (body)
- **Animations**: GSAP ScrollTrigger with clip-path reveals, parallax, scale effects, and staggered entrances
- **Layout**: Alternating dark/light sections, max-width 7xl container

## Notes

- All animations use GSAP with ScrollTrigger for scroll-driven effects
- Lenis provides smooth scroll behavior connected to GSAP ticker
- The Swiper carousel auto-plays with configurable breakpoints
- Service and footer icons use a string-to-component map (iconName field maps to Lucide icon components: Camera, Diamond, Users, Sparkles, Instagram, Twitter, Linkedin, Mail)
