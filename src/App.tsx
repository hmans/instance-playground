import { Canvas } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import { Suspense } from "react"
import { Revade } from "./revade"

const App = () => (
  <Canvas>
    <Suspense fallback={false}>
      <Perf position="top-left" />
      <Revade />
    </Suspense>
  </Canvas>
)

export default App
