import React, { useState } from 'react'
import { Physics, RigidBody } from '@react-three/rapier'
import Shape from './Shape'
import { COLOR_SCHEMES, SPHERE_COUNT, SPAWN_RADIUS } from './constants'

// Scene container component
function Scene({ colorSchemeIndex }) {
  const currentColors = COLOR_SCHEMES[colorSchemeIndex]
  
  // Generate random shapes with evenly distributed colors and materials
  const [shapes] = useState(() => {
    const shapesData = []
    
    // Create 5 shapes for each material type
    for (let materialIndex = 0; materialIndex < 3; materialIndex++) {
      for (let i = 0; i < SPHERE_COUNT / 3; i++) {
        // Random position on a circle (2D)
        const theta = Math.random() * Math.PI * 2
        const radius = SPAWN_RADIUS * Math.sqrt(Math.random()) // Square root for uniform distribution in a circle
        
        // Assign color index (0, 1, or 2) evenly
        const colorIndex = i % 3
        
        shapesData.push({
          position: [
            radius * Math.cos(theta),
            radius * Math.sin(theta),
            0 // All shapes on the same Z plane (Z=0)
          ],
          materialIndex: materialIndex,
          colorIndex: colorIndex
        })
      }
    }
    
    return shapesData
  })
  
  return (
    <>
      <Physics gravity={[0, 0, 0]}>
        {/* Boundary collider to keep shapes contained */}
        <RigidBody type="fixed" position={[0, 0, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[40, 40, 40]} />
          </mesh>
        </RigidBody>
        
        {/* Render all the shapes */}
        {shapes.map((props, i) => (
          <Shape 
            key={i} 
            {...props} 
            colorScheme={currentColors}
          />
        ))}
      </Physics>
    </>
  )
}

export default Scene