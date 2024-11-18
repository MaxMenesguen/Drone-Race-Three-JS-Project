# Drone Race Three.js Project

## Overview
This project is a **3D Drone Racing Game** built using **Three.js**, a popular JavaScript library for 3D graphics in the browser. In this game, players control a drone to navigate through targets placed across a mountainous landscape, aiming to complete the course as quickly as possible. The project features an engaging user interface, interactive drone controls, collision detection, and visual overlays to enhance the player's experience.

## Features
- **3D Drone Model**: A realistic drone model controlled in a 3D environment.
- **Target Checkpoints**: Red spheres are placed as targets that the drone must pass through.
- **Interactive Controls**: Navigate using keyboard and mouse:
  - **ZQSD**: Move forward, backward, left, and right.
  - **Space**: Ascend.
  - **Left Shift**: Descend.
  - **Mouse**: Change the drone's viewing direction.
- **HUD and Overlays**:
  - Real-time **HUD** shows elapsed time, targets reached, and best run time.
  - **Interactive overlays** for starting, completing, and retrying the race.
- **Collision Detection**: Track targets that have been reached and ensure players can't repeatedly use the same target to cheat.
- **Responsive Camera**: A third-person camera view that follows the drone, adjusting based on the drone's orientation.

## Installation and Running the Project
### Prerequisites
- **Node.js** and **npm** installed on your system.
- **Live Server** or any simple HTTP server to serve the project.

### Steps to Run
1. **Clone the Repository**:
   ```bash
   git clone <https://github.com/MaxMenesguen/Drone-Race-Three-JS-Project>
   cd Drone-Race-Three-JS-Project
   ```

2. **Install Dependencies** :
   ```bash
   npm install
   ```

3. **Start the Local Server**:
   - If you have **live-server** installed globally:
     ```bash
     live-server
     ```
   - Alternatively, use **npx**:
     ```bash
     npx live-server
     ```

4. **Open the Game**:
   The server will automatically open the game in your default browser at `http://127.0.0.1:8080`. Alternatively, visit that address manually.

## Game Instructions
- **Objective**: Fly the drone through all the target checkpoints as quickly as possible.
- **Controls**:
  - **ZQSD**: Move the drone in different directions.
  - **Space**: Ascend the drone.
  - **Left Shift**: Descend the drone.
  - **Mouse Movement**: Change the drone's direction.
- **HUD Information**:
  - **Time Since Start**: Tracks how long you have been flying.
  - **Targets Reached**: Displays the number of targets reached out of the total targets.
  - **Best Time**: Your best run time (shows "NAN" if no finish time has been set).

## Project Structure
- **`index.html`**: The main HTML file that includes the canvas and overlays.
- **`style.css`**: CSS file for styling the HUD, overlays, and other elements.
- **`script.js`**: JavaScript file that includes all logic for rendering, drone controls, HUD updates, collision detection, and animations.
- **Assets**: Includes models for the drone (`drone.glb`) and environment (`mountain.glb`).

## How It Works
- The **drone** moves based on keyboard inputs and mouse movement.
- **Camera** follows the drone from behind in a third-person perspective, rotating and moving as the drone changes direction.
- **Targets** are red spheres positioned across the environment, and the player must navigate the drone through each target.
- **Collision detection** is used to track targets and update the **HUD** in real-time.
- **Interactive Overlays** guide the player at different stages of the game (start, crash, finish).

## Known Issues & Improvements
- **Collision with Mountain**: The current collision detection for the mountainous terrain can be resource-intensive. Future improvements may include optimized collision detection or simplified environment meshes.
- **Camera Improvements**: The third-person camera may be refigit ned for smoother transitions when the drone performs quick maneuvers.
- **More Levels**: Currently, the game has one level. Future iterations could add more levels and different difficulty settings.

## License
This project is open source and free to use. Please credit the original authors if using this code in your projects.


Happy Flying!