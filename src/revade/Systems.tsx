import { VectorControl } from "@hmans/controlfreak"
import { useFrame } from "@react-three/fiber"
import { Archetype, EntityWithComponents, IEntity, QueriedEntity, Query, Tag } from "miniplex"
import { Vector3 } from "three"
import { system } from "../lib/systems"
import { controller } from "./controller"
import { ecs, RevadeEntity } from "./state"

const tmpvec3 = new Vector3()

export const Systems = () => {
  useFrame((_, dt) => {
    playerInputSystem(5)

    findAttractorsForEnemies()
    followAttractors()

    avoidanceSystem()

    velocityLimitSystem()
    velocitySystem(dt)
    velocityDapmingSystem()
    autoRotateSystem(dt)
    autoSqueezeSystem(dt)

    spawnNewEnemiesSystem()
  })

  return null
}

const playerInputSystem = system(
  ecs.world.archetype("player", "transform", "velocity"),
  (entities, thrust = 1) => {
    controller.update()
    const move = controller.controls.move as VectorControl

    for (const entity of entities) {
      entity.velocity.add(tmpvec3.set(move.value.x, move.value.y, 0).multiplyScalar(thrust))
      entity.transform.quaternion.setFromUnitVectors(
        new Vector3(0, 1, 0),
        entity.velocity.clone().normalize()
      )
    }
  }
)

const velocityLimitSystem = system(
  ecs.world.archetype("velocity", "velocityLimit"),
  (entities) => {
    for (const { velocity, velocityLimit } of entities) {
      velocity.clampLength(0, velocityLimit)
    }
  }
)

const velocityDapmingSystem = system(
  ecs.world.archetype("velocity", "velocityDamping"),
  (entities) => {
    for (const { velocity, velocityDamping } of entities) {
      velocity.multiplyScalar(velocityDamping)
    }
  }
)

const velocitySystem = system(
  ecs.world.archetype("velocity", "transform"),
  (entities, dt: number) => {
    for (const { velocity, transform } of entities) {
      transform.position.add(tmpvec3.copy(velocity).multiplyScalar(dt))
    }
  }
)

const spawnNewEnemies = () => {
  ecs.world.createEntity({ enemy: Tag })
}

const spawnNewEnemiesSystem = withInterval(spawnNewEnemies, 0.2)

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
      if (attractors.length) {
        const acceleration = attractors
          .reduce(
            (acc, attractor) => acc.add(attractor.transform!.position).sub(transform.position),
            tmpvec3.setScalar(0)
          )
          .divideScalar(attractors.length)
          .multiplyScalar(0.5)

        velocity?.add(acceleration)
      }
    }
  }
)

const avoidanceSystem = system(
  ecs.world.archetype("avoidance", "velocity", "transform"),
  (entities) => {
    for (const { avoidance, velocity, transform } of entities) {
      /* Find neighbors */
      const candidates = avoidance.archetype.entities
      avoidance.neighbors = candidates.filter(
        (candidate) =>
          candidate.transform!.position.distanceTo(transform!.position) <= avoidance!.range
      )

      /* Avoid neighbors */
      if (avoidance.neighbors.length) {
        const acceleration = avoidance.neighbors
          .reduce(
            (acc, neighbor) => acc.add(neighbor.transform!.position).sub(transform!.position),
            tmpvec3.setScalar(0)
          )
          .divideScalar(-avoidance!.neighbors.length)
          .normalize()
          .multiplyScalar(2)

        velocity.add(acceleration)
      }
    }
  }
)

const autoSqueezeSystem = system(
  ecs.world.archetype("transform", "autosqueeze"),
  (entities, dt: number) => {
    for (const { transform, autosqueeze } of entities) {
      autosqueeze.t += dt * autosqueeze.speed
      transform.scale.x = 1 + Math.cos(autosqueeze.t) * 0.2
      transform.scale.y = 1 + Math.sin(autosqueeze.t) * 0.2
    }
  }
)

/*
EXPERIMENTS!
*/

function withArchetype<
  TEntity extends IEntity,
  TQuery extends Query<TEntity>,
  TArgs extends any[]
>(
  system: (entities: QueriedEntity<TEntity, TQuery>[], ...args: TArgs) => void,
  archetype: Archetype<TEntity, TQuery>
) {
  const { entities } = archetype

  return (...args: TArgs) => {
    system(entities, ...args)
  }
}

function withInterval<TArgs extends any[]>(
  system: (...args: TArgs) => void,
  interval: number
) {
  let lastTime = performance.now()

  return (...args: TArgs) => {
    if (performance.now() >= lastTime + interval) {
      lastTime += interval
      system(...args)
    }
  }
}

/* Write a standalone system that accepts a list of entities and extra args. Easy to test! */
const autoRotateSystemNaked = (
  entities: EntityWithComponents<RevadeEntity, "transform" | "autorotate">[],
  dt: number
) => {
  for (const { transform, autorotate } of entities) {
    transform.rotation.x = transform.rotation.y += dt * autorotate.speed
  }
}

/* Compose some behavior into this sytem, eg. invoking it with a specific archetype, or configuring an interval: */
const autoRotateSystem = withInterval(
  withArchetype(autoRotateSystemNaked, ecs.world.archetype("transform", "autorotate")),
  300
)
