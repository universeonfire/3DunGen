import React, {  useRef } from "react";
import { useFrame } from "react-three-fiber";
import { FontLoader } from "three";

import FontLoad from "../assets/fonts/lcdFont.json";

const Loading = () => {
  const sphereRotation = useRef({ rotation: { x: 0, y: 0, z: 0 } });
  const font = new FontLoader().parse(FontLoad);
  const textOptions = {
    font,
    size: 0.4,
    height: 1
  };
  useFrame((state) => {
    let time = state.clock.getElapsedTime();
    sphereRotation.current.rotation.y = Math.sin(time / 2);
  });
  return (
    <group>
      <mesh visible position={[5.5, -0.5, -5]}>
        <textBufferGeometry
          attach="geometry"
          args={["Loading...", textOptions]}
        />

        <meshBasicMaterial attach="material" color="darkgreen" />
      </mesh>
    </group>
  );
};

export default Loading;
