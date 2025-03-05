export const SPHERE_COUNT = 15
export const ATTRACTOR_STRENGTH = 0.5 // Very weak pull toward center
export const REPULSION_STRENGTH = 7 // Push strength from mouse
export const SHAPE_SIZE = 1 // Uniform size for scaling the model
export const SPAWN_RADIUS = 3
export const DAMPING = 2
export const ROTATION_SPEED = 3 // Speed of rotation when hovered
export const GLOBAL_ROTATION_DURATION = 0.5 // Duration in seconds for the global rotation effect
export const CLICK_FORCE = 40 // Smaller than hover repulsion

export const MODEL_PATH = './ABSTRACT_SHAPES.glb'

export const COLOR_SCHEMES = [
  ['#4080ff', '#40d0ff', '#40ffe0'],
  ['#8a1538', '#c01f5e', '#ff2975'],
  ['#8040ff', '#c040ff', '#ff40d0'],
  ['#ff6b6b', '#ff9e7a', '#ffa69e']
]


export const BG_COLOR_SCHEMES = ['#050510', '#100508', '#100510', '#100808']

// Material properties - [roughness, metalness]
export const MATERIAL_TYPES = [
  [1, 0], 
  [0, 0.5], 
  [0, 0] 
]