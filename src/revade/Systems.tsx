import { VectorControl } from "@hmans/controlfreak"
import { useFrame } from "@react-three/fiber"
import { Tag } from "miniplex"
import { Vector3 } from "three"
import { system } from "../lib/systems"
import { controller } from "./controller"
import { ecs } from "./state"

const tmpvec3 = new Vector3()

export const Systems = () => {
  const spawnSystem = spawnNewEnemiesSystem(1)

  useFrame((_, dt) => {
    playerInputSystem()
    velocitySystem(dt)
    spawnSystem(dt)
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

const spawnNewEnemiesSystem = (delay: number) => {
  let cooldown = delay

  return (dt: number) => {
    cooldown -= dt
    if (cooldown <= 0) {
      console.log("SPAWN")
      cooldown += delay

      ecs.world.createEntity({ enemy: Tag })
    }
  }
}
