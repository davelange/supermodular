import * as THREE from "three";
import { LineMaterial } from "three-fatline";
import { RoundedBoxGeometry } from "three/examples/jsm/Addons.js";

export const colors = {
  green: "#b8ff9e",
  yellow: "#F6FF9A",
  darkGray: "#191919",
  black: "#020202",
  lightGray: "#6b6b6b",
};
export const platform = {
  gap: 50,
  size: 70,
  numLines: 14,
  topOffset: 30,
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
export const platformGeometry = new RoundedBoxGeometry(
  platform.size,
  platform.size,
  0.5,
  20,
  20
);
export const rootPlatformCircleGeometry = new THREE.CircleGeometry(0.5, 16);
export const rootPlatformCircleMaterial = new THREE.MeshBasicMaterial({
  color: colors.green,
});
export const rootPlatformSphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
export const rootPlatformSphereMaterial = new THREE.MeshBasicMaterial({
  color: colors.green,
});
export const upperMidPlatformSphereGeometry = new THREE.SphereGeometry(
  1.8,
  16,
  16
);
export const upperMidPlatformSphereMaterial = new THREE.MeshBasicMaterial({
  color: colors.yellow,
});

export const upperMidPlatformSpheres = [
  new THREE.Vector3(-30, 5, 10),
  new THREE.Vector3(-20, 5, 20),
  new THREE.Vector3(-15, 5, -15),
  new THREE.Vector3(-25, 5, 15),

  new THREE.Vector3(30, 5, 10),
  new THREE.Vector3(20, 5, 20),
  new THREE.Vector3(15, 5, -15),
  new THREE.Vector3(25, 5, 15),
];
export const rootSquarePositions = [
  { x: -20, z: -20 },
  { x: 0, z: -20 },
  { x: 20, z: -20 },
  { x: -20, z: 0 },
  { x: -20, z: 20 },
  { x: 15, z: 15 },
];

const lineDist = 20;
export const upperMidSquarePositions = [
  {
    position: { x: -15, z: -15 },
    lineDirection: new THREE.Vector3(0, 0, -lineDist),
  },
  {
    position: { x: -15, z: 15 },
    lineDirection: new THREE.Vector3(-lineDist, 0, 0),
  },
  {
    position: { x: 15, z: -15 },
    lineDirection: new THREE.Vector3(lineDist, 0, 0),
  },
  {
    position: { x: 15, z: 15 },
    lineDirection: new THREE.Vector3(lineDist, 0, 0),
  },
];

export const dashedLineMaterialSolid = new LineMaterial({
  color: colors.yellow as any as number,
  linewidth: 1, // px
  resolution: new THREE.Vector2(640, 480), // resolution of the viewport
  dashed: false,
  transparent: true,
  opacity: 0,
});

export const upperSquarePositions = [
  { x: -15, z: 15 },
  { x: 15, z: -15 },
  { x: 15, z: 15 },
];

export const plat1Labels = [
  {
    label: "Objectives",
    subKeywords: ["OKR", "Business Outcome"],
    icon: "label_objectives.svg",
    align: "right",
  },
  {
    label: "architecture",
    subKeywords: ["Solution Patterns", "Governance"],
    icon: "label_arch.svg",
    align: "left",
  },
  {
    label: "security",
    subKeywords: ["Dependencies", "Cost", "Compliance"],
    icon: "label_security.svg",
    align: "left",
  },
  {
    label: "technology stack",
    subKeywords: ["Cloud Platforms", "Enterprise Systems", "API's", "Tools"],
    icon: "label_tech.svg",
    align: "right",
  },
  {
    label: "project management",
    subKeywords: ["Methodologies,", "Frameworks"],
    icon: "label_proj.svg",
    align: "right",
  },
  {
    label: "organization",
    subKeywords: ["Teams", "Roles", "Ownership"],
    icon: "label_org.svg",
    align: "left",
  },
];

export const plat2Labels = [
  {
    label: "Agentic system A",
    subKeywords: ["Compliance"],
    icon: "label_security.svg",
  },
  {
    label: "Agentic system B",
    subKeywords: ["Quality Control"],
    icon: "label_security.svg",
  },
  {
    label: "Agentic system C",
    subKeywords: ["IT Architecture"],
    icon: "label_security.svg",
  },
  {
    label: "Agentic system D",
    subKeywords: ["Project Manager"],
    icon: "label_security.svg",
  },
];

export const plat3Labels = [
  {
    label: "Solution 1",
    icon: "solution1.png",
    align: "left",
    subKeywords: ["Compliance"],
  },
  {
    label: "Solution 2",
    icon: "solution2.png",
    align: "left",
    subKeywords: ["Compliance"],
  },
  {
    label: "Solution 3",
    icon: "solution3.png",
    align: "left",
    subKeywords: ["Compliance"],
  },
];
