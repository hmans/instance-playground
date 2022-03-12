import { Dodecahedron } from "@react-three/drei"
import { between, number } from "randomish"
import { Quaternion } from "three"
import { SpatialHashGrid } from "../lib/SpatialHashGrid"
import { ecs } from "./state"

const grid = new SpatialHashGrid(50)

export const Enemies = () => (
  <ecs.Collection tag="enemy" initial={1} memoize>
    {() => (
      <>
        <ecs.Component name="transform">
          <Dodecahedron
            position={[between(-50, 50), between(-50, 50), 0]}
            quaternion={new Quaternion().random()}
          >
            <meshStandardMaterial
              color="white"
              wireframe
              emissive={"white"}
              emissiveIntensity={1}
            />
          </Dodecahedron>
        </ecs.Component>
        <ecs.Component name="velocity">
          <vector3 />
        </ecs.Component>
        <ecs.Component name="velocityLimit" data={5} />
        <ecs.Component name="velocityDamping" data={0.9} />
        <ecs.Component name="attractors" data={[]} />
        <ecs.Component
          name="avoidance"
          data={{ range: 1, neighbors: [], archetype: ecs.world.archetype("enemy") }}
        />
        <ecs.Component name="spatialHashing" data={grid} />
        <ecs.Component name="autorotate" data={{ speed: 1 }} />
      </>
    )}
  </ecs.Collection>
)
