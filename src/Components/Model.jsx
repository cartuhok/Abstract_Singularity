import React, { useState, useMemo } from 'react'
import { useGLTF, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { MODEL_PATH } from './constants'


function Model({ color, roughness, metalness, scale, ...props }) {
  const { scene } = useGLTF(MODEL_PATH)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  
  // Create a clone of the scene with custom material
  const clone = useMemo(() => {
    // Create our material
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: roughness,
      metalness: metalness,
      emissiveIntensity: 0
    })
    
    // Clone the scene and apply our material
    const clonedScene = scene.clone()
    clonedScene.traverse((node) => {
      if (node.isMesh) {
        node.material = material
        node.castShadow = true
        node.receiveShadow = true
      }
    })
    
    return clonedScene
  }, [scene, color, roughness, metalness])
  
  return (
    <primitive 
      object={clone} 
      scale={scale} 
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  )
}

// Preload the model
useGLTF.preload(MODEL_PATH)

export default Model