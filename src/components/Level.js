import React, { useMemo, useRef } from "react";
import { TextureLoader } from "three";

import GeneratedGeometries from "./GeneratedGeometries";
import DungeonGenerator from "../map/dunGen";
import { Instances } from "./Instances";
import TexturePicker from "../utility/texturePicker";

const Level = (props) => {
  const { options, genOptions, setLvl } = props;
  const lvlRef = useRef();
  const wallText = TexturePicker(2);
  const wallTexture = useMemo(() => new TextureLoader().load(wallText), []);
  const tileText = TexturePicker(1);
  const tileTexture = useMemo(() => new TextureLoader().load(tileText), []);
  const generatedMap = useMemo(() => {
    let newGame = new DungeonGenerator({
      width: options.mapWidth,
      height: options.mapDepth,
      retry: 100,
      special: false,
      room: {
        ideal: 25,
        minWidth: 3,
        maxWidth: 17,
        minHeight: 3,
        maxHeight: 17
      },
      roomify: true
    }).initialize();
    let wallArray = [];
    let tileArray = [];
    let worldMap = newGame.world;
    let lightMap = newGame.worldLightMap;
    let wminX = 0;
    let wminY = 0;
    let wminZ = 0;
    let wmaxX = 0;
    let wmaxY = 0;
    let wmaxZ = 0;
    let tminX = 0;
    let tminY = 0;
    let tminZ = 0;
    let tmaxX = 0;
    let tmaxY = 0;
    let tmaxZ = 0;
    worldMap.forEach((wm, c) => {
      wm.forEach((m, r) => {
        if (m === 2 || m === "pillar") {
          if (wminX > options.wallWidth + r * options.wallWidth)
            wminX = options.wallWidth + r * options.wallWidth;
          if (wminY > options.wallHeight / 2) wminY = options.wallHeight / 2;
          if (wminZ > options.wallDepth + c * options.wallDepth)
            wminZ = options.wallDepth + c * options.wallDepth;
          if (wmaxX < options.wallWidth + r * options.wallWidth)
            wmaxX = options.wallWidth + r * options.wallWidth;
          if (wmaxY < options.wallHeight / 2) wmaxY = options.wallHeight / 2;
          if (wmaxZ < options.wallDepth + c * options.wallDepth)
            wmaxZ = options.wallDepth + c * options.wallDepth;
          wallArray.push([
            options.wallWidth + r * options.wallWidth,
            options.wallHeight / 2,
            options.wallDepth + c * options.wallDepth
          ]);
        } else if (m !== "chasm" && m !== 0) {
          if (tminX > r * options.tileWidth) tminX = r * options.tileWidth;
          if (tminY > options.tileHeight / 2) tminY = options.tileHeight / 2;
          if (tminZ > c * options.tileDepth) tminZ = c * options.tileDepth;
          if (tmaxX < r * options.tileWidth) tmaxX = r * options.tileWidth;
          if (tmaxY < options.tileHeight / 2) tmaxY = options.tileHeight / 2;
          if (tmaxZ < c * options.tileDepth) tmaxZ = c * options.tileDepth;
          tileArray.push([
            r * options.tileWidth,
            -options.tileWidth / 2,
            c * options.tileDepth
          ]);
        }
      });
    });
    let wallsBoundingBox = {
      x: {
        min: wminX,
        max: wmaxX
      },
      y: {
        min: wminY,
        max: wmaxY
      },
      z: {
        min: wminZ,
        max: wmaxZ
      }
    };
    let tilesBoundingBox = {
      x: {
        min: tminX,
        max: tmaxX
      },
      y: {
        min: tminY,
        max: tmaxY
      },
      z: {
        min: tminZ,
        max: tmaxZ
      }
    };
    return {
      worldMap: worldMap,
      lightMap: lightMap,
      wallArray: wallArray,
      tileArray: tileArray,
      wallsBoundingBox: wallsBoundingBox,
      tilesBoundingBox: tilesBoundingBox
    };
  }, [options]);

  const generatedGeometry = useMemo(() => {
    if (lvlRef.current) setLvl(lvlRef.current);
    return (
      <scene ref={lvlRef}>
        <mesh visible={genOptions.showWalls}>
          <Instances>
            <boxBufferGeometry
              attach="geometry"
              args={[options.wallWidth, options.wallHeight, options.wallDepth]}
            />
            <meshPhongMaterial
              attach="material"
              roughness={0.9}
              metalness={0}
              wireframe={false}
            >
              <primitive attach="map" object={wallTexture} />
            </meshPhongMaterial>
            <GeneratedGeometries
              mapArray={generatedMap.wallArray}
              boundingBox={generatedMap.wallsBoundingBox}
            />
          </Instances>
        </mesh>
        <mesh visible={genOptions.showTiles}>
          <Instances>
            <boxBufferGeometry
              attach="geometry"
              args={[options.tileWidth, 2, options.tileDepth]}
            />
            <meshPhongMaterial
              attach="material"
              roughness={0.9}
              metalness={0}
              wireframe={false}
            >
              <primitive attach="map" object={tileTexture} />
            </meshPhongMaterial>
            <GeneratedGeometries
              mapArray={generatedMap.tileArray}
              boundingBox={generatedMap.tilesBoundingBox}
            />
          </Instances>
        </mesh>
      </scene>
    );
  }, [generatedMap, options, wallTexture, tileTexture, genOptions, setLvl]);

  return generatedGeometry;
};

export default Level;
