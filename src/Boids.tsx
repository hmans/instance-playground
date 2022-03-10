import { PerspectiveCamera } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import { IEntity, Tag } from "miniplex"
import { createECS } from "miniplex/react"
import { between, chance, insideSphere } from "randomish"
import { FC } from "react"
import { Group, Object3D, Vector3 } from "three"
import { makeInstanceComponents } from "./lib/Instances"

type SpatialHash = string

const sht: Map<SpatialHash, Entity[]> = new Map()

type Entity = {
  transform: Object3D
  boid: Tag
  friends: Entity[]
  velocity: Vector3
  spatialHashing: {
    sht: Map<SpatialHash, Entity[]>
    previousHash?: string
  }
} & IEntity

const ecs = createECS<Entity>()

const Boid = makeInstanceComponents()

export const Boids: FC = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 10]} intensity={0.4} />
      <fog attach="fog" args={["black", 256, 1024]} />
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
            <ecs.Component name="spatialHashing" data={{ sht }} />

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
    avoidEdgeFactor: {
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
    spatialHashingSystem()
    findFriendsSystem(config.friendRadius)
    alignmentSystem(dt, config.alignmentFactor)
    cohesionSystem(dt, config.cohesionFactor)
    separationSystem(dt, config.separationFactor)
    avoidEdgeSystem(dt, config.avoidEdgeFactor)

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
    group.scale.setScalar(1 + Math.pow(Math.random(), 4) * 3)
  }
}

const tmpvec3 = new Vector3()

const withVelocity = ecs.world.archetype("velocity", "transform")
const withFriends = ecs.world.archetype("friends")
const withBoid = ecs.world.archetype("boid")
const withSHT = ecs.world.archetype("spatialHashing", "transform")

type Cell = [number, number, number]

function calculateCell({ x, y, z }: Vector3, cellSize = 10): Cell {
  return [Math.floor(x / cellSize), Math.floor(y / cellSize), Math.floor(z / cellSize)]
}

function calculateHashForCell(cell: Cell) {
  /* It's fast :b */
  return JSON.stringify(cell)
}

function calculateSpatialHash(position: Vector3, cellSize = 10): SpatialHash {
  return calculateHashForCell(calculateCell(position, cellSize))
}

const spatialHashingSystem = () => {
  for (const entity of withSHT.entities) {
    const hash = calculateSpatialHash(entity.transform.position)

    if (entity.spatialHashing.previousHash !== hash) {
      const { sht } = entity.spatialHashing

      /* Remove entity from previous hash */
      if (entity.spatialHashing.previousHash) {
        const previousList = sht.get(entity.spatialHashing.previousHash)!
        const pos = previousList.indexOf(entity, 0)
        previousList.splice(pos, 1)
      }

      /* Add entity to sht */
      if (!sht.has(hash)) sht.set(hash, [])
      sht.get(hash)?.push(entity)

      /* Remember new hash */
      entity.spatialHashing.previousHash = hash
    }
  }
}

const velocitySystem = (dt: number, limit = 10) => {
  for (const { velocity, transform } of withVelocity.entities) {
    velocity.clampLength(0, limit)
    transform.position.add(tmpvec3.copy(velocity).multiplyScalar(dt))
  }
}

const avoidEdgeSystem = (dt: number, factor = 1) => {
  for (const { transform, velocity } of withVelocity.entities) {
    if (transform.position.length() > 100) {
      velocity.add(
        tmpvec3
          .copy(transform.position)
          .divideScalar(-100)
          .multiplyScalar(dt * factor)
      )
    }
  }
}

/*
This system will go through all entities and identify its "friends", friends being other
boid entities that are within a specific radius to it. This list of friends is used by
other systems to calculate avoidance/separation/cohesion forces.
*/
const findFriendsSystem = (radius = 30) => {
  for (const entity of withFriends.entities) {
    const [x, y, z] = calculateCell(entity.transform.position)

    /* Use the Spatial Hash Table to assemble a list of potential candidates who might be friends of us. */
    const candidates = []

    for (let ix = x - 1; ix < x + 1; ix++) {
      for (let iy = y - 1; iy < y + 1; iy++) {
        for (let iz = z - 1; iz < z + 1; iz++) {
          const hash = calculateHashForCell([ix, iy, iz])
          candidates.push(...(sht.get(hash) || []))
        }
      }
    }

    /* Now go through these candidates and check their distance to us. */
    entity.friends = candidates.filter(
      (other) =>
        entity !== other &&
        entity.transform.position.distanceTo(other.transform.position) < radius
    )
  }
}

/*
This system goes through each entity's friends and calculates the alignment force
to match up the entity's velocity with its friends' average velocity.
*/
const alignmentSystem = (dt: number, factor = 1) => {
  for (const { friends, velocity } of withFriends.entities) {
    velocity.add(
      friends
        .reduce((acc, friend) => acc.add(friend.velocity), tmpvec3.setScalar(0))
        .divideScalar(friends.length || 1)
        .normalize()
        .multiplyScalar(dt * factor)
    )
  }
}

/*
This system goes through each entity's friends and calculates the cohesion force
to move the entity closer to its friends by calculating the center point of their
positions and accelerating the entity towards that.
*/
const cohesionSystem = (dt: number, factor = 1) => {
  for (const { friends, velocity, transform } of withFriends.entities) {
    velocity.add(
      friends
        .reduce((acc, friend) => acc.add(friend.transform.position), tmpvec3.setScalar(0))
        .divideScalar(friends.length || 1)
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
          (acc, friend) => acc.add(friend.transform.position).sub(transform.position),
          tmpvec3.setScalar(0)
        )
        .divideScalar(friends.length || 1)
        .normalize()
        .multiplyScalar(dt * -factor)
    )
  }
}
