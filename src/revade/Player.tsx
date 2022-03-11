import { Box } from "@react-three/drei"
import { ecs } from "./state"

export const Player = () => {
  return (
    <ecs.Collection tag="player" initial={1}>
      <ecs.Component name="transform">
        <Box>
          <meshStandardMaterial color="red" />
        </Box>
      </ecs.Component>

      <ecs.Component name="velocity">
        <vector3 />
      </ecs.Component>
    </ecs.Collection>
  )
}
