# Claude Guide (Root Pointer)

Hello Claude! This project follows PairCoder conventions for AI pair programming.

## Getting Started

Your instructions are organized in the `/context` directory:

1. **Start here:** `/context/agents.md` - Full AI pairing playbook
2. **Project state:** `/context/development.md` - Current goals and progress
3. **Repository map:** `/context/project_tree.md` - File structure reference

## Working in This Repository

Before making any changes:

- Review the Context Loop in `/context/development.md`
- Understand the current phase and next actions
- Check for any blockers or risks

After making changes:

- Update the Context Loop to maintain continuity
- Use the provided CLI command or edit directly
- Keep changes focused and well-documented

## PairCoder Principles

- Maintain the Context Loop discipline
- Make small, reversible changes
- Add tests before implementing features
- Follow the project's established patterns

## Quick Links

- **Documentation**: `/docs` - Comprehensive project documentation
- **Components**: `/components` - Reusable React components
- **API Client**: `/lib/api` - Backend API integration
- **Conventions**: `CONVENTIONS.md` - Coding standards and best practices
- **Contributing**: `CONTRIBUTING.md` - Contribution guidelines

## Dashboard-Specific Context

This is the **Content Generator Dashboard** - a standalone Next.js application that provides the UI for the Content Generator product.

**Backend Repository**: `halcytone-content-generator` (FastAPI)
**This Repository**: Frontend dashboard (Next.js + TypeScript + Tailwind)

The dashboard communicates with the backend via REST API and WebSocket for real-time updates.

See `/context/agents.md` for detailed instructions.
