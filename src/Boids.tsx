import { PerspectiveCamera } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { IEntity, Tag } from "miniplex"
import { createECS } from "miniplex/react"
import { between, insideSphere } from "randomish"
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
      <PerspectiveCamera position={[0, 0, 120]} makeDefault />
      <Systems />

      <Boid.Root>
        <sphereGeometry />
        <meshStandardMaterial color="#eee" />
      </Boid.Root>

      <ecs.Collection tag="boid" initial={300}>
        {(entity) => (
          <group ref={(group) => initializeBoidTransform(entity, group!)}>
            <ecs.Component
              name="velocity"
              data={new Vector3().randomDirection().multiplyScalar(between(2, 10))}
            />
            <Boid.Instance />
          </group>
        )}
      </ecs.Collection>
    </>
  )
}

const Systems = () => {
  useFrame((_, dt) => {
    velocitySystem(dt)
    avoidEdgeSystem(dt)
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

const velocitySystem = (dt: number) => {
  for (const { velocity, transform } of withVelocity.entities) {
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
