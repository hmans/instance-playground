import { Dodecahedron } from "@react-three/drei"
import { between } from "randomish"
import { ecs } from "./state"

export const Enemies = () => (
  <ecs.Collection tag="enemy" initial={100} memoize>
    {() => (
      <>
        <ecs.Component name="transform">
          <Dodecahedron position={[between(-50, 50), between(-50, 50), 0]}>
            <meshStandardMaterial color="hotpink" />
          </Dodecahedron>
        </ecs.Component>

        <ecs.Component name="velocity">
          <vector3 />
        </ecs.Component>

        <ecs.Component name="velocityLimit" data={5} />

        <ecs.Component name="attractors" data={[]} />
      </>
    )}
  </ecs.Collection>
)
