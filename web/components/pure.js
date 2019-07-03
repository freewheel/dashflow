/* global React */

import { Header } from './header.js';

export const pure = (BaseComponent, keys = undefined) => {
  return class Decorated extends React.Component {
    shouldComponentUpdate(nextProps) {
      let changed = false;

      if (keys) {
        for (let p of keys) {
          if (this.props[p] !== nextProps[p]) {
            changed = true;
          }
        }
      } else {
        for (let p in this.props) {
          if (this.props[p] !== nextProps[p]) {
            changed = true;
          }
        }
      }

      return changed;
    }

    render() {
      return React.createElement(
        BaseComponent,
        this.props,
        this.props.children
      );
    }
  };
};

export const PureHeader = pure(Header, [
  "dashboards",
  "currentDashboardTitle",
  "globalFilterValue",
  "globalFilterValid",
]);