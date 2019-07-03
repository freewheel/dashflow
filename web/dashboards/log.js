/* global React */

import { Components } from '../components/index.js';
import { Utils } from '../utils.js';
import { getGaugeDisplay } from './gauge.js';

export function log(title, positionSpec, logFilter, gauge, limit = 500) {
    const logPattern = new RegExp(logFilter);

    return Components.pure(
      function getLogGauge({ events, globalFilterValue, globalFilterValid }) {
        const globalFilterPattern = globalFilterValid ? new RegExp(globalFilterValue) : new RegExp('');

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
      ["events", "globalFilterValue", "globalFilterValid"]
    );
  }