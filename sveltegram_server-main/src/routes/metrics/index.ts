export * from './server/index';
import { metrics } from './lib/metrics';
import StatsTracker from './lib/statsTracker';

import './lib/collectMetrics';

export { metrics, StatsTracker };
