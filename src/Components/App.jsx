import React, { useState, useEffect } from 'react'
import * as THREE from 'three'
import Scene from './Scene'
import RotationContext from './RotationContext'
import { BG_COLOR_SCHEMES, COLOR_SCHEMES } from './constants'

function App() {

  const [colorSchemeIndex, setColorSchemeIndex] = useState(0)
  const currentBgColor = BG_COLOR_SCHEMES[colorSchemeIndex]
  
  // Global rotation state - using a timestamp and click position
  const [globalRotationTimestamp, setGlobalRotationTimestamp] = useState(0)
  const [clickPosition, setClickPosition] = useState(new THREE.Vector2(0, 0))
  
  const triggerGlobalRotation = (event) => {
    // Set to current timestamp to ensure it's always a new value
    setGlobalRotationTimestamp(Date.now())
    
    // Capture the click position (normalized to -1 to 1 range)
    if (event) {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      setClickPosition(new THREE.Vector2(x, y))
    }
  }
  
  useEffect(() => {
    const handleGlobalClick = (event) => {

      setColorSchemeIndex((prevIndex) => (prevIndex + 1) % COLOR_SCHEMES.length)
      
      triggerGlobalRotation(event)
    }
    
    window.addEventListener('click', handleGlobalClick)
    
    return () => {
      window.removeEventListener('click', handleGlobalClick)
    }
  }, [])
  
  return (
    <RotationContext.Provider value={{ 
      globalRotationTimestamp, 
      clickPosition,
      triggerGlobalRotation 
    }}>
      {/* Set background color at the top level */}
      <color attach="background" args={[currentBgColor]} />
      
      {/* Physics scene with shapes */}
      <Scene colorSchemeIndex={colorSchemeIndex} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={300} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={200} color="#3070ff" />
      <hemisphereLight intensity={1} />
    </RotationContext.Provider>
  )
}

export default App