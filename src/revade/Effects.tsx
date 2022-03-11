import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette
} from "@react-three/postprocessing"

export const Effects = () => (
  <EffectComposer>
    {/* <DepthOfField focusDistance={0.5} focalLength={0.02} bokehScale={2} height={480} /> */}
    <Bloom luminanceThreshold={0.3} luminanceSmoothing={1} height={500} intensity={2} />
    <Noise opacity={0.04} />
    <Vignette eskil={false} offset={0.1} darkness={1.1} />
  </EffectComposer>
)
