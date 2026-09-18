# Toddler Play App — Project Context

## 1. Project Overview

This project is an interactive play application designed primarily for young children approximately 1–5 years old.

The product is inspired by the simplicity of cause-and-effect experiences such as TinyFingers, but it must NOT be a clone.

The goal is to build our own visual identity, interaction system, game modes, assets and overall experience.

The core philosophy is:

> Play first. Learning happens underneath.

A child should be able to open a play experience and understand what to do without reading instructions.

Touching, dragging, clicking, moving the mouse or pressing keyboard keys should immediately produce interesting visual and/or audio feedback.

The experience should feel playful, responsive, colourful and safe.

---

# 2. Product Principles

## 2.1 Child-first interaction

The child-facing interface must be extremely simple.

Avoid:

* Navigation bars
* Hamburger menus
* Small buttons
* Text-heavy instructions
* Settings icons accessible to children
* Confirmation dialogs
* Complicated game rules

The primary interaction should be the play area itself.

## 2.2 Immediate feedback

Every meaningful interaction should create immediate feedback.

Examples:

* Tap → object appears
* Tap → sound plays
* Drag → particles follow finger
* Mouse move → particles follow cursor
* Key press → character/object appears
* Correct match → animation + positive sound
* Object touch → animation reacts

There should be minimal perceived delay between input and response.

## 2.3 Offline-first

Core play experiences must work without an internet connection.

Bundle core assets locally:

* Images
* SVGs
* Animations
* Sound effects
* Animal sounds
* Voice clips
* Music clips

Do not require an API call to perform normal gameplay.

## 2.4 Privacy-first

Avoid collecting child data.

V1 should NOT require:

* Child accounts
* Child names
* Birth dates
* Photos
* Email addresses
* Location
* Profiles
* Social features

Parent functionality should also remain minimal for V1.

Any future analytics must be carefully evaluated because the product is intended for young children.

---

# 3. Target Platforms

Primary target:

* Android phones
* Android tablets

Secondary targets:

* Web browsers
* Desktop
* PWA

Future:

* iPhone
* iPad

The architecture should remain compatible with future iOS deployment.

---

# 4. Technology

Preferred stack:

* Ionic
* Angular
* TypeScript
* Capacitor
* HTML
* CSS / SCSS
* Lucide icons where appropriate

Avoid unnecessary dependencies.

Animations should preferably use:

* CSS animations
* CSS transforms
* Web Animations API

Canvas may be introduced where it provides a clear performance advantage, particularly for particle-heavy experiences.

Do not introduce a backend unless a feature genuinely requires one.

---

# 5. V1 Scope

V1 should remain deliberately small.

Do NOT attempt to build a large library of children's games initially.

Build three polished experiences.

## Experience 1 — Free Play / Smash

This is the primary V1 experience.

The entire screen becomes an interactive canvas.

Supported inputs:

* pointerdown
* pointermove
* touch
* mouse
* keyboard

Interactions can generate:

* Shapes
* Animals
* Stars
* Bubbles
* Letters
* Numbers
* Simple characters
* Particles

Objects can:

* Appear
* Bounce
* Rotate
* Grow
* Shrink
* Float
* Pop
* Fade
* Make sounds

The objective is simple cause-and-effect play.

There is no score.

There is no failure condition.

There is no timer.

There is no "wrong" interaction.

---

# 6. Pointer Trail System

Mouse movement and finger dragging should generate visual feedback.

Create a reusable particle/trail engine.

Example:

pointermove

→ capture pointer X/Y

→ determine active theme

→ spawn appropriate particle

→ animate particle

→ fade particle

→ destroy particle

The engine must clean up particles automatically.

Do not allow DOM elements to accumulate indefinitely.

Particle spawning should be throttled to protect performance.

Possible particles:

* Stars
* Circles
* Hearts
* Bubbles
* Confetti
* Sparkles
* Paw prints
* Footprints

---

# 7. Theme System

Free Play should eventually support themes/worlds.

V1 can initially implement approximately three.

Example themes:

## Rainbow

