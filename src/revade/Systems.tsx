import { VectorControl } from "@hmans/controlfreak"
import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"
import { system } from "../lib/systems"
import { controller } from "./controller"
import { ecs } from "./state"

const tmpvec3 = new Vector3()

export const Systems = () => {
  useFrame((_, dt) => {
    playerInputSystem()
    velocitySystem(dt)
  })

  return null
}

const playerInputSystem = system(ecs.world.archetype("player"), (entities) => {
  controller.update()
  const move = controller.controls.move as VectorControl

  for (const entity of entities) {
    entity.velocity?.set(move.value.x * 7, move.value.y * 7, 0)
  }
})

const velocitySystem = system(
  ecs.world.archetype("velocity", "transform"),
  (entities, dt: number) => {
    for (const { velocity, transform } of entities) {
      transform!.position.add(tmpvec3.copy(velocity!).multiplyScalar(dt))
    }
  }
)
