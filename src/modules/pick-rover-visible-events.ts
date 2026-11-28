import { events } from '@react-three/fiber';
import { floodVisible } from '../data/flood-surface';
/** Three raycasts can include invisible ancestors. Unfitted workshop parts
 * must not intercept clicks intended for the exposed hardware behind them. */
export const pickRoverVisibleEvents: typeof events = store => ({
  ...events(store),
  filter: intersections => intersections.filter(hit => floodVisible(hit.object)),
});
