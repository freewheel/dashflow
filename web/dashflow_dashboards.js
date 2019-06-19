/* eslint-env browser */
/* global React, Utils, Components */
(function dashboards() {
  const Events = ({ events, globalFilter }) => {
    const globalFilterPattern = new RegExp(globalFilter);

    const eventsAfterFilter = events
      .filter(evt => globalFilterPattern.test(evt.e))
      .map(evt => `${evt.t} ${Utils.trimLineBreaks(Utils.stripAnsi(evt.e))}`);

    return React.createElement(Components.Panel, {
      title: 'Events',
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
        "Dashboards Config"
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

  const SystemDashboard = {
    title: "SYSTEM",
    pannels: [Components.pure(Events), Components.pure(DashboardsConfig)],
  };

  function banner(positionSpec, content) {
    return Components.pure(function getBanner() {
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
    });
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
            title
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
            React.createElement(
              "div",
              { className: `toast toast-${level}` },
              text
            )
          ),
        });
      },
      ["events"]
    );
  }

  // LOG WITH GAUGE SUPPORT

  function log(title, positionSpec, logFilter, gauge, limit = 500) {
    const logPattern = new RegExp(logFilter);

    return Components.pure(
      function getLogGauge({ events, globalFilter }) {
        const globalFilterPattern = new RegExp(globalFilter);

        let className = "";
        let gaugeText = "";

        if (gauge) {
          const gaugePattern = new RegExp(gauge.filter);

          const { level, text } = getGaugeDisplay(
            gauge.scan,
            events
              .filter(e => gaugePattern.test(Utils.stripAnsi(e.e)))
              .map(({ e }) => Utils.stripAnsi(e))
          );

          gaugeText = text;
          className = level;
        }

        return React.createElement(Components.Panel, {
          title: React.createElement(
            "span",
            {
              className: "tooltip tooltip-right",
              "data-tooltip": `filter: "${logFilter}"`,
            },
            title
          ),
          pill: gaugeText,
          style: Utils.positionSpecToStyle(positionSpec),
          className,
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
      ["events", "globalFilter"]
    );
  }

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

  const Dashboards = {
    SystemDashboard,
    parseDashboards,
  };

  window.Dashboards = Dashboards;
})();
