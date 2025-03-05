
import './style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import App from './Components/App'

// Main application entry point
const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Canvas
      camera={{ position: [ 0,0,10 ] }}
    >
      <App />
    </Canvas>
  </React.StrictMode>
)