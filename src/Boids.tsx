import { FC } from "react"
import { makeInstanceComponents } from "./lib/Instances"

const Boid = makeInstanceComponents()

export const Boids: FC = () => {
  return (
    <>
      <ambientLight />
      <directionalLight />
      <Boid.Root>
        <sphereGeometry />
        <meshStandardMaterial color="#eee" />
      </Boid.Root>

      <Boid.Instance />
    </>
  )
}
