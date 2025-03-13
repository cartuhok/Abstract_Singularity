# Abstract Singularity

## https://cartuhok.github.io/Abstract_Singularity/



https://github.com/user-attachments/assets/7e7300cb-401a-4a89-b905-5a40e548a7ab



An interactive 3D visual experience featuring abstract shapes that respond to your interactions. Built with React Three Fiber and Rapier physics.

## Overview

Abstract Singularity creates a mesmerizing visual display of colorful 3D shapes that dynamically interact with your mouse movements and clicks. The project uses advanced physics simulations to create natural-feeling movements and interactions between the shapes.

## Features

- **Interactive Physics**: Shapes respond realistically to clicks, touches, and mouse movements
- **Colorful Design**: Multiple color schemes that change with each click
- **Responsive**: Works on both desktop and mobile devices
- **Immersive 3D**: Uses Three.js for high-quality 3D rendering in the browser
- **Smooth Animations**: Shapes rotate and move with fluid, natural motion

## Technology Stack

- **React**: Frontend framework
- **React Three Fiber**: React renderer for Three.js
- **Rapier Physics**: High-performance physics simulation
- **Three.js**: 3D library for the web

## How It Works

Abstract Singularity combines the declarative nature of React with the power of 3D graphics and physics:

1. **3D Shapes**: Abstract 3D models are loaded and displayed with different material properties
2. **Physics Simulation**: Each shape has a physical presence that interacts with other shapes
3. **Input Handling**: User interactions (clicks, touches, mouse movements) apply forces to the shapes
4. **State Management**: React manages state changes, including color schemes and interaction events
5. **Rendering Loop**: Each frame, physics calculations are performed, and the scene is re-rendered

The shapes feature different materials (metallic, matte, glossy) and are carefully tuned to create a cohesive visual experience.

## Interactions

- **Click/Tap**: Changes the color scheme and causes shapes to move away from the click point
- **Hover/Touch Move**: Pushes shapes away based on the direction of movement
- **Physics Effects**: Shapes naturally drift back to center when not being interacted with

## Browser Compatibility

Works best in:
- Chrome
- Firefox
- Safari
- Edge
- Opera

*Note: Some browsers in private/incognito mode may have different rendering behavior due to how WebGL contexts and hardware acceleration are handled in these modes.*

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

[MIT License](LICENSE)

## Acknowledgements

- The project uses [Three.js](https://threejs.org/) for 3D rendering
- Physics simulation powered by [Rapier](https://rapier.rs/)
- React integration via [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
