import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import { Suspense } from "react"
import { Boids } from "./Boids"

const App = () => (
  <Canvas>
    <Suspense fallback={false}>
      <Perf position="top-left" />
      <Boids />
      <OrbitControls />
    </Suspense>
  </Canvas>
)

export default App
