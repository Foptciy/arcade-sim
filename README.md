# Arcade Sim

A tiny browser arcade simulator starter. Pilot the cabinet, collect credits, and keep the high score alive as the room speeds up.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server:

```powershell
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Controls

- `A` / `D` or `←` / `→` move the cabinet cursor.
- `Space` starts a round and launches a pulse.
- `P` pauses or resumes the simulation.

## Project layout

- `index.html` — game shell and accessible controls
- `styles.css` — neon cabinet styling and responsive layout
- `app.js` — canvas simulation, scoring, input, and HUD updates

## Next ideas

- Add multiple cabinet types with distinct scoring rules.
- Save high scores locally and add a leaderboard screen.
- Replace the generated shapes with sprite art and sound effects.

