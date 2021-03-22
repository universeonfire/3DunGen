import React, { useRef } from "react";

import { Instance } from "./Instances";

const GeneratedGeometries = (props) => {
  let { mapArray, boundingBox } = props;
  const ref = useRef();

  return (
    <mesh
      ref={ref}
      position={[
        0 - (boundingBox.x.max - boundingBox.x.min) / 2,
        0 - (boundingBox.y.max - boundingBox.y.min) / 2,
        0 - (boundingBox.z.max - boundingBox.z.min) / 2
      ]}
    >
      {mapArray.map((element) => {
        return (
          <Instance
            position={[element[0], element[1], element[2]]}
            key={
              element[0] +
              1 * Math.random() +
              element[2] +
              1 * Math.random() * 10
            }
          />
        );
      })}
    </mesh>
  );
};

export default GeneratedGeometries;
