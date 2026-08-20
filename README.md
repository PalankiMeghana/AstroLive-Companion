# AstroCompanion

> **AstroLive answers your question. AstroCompanion stays until you have the answer — and gives you something worth sharing on the way there.**

A no-build-step prototype for the AstroLive product challenge.

## Product thesis

AstroLive is primarily a reactive consultation marketplace. AstroCompanion adds a persistent layer around that marketplace:

**consultation → tracked 7-day journey → daily reflection → shareable insight → friend discovery → Smart Match → deeper paid journey**

The prototype deliberately demonstrates four connected levers rather than four unrelated features:

- **Habit:** a 7-day journey with daily check-ins and progress.
- **Structural virality:** a shareable insight generates a friend link that opens directly into a product experience.
- **USP:** Smart Match classifies a free-text concern and explains the specialist recommendation.
- **Revenue:** Cosmic+ monetizes depth and continuity rather than only per-minute calls.

## Files

| File | Purpose |
|---|---|
| `index.html` | Single-page product experience |
| `styles.css` | Visual system and responsive UI |
| `data.js` | Illustrative journeys, specialists and pricing |
| `matching.js` | Real keyword-weighted Smart Match classifier |
| `app.js` | State, local persistence, referral loop, check-ins and routing |

## Run locally

No build tools are required.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Opening `index.html` directly also works for most interactions, but a local HTTP server is recommended for testing referral URLs.

## Deploy

Push the folder to a public GitHub repository and enable **Settings → Pages → Deploy from branch → main / root**.

## What is real vs illustrative?

**Working in the prototype**
- 7-day journey progression and streak persistence via `localStorage`.
- Daily check-in state.
- Deterministic personalized journey content based on selected focus.
- Share message generation.
- Shareable referral URL that opens the Friend Landing experience.
- Smart Match scoring, confidence and explainable keyword signals.
- Responsive navigation and membership flow.

**Illustrative**
- Astrology interpretations.
- Astrologer profiles and ratings.
- Pricing and checkout.
- No real payment, consultation, astrology calculation or backend is connected.

## AI disclosure

AI assistance was used during development for product ideation, UX structure, code generation, debugging and copy refinement. The team reviewed and adapted the final implementation.

If multiple AI tools were used, list each one explicitly in the final report and describe what it contributed.

## External-source disclosure

The final report should cite every external source used for the AstroLive teardown, market/competitor claims, product benchmarks, and any technical or business assumptions.

The prototype itself uses no external API.

## Suggested demo path

1. Complete onboarding with a focus such as Career.
2. Show the 7-day journey and check-in.
3. Create a share card.
4. Generate a friend link and paste/open it in a new tab.
5. Show how the friend lands directly on the acquisition experience.
6. Go to Smart Match and use a free-text career/relationship concern.
7. Show the explainable specialist recommendation.
8. Finish on Cosmic+ to show the new revenue layer.

## Important

All astrology content, people, ratings and pricing shown in this prototype are illustrative mock data and should not be presented as real AstroLive claims.


## AI Journey Guide

The prototype includes an optional AI Journey Guide. It is intentionally not a generic chatbot:
the backend receives the user's topic, journey day, concern and latest check-in, then returns
an adaptive reflection and one follow-up question.

The frontend also has a deterministic fallback, so the prototype remains usable when the
backend or API is unavailable.

### Local AI backend

From the project root:

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The frontend calls `http://127.0.0.1:5000/api/journey`.

For live AI, set `OPENAI_API_KEY` in the backend environment. **Never put the key in the
frontend or public GitHub repository.** If no key is present, the endpoint uses its
deterministic adaptive fallback.

### Production architecture

For a deployed version, host the Flask API behind HTTPS and replace the local URL with the
public API endpoint. The API key remains server-side. The same frontend contract can also be
implemented with a serverless function.
