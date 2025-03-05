import React, { useRef, useState, useEffect, useContext } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import Model from './Model'
import RotationContext from './RotationContext'
import {
  SHAPE_SIZE,
  DAMPING,
  ROTATION_SPEED,
  GLOBAL_ROTATION_DURATION,
  CLICK_FORCE,
  REPULSION_STRENGTH,
  ATTRACTOR_STRENGTH,
  MATERIAL_TYPES
} from './constants'

// Individual shape component with improved click direction handling
function Shape({ position, materialIndex, colorIndex, colorScheme }) {
  const ref = useRef()
  const modelRef = useRef()
  const { raycaster, mouse, camera } = useThree()
  const [hovered, setHovered] = useState(false)
  const rotationRef = useRef(new THREE.Euler(0, 0, 0))
  const rotationTargetRef = useRef(new THREE.Euler(0, 0, 0))
  const globalRotationTimeRef = useRef(0)
  const isRotatingRef = useRef(false)
  const lastHoverTimeRef = useRef(0) // Track when we last started a hover
  const lastClickTimeRef = useRef(0) // Track when we last had a click
  
  // Add refs to track mouse movement
  const prevMouseRef = useRef(new THREE.Vector2(0, 0))
  const mouseVelocityRef = useRef(new THREE.Vector2(0, 0))
  
  // Track nearby objects to prevent jitter
  const lastNeighborCheckedTimeRef = useRef(0)
  const [neighborRepulsionActive, setNeighborRepulsionActive] = useState(false)
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if device is mobile on component mount
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobile(isMobileDevice)
    }
    
    checkMobile()
    
    // Add resize listener to check for orientation changes
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Get rotation context with click position
  const { globalRotationTimestamp, clickPosition } = useContext(RotationContext)
  
  // Get material properties based on materialIndex
  const [roughness, metalness] = MATERIAL_TYPES[materialIndex]
  
  // Get color based on colorIndex and current colorScheme
  const color = colorScheme[colorIndex]
  
  // Handle global rotation when timestamp changes (click event)
  useEffect(() => {
    // Only respond when timestamp is not the initial value
    if (globalRotationTimestamp > 0 && ref.current) {
      // Set a random rotation target
      rotationTargetRef.current.set(
        Math.random() * Math.PI * 2, 
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      )
      
      // Reset global rotation timer and mark as rotating
      globalRotationTimeRef.current = 0
      isRotatingRef.current = true
      lastClickTimeRef.current = globalRotationTimestamp
      
      // Get current position of the shape
      const position = ref.current.translation()
      const shapePos = new THREE.Vector3(position.x, position.y, 0)
      
      // Convert click position to 3D world space
      // First we need to create a ray from the camera through the click position
      const clickPos3D = new THREE.Vector3(clickPosition.x, clickPosition.y, 0)
      clickPos3D.unproject(camera)
      
      // Get ray direction from camera to click point
      const cameraPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld)
      const rayDirection = clickPos3D.sub(cameraPos).normalize()
      
      // Find intersection with the z=0 plane to get the world position of the click
      const planeNormal = new THREE.Vector3(0, 0, 1)
      const planeConstant = 0 // z=0 plane
      
      // Calculate the intersection point
      const denominator = planeNormal.dot(rayDirection)
      
      // Only proceed if the ray isn't parallel to the plane
      if (Math.abs(denominator) > 0.0001) {
        const t = -(cameraPos.dot(planeNormal) + planeConstant) / denominator
        const clickWorldPos = new THREE.Vector3().copy(cameraPos).add(rayDirection.multiplyScalar(t))
        
        // Calculate direction from click to shape (not from center)
        const directionFromClick = new THREE.Vector3()
        directionFromClick.subVectors(shapePos, clickWorldPos)
        
        // Only apply force if not directly at the click point
        if (directionFromClick.length() > 0.1) {
          directionFromClick.normalize()
          
          // Apply outward impulse (only X and Y)
          ref.current.applyImpulse({
            x: directionFromClick.x * CLICK_FORCE,
            y: directionFromClick.y * CLICK_FORCE,
            z: 0 // No force in Z direction
          }, true)
        }
      }
    }
  }, [globalRotationTimestamp, camera])
  
  // Lock Z position when needed and handle physics
  useFrame((state, delta) => {
    if (!ref.current || !modelRef.current) return
    
    // Calculate mouse velocity by comparing with previous position
    mouseVelocityRef.current.set(
      mouse.x - prevMouseRef.current.x,
      mouse.y - prevMouseRef.current.y
    )
    
    // Store current mouse position for next frame
    prevMouseRef.current.set(mouse.x, mouse.y)
    
    // Calculate mouse movement magnitude
    const mouseMovementMagnitude = mouseVelocityRef.current.length()
    
    // Define threshold for considering mouse as "moving"
    // Use a lower threshold for mobile to make it more responsive
    const movementThreshold = isMobile ? 0.0005 : 0.002
    const isMouseMoving = mouseMovementMagnitude > movementThreshold
    
    // Update raycaster with current mouse position
    raycaster.setFromCamera(mouse, camera)
    
    // Check for intersections with this specific shape
    const intersects = raycaster.intersectObject(modelRef.current, true)
    const isHovered = intersects.length > 0
    
    // Only trigger state change if hover state changed
    if (hovered !== isHovered) {
      setHovered(isHovered)
      
      // Set rotation target when hover state changes
      if (isHovered) {
        // Store the current time for this hover activation
        const currentTime = state.clock.elapsedTime
        
        // Make sure we don't overlap with click rotation
        // Only trigger a new hover rotation if we're not already rotating from a click
        // or enough time has passed since the last hover
        if (!isRotatingRef.current || (currentTime - lastHoverTimeRef.current > GLOBAL_ROTATION_DURATION * 2)) {
          // Random rotation target when hovered
          rotationTargetRef.current.set(
            Math.random() * Math.PI * 0.5, 
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 0.5
          )
          isRotatingRef.current = true
          globalRotationTimeRef.current = 0 // Reset timer
          lastHoverTimeRef.current = currentTime
        }
      }
    }
    
    // Track global rotation time for animation duration
    if (isRotatingRef.current) {
      globalRotationTimeRef.current += delta
      
      // Check if rotation animation is complete
      if (globalRotationTimeRef.current >= GLOBAL_ROTATION_DURATION) {
        isRotatingRef.current = false
        // Do NOT reset rotation target - keep the rotation where it stopped
      }
    }
    
    // Handle rotation animation - smoothly interpolate current rotation to target
    if (modelRef.current) {
      // Get current rotation
      const currentRotation = rotationRef.current
      
      // Only interpolate if we're in a rotating state
      if (isRotatingRef.current) {
        // Interpolate toward target rotation
        currentRotation.x += (rotationTargetRef.current.x - currentRotation.x) * delta * ROTATION_SPEED
        currentRotation.y += (rotationTargetRef.current.y - currentRotation.y) * delta * ROTATION_SPEED
        currentRotation.z += (rotationTargetRef.current.z - currentRotation.z) * delta * ROTATION_SPEED
      } else {
        // When not actively rotating, update the target to match the current rotation
        // This prevents any "drift" back to zero
        rotationTargetRef.current.copy(currentRotation)
      }
      
      // Apply rotation to mesh
      modelRef.current.rotation.copy(currentRotation)
    }
    
    // --------- ANTI-JITTER: Check for crowding and apply small separation forces ---------
    const currentTime = state.clock.elapsedTime
    // Only check for neighbors every few frames to improve performance
    if (currentTime - lastNeighborCheckedTimeRef.current > 0.1) { // Check every 0.1 seconds
      lastNeighborCheckedTimeRef.current = currentTime
      
      // Get current position
      const position = ref.current.translation()
      const posVec = new THREE.Vector3(position.x, position.y, position.z)
      
      // Find all RigidBodies in the scene to check for neighbors
      const scene = state.scene
      let nearbyObjects = false
      
      // Function to recursively search for RigidBody objects
      const checkForNearbyObjects = (obj) => {
        if (!obj) return
        
        // Skip self
        if (obj === ref.current) return
        
        // Check if this is a RigidBody
        if (obj.translation && typeof obj.translation === 'function') {
          const otherPos = obj.translation()
          const otherVec = new THREE.Vector3(otherPos.x, otherPos.y, otherPos.z)
          const distance = posVec.distanceTo(otherVec)
          
          // If objects are too close (adjust threshold as needed)
          // This threshold should be slightly larger than the combined radius of the objects
          if (distance < 1.9) {
            nearbyObjects = true
          }
        }
        
        // Check children
        if (obj.children) {
          obj.children.forEach(checkForNearbyObjects)
        }
      }
      
      // Start the recursive search
      scene.traverse(checkForNearbyObjects)
      
      // Update state if changed
      if (neighborRepulsionActive !== nearbyObjects) {
        setNeighborRepulsionActive(nearbyObjects)
      }
    }
    
    // Apply anti-jitter forces when objects are crowding
    if (neighborRepulsionActive) {
      // Get position
      const position = ref.current.translation()
      
      // Calculate direction to center
      const directionToCenter = new THREE.Vector3(-position.x, -position.y, 0)
      const distanceToCenter = directionToCenter.length()
      
      // Only apply if at moderate distance from center
      if (distanceToCenter > 0.2 && distanceToCenter < 3) {
        // Always normalize when calculating directions
        directionToCenter.normalize()
        
        // Apply a small correction toward the center to prevent clumping at edges
        const antiJitterForce = 0.3
        ref.current.applyImpulse({
          x: directionToCenter.x * antiJitterForce,
          y: directionToCenter.y * antiJitterForce,
          z: 0
        }, true)
      }
    }
    
    // Handle hover effect - push away in the direction of mouse movement
    // Only apply when mouse is moving AND hovering
    if (isHovered && isMouseMoving) {
      // Get position
      const position = ref.current.translation()
      
      // Use mouse velocity direction instead of direction from center
      const mouseDirection = new THREE.Vector2(
        mouseVelocityRef.current.x,
        mouseVelocityRef.current.y
      ).normalize()
      
      // Get the current position of this shape
      const distanceFromCenter = Math.sqrt(position.x * position.x + position.y * position.y)
      
      // Define thresholds for position-based adjustments
      const CENTER_THRESHOLD = 1.5  // Objects within this radius are considered "center"
      const OUTER_THRESHOLD = 4.0   // Objects beyond this radius are considered "outer"
      
      // Scale repulsion differently for mobile vs desktop
      let scaledRepulsion
      if (isMobile) {
        // For mobile: adjust strength based on position and direction
        let positionFactor
        if (distanceFromCenter < CENTER_THRESHOLD) {
          // Near center - stronger repulsion
          positionFactor = 2.5
        } else if (distanceFromCenter < OUTER_THRESHOLD) {
          // Moderate distance - gradually reduce
          const t = (distanceFromCenter - CENTER_THRESHOLD) / (OUTER_THRESHOLD - CENTER_THRESHOLD)
          positionFactor = 2.5 - (2.5 - 1.0) * t  // Linear interpolation
        } else {
          // Far from center - weaker repulsion
          positionFactor = 0.7
        }
        
        // Get mouse position and direction to center of screen
        const mousePos = new THREE.Vector2(mouse.x, mouse.y)
        const mouseToCenter = new THREE.Vector2(-mousePos.x, -mousePos.y).normalize()
        
        // Calculate dot product to determine if movement is toward center
        const dotProduct = mouseDirection.dot(mouseToCenter)
        
        // Direction factor - higher when moving toward center
        const directionFactor = Math.max(0.8, 1.0 + dotProduct * 0.5)
        
        // Combined factor
        const combinedFactor = positionFactor * directionFactor
        
        // Apply different scaling based on movement magnitude
        if (mouseMovementMagnitude < 0.002) {
          // Very small movement
          scaledRepulsion = REPULSION_STRENGTH * combinedFactor * (0.5 + mouseMovementMagnitude * 20) 
        } else if (mouseMovementMagnitude < 0.005) {
          // Small but intentional movement
          scaledRepulsion = REPULSION_STRENGTH * combinedFactor * (1 + mouseMovementMagnitude * 40)
        } else {
          // Definite swipe
          scaledRepulsion = REPULSION_STRENGTH * combinedFactor * (2 + mouseMovementMagnitude * 60)
        }
      } else {
        // Desktop uses original calculation
        scaledRepulsion = REPULSION_STRENGTH * (1 + mouseMovementMagnitude * 10)
      }
      
      // Apply impulse in the direction of mouse movement
      ref.current.applyImpulse({
        x: mouseDirection.x * scaledRepulsion,
        y: mouseDirection.y * scaledRepulsion,
        z: 0 // No force in Z direction
      }, true)
    } 
    // Regular attractor force when not actively flicking
    else {
      // Apply pull toward center (only in X and Y)
      const position = ref.current.translation()
      
      // Direction vector to center (X and Y only)
      const directionToCenter = new THREE.Vector3(-position.x, -position.y, 0)
      const distanceToCenter = directionToCenter.length()
      
      // Only apply force if shape is far enough from center
      if (distanceToCenter > 0.5) {
        directionToCenter.normalize()
        
        // MODIFIED: Force increases quadratically with distance
        // This makes distant objects return faster
        const forceMagnitude = ATTRACTOR_STRENGTH * (1 + distanceToCenter * distanceToCenter * 0.05)
        
        directionToCenter.multiplyScalar(forceMagnitude)
        
        ref.current.applyImpulse({
          x: directionToCenter.x,
          y: directionToCenter.y,
          z: 0 // No force in Z direction
        }, true)
      }
      
      // Force Z position to exactly 0
      const currentPos = ref.current.translation()
      
      // If Z has drifted from 0, apply a strong corrective force
      if (Math.abs(currentPos.z) > 0.01) {
        const zCorrection = -currentPos.z * 0.8 // Stronger correction toward 0
        ref.current.applyImpulse({ x: 0, y: 0, z: zCorrection }, true)
        
        // For more aggressive correction, directly set position
        if (Math.abs(currentPos.z) > 0.05) { // Lower threshold for correction
          ref.current.setTranslation({ x: currentPos.x, y: currentPos.y, z: 0 })
        }
      }
    }
  })

  return (
    <RigidBody
      ref={ref}
      position={position}
      linearDamping={DAMPING}
      angularDamping={DAMPING}
      colliders="ball" // Ball collider for physics
      restitution={0.4} // Reduced bounciness to prevent jitter
      friction={0.1} // Lower friction for smoother movement
      mass={3} // Explicit mass setting for consistency
      ccd={true} // Enable continuous collision detection for more stable physics
    >
      <Model 
        ref={modelRef}
        color={color}
        roughness={roughness}
        metalness={metalness}
        scale={[SHAPE_SIZE, SHAPE_SIZE, SHAPE_SIZE]}
      />
    </RigidBody>
  )
}

export default Shape