import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"
import { system } from "../lib/systems"
import { ecs } from "./state"

const tmpvec3 = new Vector3()

export const Systems = () => {
  useFrame((_, dt) => {
    velocitySystem(dt)
  })

  return null
}

const velocitySystem = system(
  ecs.world.archetype("velocity", "transform"),
  (entities, dt: number) => {
    for (const { velocity, transform } of entities) {
      transform!.position.add(tmpvec3.copy(velocity!).multiplyScalar(dt))
    }
  }
)