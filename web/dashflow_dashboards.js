/* eslint-env browser */
/* global React, Utils, Components */
(function dashboards() {
  const LatestEvents = ({ events, globalFilter }) => {
    const globalFilterPattern = new RegExp(globalFilter);

    const eventsAfterFilter = events
      .filter(evt => globalFilterPattern.test(evt.e))
      .map(evt => `${evt.t} ${Utils.trimLineBreaks(Utils.stripAnsi(evt.e))}`);

    return React.createElement(Components.Panel, {
      title: React.createElement(
        "span",
        {
          className: "tooltip tooltip-right",
          "data-tooltip": "showing latest 100 events",
        },
        "LATEST EVENTS"
      ),
      style: {
        top: 0,
        left: 0,
        width: "100%",
        height: "50%",
      },
      colorDepth: 0,
      content: React.createElement(Components.ReadOnlyArea, {
        lines: eventsAfterFilter.slice(-100),
      }),
    });
  };

  const TotalEvents = ({ events }) =>
    React.createElement(Components.Panel, {
      title: "TOTAL EVENTS",
      style: {
        top: 0,
        left: "85%",
        width: "15%",
        height: "10%",
      },
      colorDepth: 1,
      content: React.createElement(
        "div",
        { style: { padding: ".4em", color: "#fff" } },
        String(events.length)
      ),
    });

  const DashboardsConfig = ({ dashboardsYAML, updateDashboardsYAML }) =>
    React.createElement(Components.Panel, {
      title: React.createElement(
        "span",
        {
          className: "tooltip tooltip-right",
          "data-tooltip": "editable, change will be applied",
        },
        "DASHBOARDS CONFIG"
      ),
      style: {
        top: "50%",
        left: 0,
        width: "100%",
        height: "50%",
      },
      colorDepth: 2,
      content: React.createElement(Components.EditableArea, {
        value: dashboardsYAML,
        onChange: updateDashboardsYAML,
      }),
    });

  const SystemDashboard = {
    title: "SYSTEM",
    pannels: [
      Components.pure(LatestEvents),
      Components.pure(TotalEvents),
      Components.pure(DashboardsConfig),
    ],
  };

  function banner(positionSpec, content) {
    return Components.pure(
      function getBanner({ index }) {
        return React.createElement(Components.Panel, {
          style: Utils.positionSpecToStyle(positionSpec),
          colorDepth: index,
          content: React.createElement(
            "div",
            {
              style: {
                fontSize: "1.2em",
                padding: ".2em",
                fontWeight: 500,
              },
            },
            content
          ),
        });
      },
      ["index"]
    );
  }

  // LOG

  function log(title, positionSpec, filter, limit = 500) {
    const pattern = new RegExp(filter);

    return Components.pure(
      function getLog({ events, globalFilter, index }) {
        const globalFilterPattern = new RegExp(globalFilter);

        return React.createElement(Components.Panel, {
          title: React.createElement(
            "span",
            {
              className: "tooltip tooltip-right",
              "data-tooltip": `filter: "${filter}"`,
            },
            title.toUpperCase()
          ),
          style: Utils.positionSpecToStyle(positionSpec),
          colorDepth: index,
          content: React.createElement(Components.ReadOnlyArea, {
            lines: events
              .filter(
                e =>
                  pattern.test(e.e) &&
                  e.h !== undefined &&
                  globalFilterPattern.test(e.h)
              )
              .map(({ h }) => Utils.normalizeLineBreaks(Utils.stripAnsi(h)))
              .join("")
              .split("\n")
              .slice(-limit),
          }),
        });
      },
      ["events", "globalFilter", "index"]
    );
  }

  // GAUGE

  function getGaugeDisplay(scan, lines) {
    const normalizedScan = {
      when:
        scan.when &&
        scan.when.map(test => ({
          pattern: new RegExp(test.pattern),
          text: test.text,
          color: test.color || "grey",
        })),
      default: {
        text: (scan.default && scan.default.text) || "Unknown",
        color: (scan.default && scan.default.color) || "grey",
      },
    };
    for (let i = lines.length - 1; i >= 0; i--) {
      for (let test of normalizedScan.when) {
        if (test.pattern.test(lines[i])) {
          return {
            text: test.text,
            color: test.color,
          };
        }
      }
    }

    return normalizedScan.default;
  }

  function mapColorToClass(color) {
    if (color === "yellow") {
      return "toast-warning";
    } else if (color === "green") {
      return "toast-success";
    } else if (color === "red") {
      return "toast-error";
    } else {
      return "";
    }
  }

  function gauge(title, positionSpec, filter, scan) {
    const pattern = new RegExp(filter);

    return Components.pure(
      function getGauge({ events, index }) {
        const { color, text } = getGaugeDisplay(
          scan,
          events
            .filter(e => pattern.test(Utils.stripAnsi(e.e)))
            .map(({ e }) => Utils.stripAnsi(e))
        );

        return React.createElement(Components.Panel, {
          title: React.createElement(
            "span",
            {
              className: "tooltip tooltip-bottom",
              "data-tooltip": `filter: "${filter}"`,
            },
            title.toUpperCase()
          ),
          style: Utils.positionSpecToStyle(positionSpec),
          colorDepth: index,
          content: React.createElement(
            "span",
            {
              style: {
                padding: ".2em",
                cursor: "default",
                textTransform: "uppercase",
              },
            },
            React.createElement(
              "div",
              { className: `toast ${mapColorToClass(color)}` },
              text
            )
          ),
        });
      },
      ["events", "index"]
    );
  }

  // LOG GAUGE

  function logGauge(title, positionSpec, logFilter, gaugeFilter, scan, limit = 500) {
    const logPattern = new RegExp(logFilter);
    const gaugePattern = new RegExp(gaugeFilter);

    return Components.pure(
      function getLogGauge({ events, globalFilter }) {
        const globalFilterPattern = new RegExp(globalFilter);

        const { color, text } = getGaugeDisplay(
          scan,
          events
            .filter(e => gaugePattern.test(Utils.stripAnsi(e.e)))
            .map(({ e }) => Utils.stripAnsi(e))
        );

        return React.createElement(Components.Panel, {
          title: React.createElement(
            "span",
            {
              className: 'tooltip tooltip-right',
              "data-tooltip": `filter: "${logFilter}"`,
            },
            `${title}: ${text}`.toUpperCase()
          ),
          style: Utils.positionSpecToStyle(positionSpec),
          className: `toast ${mapColorToClass(color)}`,
          content: React.createElement(Components.ReadOnlyArea, {
            lines: events
              .filter(
                e =>
                logPattern.test(e.e) &&
                  e.h !== undefined &&
                  globalFilterPattern.test(e.h)
              )
              .map(({ h }) => Utils.normalizeLineBreaks(Utils.stripAnsi(h)))
              .join("").split("\n").slice(-limit),
          }),
        });
      },
      ["events", "globalFilter", "index"]
    );
  }

  function parseDashboardFunction(title, spec) {
    const types = Object.keys(spec);

    const type = types[0];
    const s = spec[type];

    if (type === "log") {
      return log(s.title, s.position, s.filter, s.limit || 500);
    } else if (type === "gauge") {
      return gauge(s.title, s.position, s.filter, s.scan);
    } else if (type === "banner") {
      return banner(s.position, s.content);
    } else if (type === "logGauge") {
      return logGauge(s.title, s.position, s.logFilter, s.gaugeFilter, s.scan, s.limit || 500);
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

  const Dashboards = {
    SystemDashboard,
    parseDashboards,
  };

  window.Dashboards = Dashboards;
})();
