import * as THREE from "three";

/**
 * Returns a random number between min and max (inclusive)
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random number between min and max
 */
export function randIn(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getObjectByName(group: THREE.Group, name: string) {
  return group.getObjectByName(name) as THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshBasicMaterial
  >;
}

export function getObjectsByProperty(
  group: THREE.Group,
  name: string,
  value: string
) {
  return group.getObjectsByProperty(name, value) as unknown as THREE.Mesh<
    THREE.BoxGeometry,
    THREE.LineBasicMaterial
  >[];
}
