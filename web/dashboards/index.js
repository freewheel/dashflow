/* eslint-env browser */

import { log } from './log.js';
import { gauge } from './gauge.js';
import { banner } from './banner.js';
import { SystemDashboard } from './system.js';


function parseDashboardFunction(title, spec) {
  const types = Object.keys(spec);

  const type = types[0];
  const s = spec[type];

  if (type === "log") {
    return log(s.title, s.position, s.filter, s.gauge, s.limit || 500);
  } else if (type === "gauge") {
    return gauge(s.title, s.position, s.filter, s.scan);
  } else if (type === "banner") {
    return banner(s.position, s.content);
  } else {
    return null;
  }
}

function parseDashboards(config) {
  const dashboardNames = Object.keys(config);

  return dashboardNames.map(dashboard => ({
    title: dashboard.toUpperCase(),
    pannels: config[dashboard]
      .map(config => parseDashboardFunction(dashboard, config))
      .filter(Boolean),
  }));
}

export const Dashboards = {
  SystemDashboard,
  parseDashboards,
};
