import { Composition } from "remotion";
import { Fisheye } from "./Fisheye";
export const RemotionRoot = () => (
  <Composition
    id="FisheyeSMS"
    component={Fisheye}
    width={1080}
    height={1102}
    fps={30}
    durationInFrames={60}
    defaultProps={{ distortion: 0.19, moire: 0.12, vignette: 0.42 }}
  />
);
