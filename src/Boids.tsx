import { PerspectiveCamera } from "@react-three/drei"
import { IEntity, Tag } from "miniplex"
import { createECS } from "miniplex/react"
import { insideSphere } from "randomish"
import { FC } from "react"
import { Group, Object3D } from "three"
import { makeInstanceComponents } from "./lib/Instances"

type Entity = {
  transform: Object3D
  boid: Tag
} & IEntity

const ecs = createECS<Entity>()

const Boid = makeInstanceComponents()

export const Boids: FC = () => {
  return (
    <>
      <ambientLight />
      <directionalLight />
      <PerspectiveCamera position={(0, 0, 120)} makeDefault />

      <Boid.Root>
        <sphereGeometry />
        <meshStandardMaterial color="#eee" />
      </Boid.Root>

      <ecs.Collection tag="boid" initial={300}>
        {(entity) => (
          <group ref={(group) => initializeBoidTransform(entity, group!)}>
            <Boid.Instance />
          </group>
        )}
      </ecs.Collection>
    </>
  )
}

const initializeBoidTransform = (entity: Entity, group: Group) => {
  if (!group) {
    ecs.world.removeComponent(entity, "transform")
  } else {
    ecs.world.addComponent(entity, "transform", group)

    const pos = insideSphere()
    group.position.set(pos.x * 100, pos.y * 100, pos.z * 100)
  }
}
