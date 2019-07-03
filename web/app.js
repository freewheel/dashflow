/* eslint-env browser */
/* global React, ReactDOM, jsyaml */

import { Utils } from "./utils.js";
import { Components } from "./components/index.js";
import { Dashboards } from "./dashboards/index.js";

const notifyThrottle = Utils.throttleFactory(500);

export function createStore() {
  return {
    dashboards: [],
    dashboardsYAML: null,
    currentDashboardTitle: null,
    globalFilterValue: "",
    globalFilterValid: true,
    events: [],
    errorMessages: [],
    subscribers: [],
    subscribe: function subscribe(subscriber) {
      this.subscribers.push(subscriber);
    },
    notifySubscribers: function notifySubscribersWithThrottle(
      realtime = false
    ) {
      const self = this;

      if (realtime) {
        self.subscribers.forEach(subscriber => subscriber());
      } else {
        notifyThrottle(function notifySubscribers() {
          self.subscribers.forEach(subscriber => subscriber());
        });
      }
    },
    appendEvent: function appendEvent(event) {
      this.appendEvents([event]);
    },
    appendEvents: function appendEvents(evts) {
      this.events = this.events.concat(evts);
      this.notifySubscribers();
    },
    resetEvents: function resetEvents() {
      this.events = [];
      this.notifySubscribers();
    },
    updateDashboards: function updateDashboards(
      dashboards,
      dashboardsYAML = null
    ) {
      this.dashboardsYAML =
        dashboardsYAML || jsyaml.safeDump(dashboards, { flowLevel: 2 });
      this.dashboards = Dashboards.parseDashboards(dashboards).concat([
        Dashboards.SystemDashboard,
      ]);

      this.notifySubscribers(true);
    },
    updateGlobalFilter: function updateGlobalFilter(filter) {
      this.globalFilterValue = filter;

      try {
        new RegExp(filter);
        this.globalFilterValid = true;
      } catch (e) {
        this.globalFilterValid = false;
      }

      this.notifySubscribers(true);
    },
    updateCurrentDashboardTitle: function updateCurrentDashboardTitle(title) {
      this.currentDashboardTitle = title;

      this.notifySubscribers(true);
    },
    updateDashboardsYAML: function updateDashboardsYAML(dashboardsYAML) {
      try {
        const config = jsyaml.safeLoad(dashboardsYAML);

        this.updateDashboards(config, dashboardsYAML);
      } catch (err) {
        this.dashboardsYAML = dashboardsYAML;

        this.notifySubscribers(true);
      }
    },
    addErrorMessage: function addErrorMessage(message) {
      this.errorMessages.push(message);

      this.notifySubscribers(true);
    },
    clearErrorMessages: function clearErrorMessages() {
      this.errorMessages = [];

      this.notifySubscribers(true);
    },
  };
}

export function render(store) {
  ReactDOM.render(
    React.createElement(Components.App, { store }),
    document.getElementById("app")
  );
}
