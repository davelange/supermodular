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

type GetObjectReturnType = {
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  group: THREE.Group;
};

export function getObjectByName<T extends keyof GetObjectReturnType = "mesh">(
  group: THREE.Group,
  name: string
) {
  return group.getObjectByName(name) as GetObjectReturnType[T];
}

export function getObjectsByProperty<
  T extends keyof GetObjectReturnType = "mesh"
>(group: THREE.Group, name: string, value: string) {
  return group.getObjectsByProperty(
    name,
    value
  ) as unknown as GetObjectReturnType[T][];
}
