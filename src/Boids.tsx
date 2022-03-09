import { PerspectiveCamera } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import { IEntity, Tag } from "miniplex"
import { createECS } from "miniplex/react"
import { between, chance, insideSphere } from "randomish"
import { FC } from "react"
import { Group, Object3D, Vector3 } from "three"
import { makeInstanceComponents } from "./lib/Instances"

type Entity = {
  transform: Object3D
  boid: Tag
  friends: Entity[]
  velocity: Vector3
} & IEntity

const ecs = createECS<Entity>()

const Boid = makeInstanceComponents()

export const Boids: FC = () => {
  return (
    <>
      <ambientLight />
      <directionalLight />
      <PerspectiveCamera position={[0, 0, 200]} makeDefault />
      <Systems />

      <Boid.Root>
        <sphereGeometry />
        <meshStandardMaterial color="#eee" />
      </Boid.Root>

      <ecs.Collection tag="boid" initial={3000}>
        {(entity) => (
          <group ref={(group) => initializeBoidTransform(entity, group!)}>
            <ecs.Component
              name="velocity"
              data={new Vector3().randomDirection().multiplyScalar(between(2, 10))}
            />
            <ecs.Component name="friends" data={[]} />

            <Boid.Instance />
          </group>
        )}
      </ecs.Collection>
    </>
  )
}

const Systems = () => {
  const config = useControls({
    friendRadius: {
      value: 30,
      min: 0,
      max: 100,
      step: 1
    },
    alignmentFactor: {
      value: 1,
      min: 0,
      max: 10,
      step: 0.25
    },
    cohesionFactor: {
      value: 1,
      min: 0,
      max: 10,
      step: 0.25
    },
    separationFactor: {
      value: 1,
      min: 0,
      max: 10,
      step: 0.25
    },
    maxVelocity: {
      value: 50,
      min: 0,
      max: 100,
      step: 1
    }
  })

  useFrame((_, dt) => {
    /* Boids */
    findFriendsSystem(config.friendRadius)
    alignmentSystem(dt, config.alignmentFactor)
    cohesionSystem(dt, config.cohesionFactor)
    separationSystem(dt, config.separationFactor)
    avoidEdgeSystem(dt)

    /* System */
    velocitySystem(dt, config.maxVelocity)
  })

  return null
}

const initializeBoidTransform = (entity: Entity, group: Group) => {
  if (!group) {
    ecs.world.removeComponent(entity, "transform")
  } else {
    ecs.world.addComponent(entity, "transform", group)

    group.position.copy(insideSphere(100) as Vector3)
  }
}

const tmpvec3 = new Vector3()

const withVelocity = ecs.world.archetype("velocity", "transform")
const withFriends = ecs.world.archetype("friends")
const withBoid = ecs.world.archetype("boid")

const velocitySystem = (dt: number, limit = 10) => {
  for (const { velocity, transform } of withVelocity.entities) {
    velocity.clampLength(0, limit)
    transform.position.add(tmpvec3.copy(velocity).multiplyScalar(dt))
  }
}

const avoidEdgeSystem = (dt: number) => {
  for (const { transform, velocity } of withVelocity.entities) {
    if (transform.position.length() > 100) {
      velocity.add(tmpvec3.copy(transform.position).divideScalar(-100).multiplyScalar(dt))
    }
  }
}

const findFriendsSystem = (radius = 30) => {
  for (const entity of withFriends.entities) {
    /* The way we're finding friends is very expensive, so as a stupid little performance hack,
       let's only do it 20% of the time. */
    if (chance(0.8)) continue

    entity.friends = []
    for (const other of withBoid.entities) {
      if (entity.transform.position.distanceTo(other.transform.position) < radius) {
        entity.friends.push(other)
      }
    }
  }
}

const alignmentSystem = (dt: number, factor = 1) => {
  for (const { friends, velocity } of withFriends.entities) {
    velocity.add(
      friends
        .reduce((acc, friend) => acc.add(friend.velocity), new Vector3())
        .divideScalar(withFriends.entities.length || 1)
        .normalize()
        .multiplyScalar(dt * factor)
    )
  }
}

const cohesionSystem = (dt: number, factor = 1) => {
  for (const { friends, velocity, transform } of withFriends.entities) {
    velocity.add(
      friends
        .reduce((acc, friend) => acc.add(friend.transform.position), new Vector3())
        .divideScalar(withFriends.entities.length || 1)
        .sub(transform.position)
        .normalize()
        .multiplyScalar(dt * factor)
    )
  }
}

const separationSystem = (dt: number, factor = 1) => {
  for (const { friends, velocity, transform } of withFriends.entities) {
    velocity.add(
      friends
        .reduce(
          (acc, friend) =>
            acc.add(tmpvec3.copy(friend.transform.position).sub(transform.position)),
          new Vector3()
        )
        .divideScalar(withFriends.entities.length || 1)
        .normalize()
        .multiplyScalar(dt * -factor)
    )
  }
}
