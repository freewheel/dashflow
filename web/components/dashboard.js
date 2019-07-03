/* global React */

export const Dashboard = ({
  events,
  globalFilterValue,
  globalFilterValid,
  pannels,
  dashboardsYAML,
  updateDashboardsYAML,
}) =>
  React.createElement(
    "div",
    { className: "dashboard-container" },
    React.createElement(
      "div",
      { className: "dashboard-wrapper" },
      pannels.map(renderer =>
        React.createElement(renderer, {
          events,
          globalFilterValue,
          globalFilterValid,
          dashboardsYAML,
          updateDashboardsYAML,
        })
      )
    )
  );