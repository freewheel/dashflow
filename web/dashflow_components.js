/* eslint-env browser */
/* global React */
(function components() {
  const TEXTAREA_LINE_BREAK = String.fromCharCode(13, 10);

  class ReadOnlyArea extends React.Component {
    constructor(props) {
      super(props);
      this.textareaRef = React.createRef();
      this.autoScrolling = true;
    }

    componentDidMount() {
      const self = this;
      const textarea = this.textareaRef.current;
      textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
      textarea.onscroll = function setAutoScrolling() {
        if (this.scrollTop + this.clientHeight === this.scrollHeight) {
          self.autoScrolling = true;
        } else {
          self.autoScrolling = false;
        }
      };
    }

    componentDidUpdate() {
      if (this.autoScrolling) {
        const textarea = this.textareaRef.current;
        textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
      }
    }

    render() {
      const { lines } = this.props;

      return React.createElement("textarea", {
        ref: this.textareaRef,
        className: "read-only-area",
        readOnly: true,
        value: lines.join(TEXTAREA_LINE_BREAK),
      });
    }
  }

  const EditableArea = ({ value, onChange }) =>
    React.createElement("textarea", {
      ref: this.textareaRef,
      className: "editable-area",
      value,
      onChange: event => {
        onChange(event.target.value);
      },
    });

  const pure = (BaseComponent, keys = undefined) => {
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

  const Panel = ({ title, content, style, className }) => {
    const { top, left, width, height } = style;

    return React.createElement(
      "div",
      {
        className: "dash-panel",
        style: { top, left, width, height }
      },
      [
        title &&
          React.createElement(
            "div",
            {
              className: `${className} title`
            },
            title
          ),
        React.createElement(
          "div",
          {
            className: 'content',
          },
          content
        ),
      ].filter(Boolean)
    );
  };

  const Dashboard = ({
    events,
    globalFilter,
    pannels,
    dashboardsYAML,
    updateDashboardsYAML,
  }) =>
    React.createElement(
      "div",
      { className: 'dashboard-container' },
      React.createElement(
        "div",
        { className: 'dashboard-wrapper' },
        pannels.map((renderer, index) =>
          React.createElement(renderer, {
            events,
            globalFilter,
            index,
            dashboardsYAML,
            updateDashboardsYAML,
          })
        )
      )
    );

  const Header = ({
    dashboards,
    currentDashboardTitle,
    updateCurrentDashboardTitle,
    globalFilter,
    updateGlobalFilter,
  }) => {
    return React.createElement(
      "header",
      {
        className: 'navbar dash-header'
      },
      [
        React.createElement(
          "section",
          { className: "navbar-section" },
          dashboards.map(({ title }) => {
            const active = title === currentDashboardTitle;
            const onClick = event => {
              updateCurrentDashboardTitle(title);

              event.preventDefault();
            };

            return React.createElement(
              "a",
              {
                key: title,
                href: `#${title}`,
                className: "btn btn-link",
                onClick: onClick,
                style: { fontWeight: active ? "900" : "normal" },
              },
              title
            );
          })
        ),
        React.createElement(
          "section",
          {
            className: "navbar-center",
          },
          React.createElement(
            "a",
            {
              href: "#",
              className: "logo",
              target: "_blank",
            },
            "Dashflow"
          )
        ),
        React.createElement(
          "section",
          { className: "navbar-section" },
          React.createElement(
            "div",
            { className: "input-group input-inline" },
            React.createElement("input", {
              className: "form-input",
              type: "text",
              value: globalFilter,
              onChange: event => {
                updateGlobalFilter(event.target.value);
              },
              placeholder: "filter by regexp",
            })
          )
        ),
      ]
    );
  };

  const PureHeader = pure(Header, [
    "dashboards",
    "currentDashboardTitle",
    "globalFilter",
  ]);

  const Errors = ({ messages, onClear }) => {
    if (messages.length > 0) {
      return React.createElement(
        "div",
        { className: "title error" },
        [
          React.createElement("button", {
            key: "clear",
            className: "btn btn-clear float-right",
            onClick: onClear,
          }),
        ].concat(
          messages.map(message =>
            React.createElement("p", { key: message }, message)
          )
        )
      );
    } else {
      return React.createElement("noscript");
    }
  };

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
        globalFilter,
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
          globalFilter,
          updateGlobalFilter,
        }),
        React.createElement(Dashboard, {
          key: currentDashboard.title,
          pannels: currentDashboard.pannels,
          events,
          globalFilter,
          dashboardsYAML,
          updateDashboardsYAML,
        }),
      ];
    }
  }

  const Components = {
    ReadOnlyArea,
    EditableArea,
    Panel,
    Dashboard,
    App,
    pure,
  };

  window.Components = Components;
})();
