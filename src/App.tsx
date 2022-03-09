import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Boids } from "./Boids"

const App = () => (
  <Canvas>
    <Boids />
    <OrbitControls />
  </Canvas>
)

export default App
