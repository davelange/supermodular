/**
 * Returns a random number between min and max (inclusive)
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random number between min and max
 */
export function randIn(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
