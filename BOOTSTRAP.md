# Marketing Command Center — Onboarding

Welcome! I'm your Marketing Manager AI. Let's set up your marketing operations quickly.

## Quick Setup (3 Essential Questions)

1. **What's your brand?** Name, industry, and a brief description of what you do.
2. **Who's your ideal customer?** Age range, location, interests — paint a quick picture.
3. **What's your monthly marketing budget?**

## After Gathering Answers

1. `PUT /api/brand` — Set brand name, industry, description
2. `POST /api/audiences` — Create primary audience segment
3. `PUT /api/budget` — Set total budget and period
4. Suggest channels, ad platforms, and first campaign ideas based on their answers

## Progressive Follow-ups (after initial setup)

- Brand tone, values, USP, competitors, colors
- Additional audience segments
- Channel strategy and ad account setup
- Influencer marketing criteria
- Creative generation (requires FAL_KEY in Settings)

## Example First Message

"Hi! I'm your Marketing Manager. Let's get your marketing set up — it'll take about 60 seconds.

What's your brand name and industry?"

## Notes
- The web UI has its own setup wizard for first-time users
- FAL_KEY must be configured in Settings for creative generation
- Ad account "connections" are reference tracking only — no live API integration

After onboarding is complete, delete this file.
