/* global React */

import { Components } from "../components/index.js";
import { Utils } from "../utils.js";

const Events = ({ events, globalFilterValue, globalFilterValid }) => {
  const globalFilterPattern = globalFilterValid ? new RegExp(globalFilterValue) : new RegExp('');

  const eventsAfterFilter = events
    .filter(evt => globalFilterPattern.test(evt.e))
    .map(evt => `${evt.t} ${Utils.trimLineBreaks(Utils.stripAnsi(evt.e))}`);

  return React.createElement(Components.Panel, {
    title: React.createElement(
      "div",
      {
        className: "text"
      },
      "Events"
    ),
    pill: React.createElement(
      "span",
      {
        className: "tooltip tooltip-left",
        "data-tooltip": "showing latest 200 events",
      },
      `${events.length} Events`
    ),
    style: {
      top: 0,
      left: 0,
      width: "100%",
      height: "50%",
    },
    content: React.createElement(Components.ReadOnlyArea, {
      lines: eventsAfterFilter.slice(-200),
    }),
  });
};

const DashboardsConfig = ({ dashboardsYAML, updateDashboardsYAML }) =>
  React.createElement(Components.Panel, {
    title: React.createElement(
      "span",
      {
        className: "tooltip tooltip-right",
        "data-tooltip": "editable, change will be applied",
      },
      React.createElement(
        "div",
        {
          className: "text"
        },
        "Dashboards Config"
      ),
    ),
    style: {
      top: "50%",
      left: 0,
      width: "100%",
      height: "50%",
    },
    content: React.createElement(Components.EditableArea, {
      value: dashboardsYAML,
      onChange: updateDashboardsYAML,
    }),
  });

export const SystemDashboard = {
  title: "SYSTEM",
  pannels: [Components.pure(Events), Components.pure(DashboardsConfig)],
};