Particles:

* Stars
* Shapes
* Sparkles

Objects:

* Colours
* Numbers
* Letters

Sounds:

* Pops
* Chimes
* Bells

## Animals

Particles:

* Paw prints

Objects:

* Cow
* Dog
* Cat
* Lion
* Elephant
* Sheep
* Duck
* Frog
* Horse
* Monkey

Selecting/tapping an animal can play its corresponding sound.

## Space

Particles:

* Stars
* Comets
* Sparkles

Objects:

* Planets
* Rockets
* Astronauts
* Moons
* UFOs

Sounds should remain gentle and child-friendly.

---

# 8. Experience 2 — Sounds

Create a very simple sound exploration mode.

Use large interactive objects rather than traditional buttons.

Possible categories:

### Animals

Examples:

* Cow
* Dog
* Cat
* Lion
* Elephant
* Sheep
* Duck
* Frog

Tap animal:

→ animate animal

→ play animal sound

Optionally:

→ speak animal name

Example:

Lion visual

→ roar

→ "Lion"

### Instruments

Future options:

* Drum
* Piano
* Xylophone
* Bell
* Tambourine

Do not create a complex music system in V1.

---

# 9. Experience 3 — Match

Create an extremely simple matching experience.

Possible V1 modes:

* Match colours
* Match shapes
* Match animals

Example:

Display:

RED BALLOON

and several large coloured targets.

Child drags balloon onto matching colour.

Correct:

* Positive animation
* Gentle success sound
* Celebration particles

Incorrect:

Do NOT use harsh failure sounds.

Instead:

* Object gently bounces back
* Allow another attempt

Avoid negative language such as:

* Wrong
* Failed
* Incorrect

---

# 10. Input Engine

Do not implement input logic independently inside every game.

Create a reusable interaction/input service.

It should normalize:

* pointerdown
* pointerup
* pointermove
* keyboard input

Prefer Pointer Events where possible so mouse, touch and stylus can share common logic.

Possible conceptual API:

InteractionService

* pointerDown$
* pointerMove$
* pointerUp$
* keyDown$

Games subscribe to the interactions they require.

This should prevent duplicated mouse/touch implementations.

---

# 11. Audio System

Create a centralized AudioService.

Responsibilities:

* Load audio assets
* Play effects
* Play animal sounds
* Play voice clips
* Control volume
* Mute/unmute
* Prevent uncontrolled overlapping audio
* Cache frequently used sounds

Example asset structure:

assets/
audio/
animals/
instruments/
effects/
voice/
music/

Example:

assets/audio/animals/cow.mp3
assets/audio/animals/lion.mp3
assets/audio/effects/pop.mp3
assets/audio/effects/sparkle.mp3
assets/audio/voice/lion.mp3

Audio files must have appropriate licensing for commercial use.

Maintain an asset/license manifest.

Example fields:

* filename
* source
* creator
* license
* source URL
* date acquired

Do not use audio downloaded randomly from search engines.

---

# 12. Asset System

Avoid hardcoding asset paths throughout components.

Create manifests/configuration.

Example concept:

Animal {
id
name
image
sound
voice?
}

Example:

{
id: "lion",
name: "Lion",
image: "assets/animals/lion.webp",
sound: "assets/audio/animals/lion.mp3",
voice: "assets/audio/voice/lion.mp3"
}

This allows new content to be added without rewriting game logic.

---

# 13. Parent Mode

Children should not be able to easily enter settings.

Do NOT place a conventional settings button in the play area.

Possible parent access:

Hold two screen corners simultaneously for approximately 3 seconds.

Alternative:

Press and hold a parent icon for several seconds and complete a simple adult gate.

Parent settings may include:

* Sound on/off
* Music on/off
* Voice on/off
* Volume
* Reduced motion
* Theme selection
* Difficulty
* Exit game

V1 does not require all settings.

---

# 14. Reduced Motion

Provide a reduced-motion option.

When enabled:

Reduce or disable:

* Large bouncing
* Screen shaking
* Rapid flashing
* Large particle bursts
* Continuous animation

