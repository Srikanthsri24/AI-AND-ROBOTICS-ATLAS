/** Authored teaching adapter. The socket takes the servo spline; the smaller
 * through-bore clears the retaining screw and leaves a real axial shoulder.
 * Fine thread flanks, preload and friction capacity are not simulated. */
export const pickGripperHub = {
  outerRadius: 5.5,
  screwBoreRadius: 1.3,
  baseY: 34.4,
  shoulderY: 44,
  socketDepth: 2,
} as const;
