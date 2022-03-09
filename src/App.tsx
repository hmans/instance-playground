import { Box } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const App = () => (
  <Canvas>
    <ambientLight />
    <directionalLight />
    <Box>
      <meshStandardMaterial color="hotpink" />
    </Box>
  </Canvas>
);

export default App;