Avoid aggressive flashing effects throughout the application.

---

# 15. Visual Design

The application should feel:

* Friendly
* Bright
* Soft
* Playful
* Modern

Avoid making the UI visually chaotic simply because the audience is children.

Use:

* Large objects
* Rounded shapes
* Strong visual separation
* Generous spacing
* Simple backgrounds

Animations should be playful without becoming overwhelming.

---

# 16. Performance

This application may run on inexpensive Android tablets.

Performance is therefore important.

Targets:

* Smooth interaction
* Minimal input latency
* Stable animation
* Controlled memory usage

Particle systems must:

* Limit active particles
* Destroy completed particles
* Throttle pointermove spawning
* Avoid unnecessary Angular change detection

Consider requestAnimationFrame where appropriate.

Do not prematurely introduce a game engine.

Phaser or another game framework should only be introduced if the complexity of later experiences clearly justifies it.

---

# 17. Accessibility and Child Safety

Avoid:

* Rapid flashing
* Extremely loud sounds
* Sudden volume changes
* Frightening imagery
* Dark patterns
* Ads inside play areas
* Accidental external links

External navigation should require parent interaction.

Touch targets must be significantly larger than standard mobile UI targets.

---

# 18. Monetisation

Do NOT implement monetisation in the initial prototype.

Possible future models can be evaluated after validating the experience.

Potential options:

* Paid application
* Free starter worlds + paid world packs
* One-time unlock
* Parent subscription

Avoid advertising as the default monetisation strategy, particularly because the audience consists of young children.

---

# 19. Backend

V1 should NOT require a backend.

Do not create:

* User tables
* Authentication
* JWT
* MySQL database
* API
* Cloud saves

unless requirements change.

Local settings can use:

* Capacitor Preferences

or equivalent local storage.

A backend can be evaluated later for legitimate parent-facing functionality.

---

# 20. Suggested Angular Structure

src/app/

core/
services/
audio.service.ts
interaction.service.ts
settings.service.ts

features/
home/
free-play/
sounds/
match/
parent/

shared/
components/
models/
animations/

content/
animals.ts
themes.ts
sounds.ts

assets/
images/
audio/
animations/

Keep game-specific logic within its feature.

Do not allow the core layer to become a dumping ground.

---

# 21. Initial Development Milestones

## Milestone 1 — Playground Prototype

Build only:

* Fullscreen play canvas
* Pointer detection
* Keyboard detection
* Particle spawning
* Particle cleanup
* Basic audio playback

No menus.

No matching game.

No parent dashboard.

The goal is to prove that interaction feels excellent.

## Milestone 2 — Free Play

Add:

* Random objects
* Basic themes
* Object animations
* Sound effects
* Touch support
* Desktop support

## Milestone 3 — Navigation

Create child-friendly home screen.

Provide access to:

* Free Play
* Sounds
* Match

## Milestone 4 — Sounds

Implement first animal sound board.

Start with approximately 8–10 animals.

## Milestone 5 — Match

Implement one matching mechanic.

Start with colour matching.

Do not implement multiple matching games until the core mechanic has been tested.

## Milestone 6 — Parent Mode

Add:

* Hidden parent access
* Sound control
* Reduced motion
* Theme controls

## Milestone 7 — Device Testing

Test on:

* Desktop browser
* Android phone
* Android tablet/emulator

Pay particular attention to:

* Touch latency
* Audio latency
* Animation performance
* Accidental navigation
* Orientation changes

---

# 22. Development Rule

Do not expand scope simply because a feature is technically easy to add.

For every proposed feature ask:

1. Does this improve the child's play experience?
2. Can a young child understand it without instructions?
3. Does V1 actually need it?
4. Does it introduce privacy, safety or performance complexity?

If not, leave it out.

The first objective is not to build a large application.

The first objective is to build one interaction that a young child wants to repeat.

---

# 23. Current Working Name

Use:

Toddler Play App

as the internal working name until the final product name has been selected.

Do not tightly couple code, package IDs, asset paths or configuration to the working product name.
