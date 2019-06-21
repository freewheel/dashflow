/* global React */

import { Components } from '../components/index.js';
import { Utils } from '../utils.js';

export function banner(positionSpec, content) {
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