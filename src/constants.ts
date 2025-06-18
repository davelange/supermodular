import * as THREE from "three";
import { LineMaterial } from "three-fatline";

export const colors = {
  green: "#b8ff9e",
  darkGray: "#191919",
  black: "#020202",
  lightGray: "#6b6b6b",
};
export const platform = {
  gap: 50,
  size: 70,
  numLines: 14,
};

export const dashedLineMaterial = new LineMaterial({
  color: colors.lightGray as any as number,
  linewidth: 1, // px
  resolution: new THREE.Vector2(640, 480), // resolution of the viewport
  dashed: true,
  dashScale: 1,
  dashSize: 1,
  gapSize: 1,
});

export const dashedLineMaterialBlack = new LineMaterial({
  color: colors.black as any as number,
  linewidth: 1, // px
  resolution: new THREE.Vector2(640, 480), // resolution of the viewport
  dashed: true,
  dashScale: 1,
  dashSize: 1,
  gapSize: 1,
});
export const rootPlatformCircleGeometry = new THREE.CircleGeometry(0.5, 16);
export const rootPlatformCircleMaterial = new THREE.MeshBasicMaterial({
  color: colors.green,
});
