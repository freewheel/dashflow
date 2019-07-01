/* global React */

import { Components } from '../components/index.js';
import { Utils } from '../utils.js';

export function getGaugeDisplay(scan, lines) {
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

export function gauge(title, positionSpec, filter, scan) {
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