import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import { Boids } from "./Boids"

const App = () => (
  <Canvas>
    <Perf position="top-left" />
    <Boids />
    <OrbitControls />
  </Canvas>
)

export default App
