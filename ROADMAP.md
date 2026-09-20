# NebulaRunner 3-Week Release Roadmap

Goal: ship a polished browser-game MVP for CrazyGames and Poki in 3 weeks.

## Current Status

- [x] PixiJS v8 + TypeScript + Vite foundation
- [x] Player movement and firing
- [x] Enemy movement strategies
- [x] Collision and projectile systems
- [x] Buff system
- [x] Object pools
- [x] Procedural GLSL background
- [x] Production build passes
- [ ] Platform submission build

## Week 1: Core Game

- [ ] Freeze feature scope
- [ ] Fix current gameplay bugs
- [ ] Confirm ready, playing, game-over, restart loop
- [ ] Tune collision and player damage feedback
- [ ] Finalize 3 enemy types
- [ ] Finalize difficulty/spawn curve
- [ ] Finalize 3 buffs: rapid fire, shield, spread shot
- [ ] Show buff icons and timers
- [ ] Add score progression and persistent high score
- [ ] Test desktop and mobile controls
- [ ] Add pause/resume and focus-loss handling

Checkpoint: playable loop feels good within first 30 seconds.

## Week 2: Retention and Polish

- [ ] Add 3-5 minute run progression
- [ ] Add score milestones or elite waves
- [ ] Add one mini-boss or elite encounter
- [ ] Add run objectives
- [ ] Add shoot, hit, explosion, buff, death, and music audio
- [ ] Polish particles, flashes, screen shake, and feedback
- [ ] Add concise first-run controls/tutorial
- [ ] Playtest with 3-5 people
- [ ] Fix only high-impact playtest issues
- [ ] Check low-end performance and shader cost

Checkpoint: player understands game and chooses to restart.

## Week 3: Release

- [ ] Add rewarded revive or score multiplier
- [ ] Add platform SDK adapter with local fallback
- [ ] Add analytics events
- [ ] Prepare thumbnail, icon, screenshots, and description
- [ ] Add loading and error states
- [ ] Test Chrome desktop
- [ ] Test Android Chrome
- [ ] Test iPhone Safari
- [ ] Test resize, reload, focus loss, audio unlock, and pause
- [ ] Create production build
- [ ] Submit CrazyGames
- [ ] Prepare and submit Poki build
- [ ] Freeze release candidate
- [ ] Verify analytics and ads after release

## Track After Launch

- Session length
- First-run completion
- Restart rate
- Day-1 return rate
- Mobile versus desktop retention
- Rewarded-ad opt-in rate
- Revenue per 1,000 sessions
- Runtime errors and crashes

## Out of Scope

- Multiplayer
- Accounts or backend
- Story campaign
- Large shop or meta-progression system
- Procedural level editor
- More than one boss
- WebGPU shader version
- Large asset pipeline

## Decision Rules

- Test playable loop by end of Week 1.
- Do not add features that do not improve retention, clarity, or monetization.
- Fix bugs and player friction before adding content.
- Keep first run fast; avoid forced ads before meaningful play.
- Treat first 3 games as measured market experiments.
