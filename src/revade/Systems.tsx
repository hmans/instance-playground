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
    playerInputSystem(5)

    findAttractorsForEnemies()
    followAttractors()

    velocityLimitSystem()
    velocitySystem(dt)
    velocityDapmingSystem()

    spawnSystem(dt)
  })

  return null
}

const playerInputSystem = system(ecs.world.archetype("player"), (entities, thrust = 1) => {
  controller.update()
  const move = controller.controls.move as VectorControl

  for (const entity of entities) {
    entity.velocity?.add(tmpvec3.set(move.value.x, move.value.y, 0).multiplyScalar(thrust))
  }
})

const velocityLimitSystem = system(
  ecs.world.archetype("velocity", "velocityLimit"),
  (entities) => {
    for (const { velocity, velocityLimit } of entities) {
      velocity!.clampLength(0, velocityLimit!)
    }
  }
)

const velocityDapmingSystem = system(
  ecs.world.archetype("velocity", "velocityDamping"),
  (entities) => {
    for (const { velocity, velocityDamping } of entities) {
      velocity!.multiplyScalar(velocityDamping!)
    }
  }
)

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

const findAttractorsForEnemies = system(
  ecs.world.archetype("enemy", "attractors"),
  (entities) => {
    /* For enemies, attractors are... mostly the player. :P */
    const players = ecs.world.archetype("player")

    for (const entity of entities) {
      entity.attractors = players.entities
    }
  }
)

const followAttractors = system(
  ecs.world.archetype("transform", "velocity", "attractors"),
  (entities) => {
    for (const { transform, velocity, attractors } of entities) {
      if (attractors!.length) {
        const acceleration = attractors!
          .reduce(
            (acc, attractor) =>
              acc.add(attractor.transform!.position).sub(transform!.position),
            tmpvec3.setScalar(0)
          )
          .divideScalar(attractors!.length)

        velocity?.add(acceleration)
      }
    }
  }
)
