import React, { Suspense, useState, useEffect, useMemo } from "react";
import { Canvas } from "react-three-fiber";
import { PerspectiveCamera } from "@react-three/drei/core";

import Loading from "./components/Loading";
import Level from "./components/Level";

import { LVL_DEFAULT as DEFAULT, GEN_OPTIONS } from "./utility/defaultValues";

function App() {
  const [lvl, setLvl] = useState();
  const [winSize, setWinSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [options, setOptions] = useState({
    tileWidth: DEFAULT.TILE_WIDTH,
    tileHeight: DEFAULT.TILE_HEIGHT,
    tileDepth: DEFAULT.TILE_DEPTH,
    wallWidth: DEFAULT.WALL_WIDTH,
    wallDepth: DEFAULT.WALL_DEPTH,
    wallHeight: DEFAULT.WALL_HEIGHT,
    mapDepth: DEFAULT.MAP_DEPTH,
    mapWidth: DEFAULT.MAP_WIDTH
  });
  const [genOptions, setGenOptions] = useState({
    showTiles: GEN_OPTIONS.SHOW_TILES,
    showWalls: GEN_OPTIONS.SHOW_WALLS,
    fpsCam: GEN_OPTIONS.FPS_CAM
  });

  useEffect(() => {
    let handleWinResize = () => {
      setWinSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleWinResize);
  }, [winSize]);
  const dungeon = useMemo(() => {
    return (
      <Suspense fallback={<Loading />}>
        <Level options={options} genOptions={genOptions} setLvl={setLvl} />

        <PerspectiveCamera
          matrixAutoUpdate
          makeDefault
          position={[0, 2500, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          fov={75}
          near={0.01}
          far={3000}
        />
      </Suspense>
    );
  }, [genOptions, options]);

  return (
    <div className="App">
      <Canvas
        id="3dCanvas"
        style={{
          background: "black",
          width: winSize.width,
          height: winSize.height
        }}
      >
        <spotLight position={[0, 2500, 0]} intensity={0.1} />
        <hemisphereLight position={[0, 2500, 0]} intensity={0.3} />
        <directionalLight position={[0, 2500, 0]} intensity={0.1} />
        {dungeon}
      </Canvas>
    </div>
  );
}

export default App;
