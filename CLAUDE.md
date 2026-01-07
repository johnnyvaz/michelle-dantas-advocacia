# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js law firm website for Michelle Dantas Advocacia. The site uses a component-based architecture with content managed through markdown files and JavaScript data files.

## Development Commands

```bash
# Development server
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture & Key Patterns

### Content Management System
- **Blog posts**: Stored as markdown files in `data/posts/` with frontmatter metadata
- **Services**: Defined in JavaScript objects in `data/services.js`
- Content parsing handled by `utils/blogMarkdown.js` using gray-matter

### Component Structure
- **Page components**: Located in `app/` following Next.js 13+ app router structure
- **Reusable components**: Organized in `components/` by category (headers, footers, homes, otherPages)
- **Data files**: Centralized in `data/` directory for easy content updates

### Styling
- SCSS architecture in `public/assets/scss/` with modular approach
- Bootstrap integration for responsive layout
- Custom animations using WOW.js and CSS animations

### Key Dependencies
- Next.js 15+ with app router
- React Markdown for blog content rendering
- EmailJS for contact form handling
- Bootstrap for responsive grid
- WOW.js for scroll animations
- Swiper for carousels

### Content Update Workflow
The README.md contains detailed instructions for non-technical users to update:
- Blog posts via GitHub interface
- Service descriptions
- Images in the `public/assets/img/` directory

### Static Assets
- Images organized by category in `public/assets/img/`
- Fonts and CSS in `public/assets/css/`
- JavaScript libraries in `public/assets/js/`

### Next.js Configuration
- CORS headers configured for cross-origin requests
- Custom layout includes Chatwoot integration
- Bootstrap and WOW.js loaded dynamically

When working with this codebase:
1. Follow the existing component naming conventions
2. Update content through the appropriate data files rather than hardcoding
3. Maintain the SCSS modular structure
4. Test responsive behavior across device sizes
5. Ensure new images follow the established directory structure