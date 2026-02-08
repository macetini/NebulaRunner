# NebulaRunner - PixiJS Technical Demo

A responsive side-scrolling space shooter prototype built with **PixiJS v8** and **TypeScript**. Developed with a focus on clean code, modular architecture, and mobile-web performance optimization.

## 🚀 Architectural Principles

To ensure the codebase is scalable and maintainable for professional "Instant Games" environments (e.g., Softgames, Facebook Instant Games), I implemented the following patterns:

### 1. Inversion of Control (IoC) & Bootstrapping
The project utilizes a **`GameContext`** to manage the application's lifecycle. This bootstrap layer is responsible for "wiring" the game: initializing views, registering mediators, and setting up system dependencies. This keeps `main.ts` lightweight and focused purely on engine initialization.

### 2. Mediator Pattern (MVCS)
I implemented the **Mediator Pattern** to achieve a strict Separation of Concerns (SoC):
* **Views (e.g., Player, Background)**: "Dumb" components responsible only for rendering, state-based animations, and basic movement execution.
* **Mediators (e.g., PlayerMediator)**: The communication bridge. These handle input logic and coordinate between the View and the rest of the application, ensuring the Views remain portable and unit-testable.

### 3. Decoupled Communication (Signal Bus)
Systems communicate via a centralized **`SignalBus`** (Observer Pattern). 
* **Example**: The `PlayerMediator` dispatches a `PLAYER_FIRED` signal. The `ProjectileMediator` listens for this signal to spawn a bullet. 
* This ensures that the Player system has zero knowledge of the Combat system, allowing for independent development and testing.

### 4. Memory Management & Object Pooling
To maintain a consistent 60 FPS on mobile browsers, I implemented an **`Object Pool`** for projectiles. By recycling bullet instances instead of destroying and instantiating them, we effectively eliminate **Garbage Collection (GC) spikes**, preventing micro-stutters during gameplay.

### 5. Procedural Texture Generation
To minimize "Time to Interactive" (TTI) and bundle size, all core assets are generated programmatically using the PixiJS **Graphics API** and converted to GPU textures at runtime. This results in an ultra-lightweight initial load.

---

## 🛠️ Tech Stack
* **Engine**: PixiJS v8 (Latest)
* **Language**: TypeScript
* **Build Tool**: Vite
* **Design Patterns**: Mediator, Object Pooling, Signals/Observer, IoC.

## 🏃 Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run in development mode:**
    ```bash
    npm run dev
    ```

3.  **Build for production:**
    ```bash
    npm run build
    ```

## 🎮 Controls
* **W / Up Arrow**: Move Up
* **S / Down Arrow**: Move Down
* **Space**: Fire Projectiles (Auto-fire supported)
