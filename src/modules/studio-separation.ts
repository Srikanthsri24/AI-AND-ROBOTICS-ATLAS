import { Box3, Object3D, Vector3 } from 'three';

export function partSeparation(
  part: Object3D,
  assemblyCenter: Vector3,
  spread: number,
  offset: [number, number, number],
  index: number,
): [number, number, number] {
  const direction = new Box3().setFromObject(part).getCenter(new Vector3()).sub(assemblyCenter);
  if (direction.length() < spread * .18) {
    // Fan out coaxial parts that share a center.
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    direction.set(Math.cos(angle), .4, Math.sin(angle));
  }
  return direction.normalize().multiplyScalar(spread).add(new Vector3(...offset)).toArray();
}
