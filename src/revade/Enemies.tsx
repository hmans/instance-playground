import { Dodecahedron } from "@react-three/drei"
import { between } from "randomish"
import { Quaternion, Vector3 } from "three"
import { ecs } from "./state"

export const Enemies = () => (
  <ecs.Collection tag="enemy" initial={100} memoize>
    {() => (
      <>
        <ecs.Component name="transform">
          <Dodecahedron
            position={[between(-50, 50), between(-50, 50), 0]}
            quaternion={new Quaternion().random()}
          >
            <meshStandardMaterial
              color="hotpink"
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
        <ecs.Component name="autorotate" data={{ speed: 1 }} />
      </>
    )}
  </ecs.Collection>
)
