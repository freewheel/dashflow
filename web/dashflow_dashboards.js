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
      className: `title`,
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
      className: `title`,
      content: React.createElement(
        "div",
        { style: { padding: ".4em", color: "#000" } },
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
      className: `title`,
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
      function getBanner() {
        return React.createElement(Components.Panel, {
          style: Utils.positionSpecToStyle(positionSpec),
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
      function getLog({ events, globalFilter }) {
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
          className: `title`,
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
          level: test.level,
        })),
      default: {
        text: (scan.default && scan.default.text) || "Unknown",
        level: (scan.default && scan.default.level) || "",
      },
    };
    for (let i = lines.length - 1; i >= 0; i--) {
      for (let test of normalizedScan.when) {
        if (test.pattern.test(lines[i])) {
          return {
            text: test.text,
            level: test.level,
          };
        }
      }
    }

    return normalizedScan.default;
  }

  function gauge(title, positionSpec, filter, scan) {
    const pattern = new RegExp(filter);

    return Components.pure(
      function getGauge({ events }) {
        const { level, text } = getGaugeDisplay(
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
          content: React.createElement(
            "span",
            {
              style: {
                padding: ".2em",
                cursor: "default",
                textTransform: "uppercase",
              },
            },
            React.createElement("div", { className: level }, text)
          ),
        });
      },
      ["events", "index"]
    );
  }

  // LOG GAUGE

  function logGauge(
    title,
    positionSpec,
    logFilter,
    gaugeFilter,
    scan,
    limit = 500
  ) {
    const logPattern = new RegExp(logFilter);
    const gaugePattern = new RegExp(gaugeFilter);

    return Components.pure(
      function getLogGauge({ events, globalFilter }) {
        const globalFilterPattern = new RegExp(globalFilter);

        const { level, text } = getGaugeDisplay(
          scan,
          events
            .filter(e => gaugePattern.test(Utils.stripAnsi(e.e)))
            .map(({ e }) => Utils.stripAnsi(e))
        );

        return React.createElement(Components.Panel, {
          title: React.createElement(
            "span",
            {
              className: "tooltip tooltip-right",
              "data-tooltip": `filter: "${logFilter}"`,
            },
            `${title}: ${text}`.toUpperCase()
          ),
          style: Utils.positionSpecToStyle(positionSpec),
          className: level,
          content: React.createElement(Components.ReadOnlyArea, {
            lines: events
              .filter(
                e =>
                  logPattern.test(e.e) &&
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

  function parseDashboardFunction(title, spec) {
    const types = Object.keys(spec);

    const type = types[0];
    const s = spec[type];

    if (type === "log") {
      if (s.gauge) {
        return logGauge(
          s.title,
          s.position,
          s.filter,
          s.gauge.filter,
          s.gauge.scan,
          s.limit || 500
        );
      }
      return log(s.title, s.position, s.filter, s.limit || 500);
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

  const Dashboards = {
    SystemDashboard,
    parseDashboards,
  };

  window.Dashboards = Dashboards;
})();
