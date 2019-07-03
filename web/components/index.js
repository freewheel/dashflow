/* eslint-env browser */
/* global React */

import { ReadOnlyArea, EditableArea } from './area.js'
import { Panel } from './panel.js';
import { Dashboard } from './dashboard.js';
import { Errors } from './errors.js';
import { pure, PureHeader } from './pure.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    props.store.subscribe(() => {
      this.forceUpdate();
    });
  }

  render() {
    const { store } = this.props;
    const {
      dashboards,
      dashboardsYAML,
      events,
      globalFilterValue,
      globalFilterValid,
      currentDashboardTitle,
      errorMessages,
    } = store;

    const updateGlobalFilter = store.updateGlobalFilter.bind(store);
    const updateCurrentDashboardTitle = store.updateCurrentDashboardTitle.bind(
      store
    );
    const updateDashboardsYAML = store.updateDashboardsYAML.bind(store);
    const clearErrorMessages = store.clearErrorMessages.bind(store);

    if (dashboards.length === 0) {
      return [
        React.createElement(Errors, {
          messages: errorMessages,
          onClear: clearErrorMessages,
        }),
        React.createElement(
          "div",
          {
            className: "loading loading-lg app",
          },
          "Loading"
        ),
      ];
    }

    let currentDashboard =
      dashboards.find(
        dashboard => dashboard.title === currentDashboardTitle
      ) || dashboards[0];

    return [
      React.createElement(Errors, {
        messages: errorMessages,
        onClear: clearErrorMessages,
      }),
      React.createElement(PureHeader, {
        dashboards,
        currentDashboardTitle: currentDashboard.title,
        updateCurrentDashboardTitle,
        globalFilterValue,
        globalFilterValid,
        updateGlobalFilter,
      }),
      React.createElement(Dashboard, {
        key: currentDashboard.title,
        pannels: currentDashboard.pannels,
        events,
        globalFilterValue,
        globalFilterValid,
        dashboardsYAML,
        updateDashboardsYAML,
      }),
    ];
  }
}

export const Components = {
  ReadOnlyArea,
  EditableArea,
  Panel,
  Dashboard,
  App,
  pure,
};
