import Wall1 from "../assets/textures/wall1.png";
import Ground1 from "../assets/textures/ground1.png";
import Ground2 from "../assets/textures/ground2.png";

function texturePicker(geomType) {
  const wallTextures = [Wall1];
  const groundTextures = [Ground1, Ground2];

  switch (geomType) {
    case 1:
      return groundTextures[randomizer(0, groundTextures.length)];
    case 2:
      return wallTextures[randomizer(0, wallTextures.length)];
    default:
      break;
  }
  return;
}

function randomizer(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default texturePicker;
