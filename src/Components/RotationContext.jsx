import { createContext } from 'react'
import * as THREE from 'three'

// Create a context for global rotation
const RotationContext = createContext({
  globalRotationTimestamp: 0,
  clickPosition: new THREE.Vector2(0, 0),
  triggerGlobalRotation: () => {}
})

export default RotationContext