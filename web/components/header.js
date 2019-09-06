/* global React */

export const Header = ({
  dashboards,
  currentDashboardTitle,
  updateCurrentDashboardTitle,
  globalFilterValue,
  globalFilterValid,
  updateGlobalFilter,
}) => {
  return React.createElement(
    "header", { className: "dash-header", },
    [
      React.createElement(
        "section", { className: "header-left" },
        [
          React.createElement(
            "img",
            {
              className: "logo",
              src: "../logo/dashflow-nav.png"
            }
          ),
            React.createElement(
              "div", { className: "dropdown" },
              [
                React.createElement("div", { className: "active-item item" }, currentDashboardTitle),
                React.createElement("ul", { className: "inactive-items" },
                  dashboards.map(({ title }) => {
                    if (title === currentDashboardTitle) return;
                    return React.createElement(
                      "li",
                      {
                        className: "item",
                        key: title,
                        href: `#${title}`,
                        onClick: event => {
                          updateCurrentDashboardTitle(title);
                          event.preventDefault();
                        },
                      },
                      title
                    );
                  })
                )
              ]
            )
        ]
        
      ),
      React.createElement(
        "div", { className: "header-right" },
        React.createElement(
          "div", { className: `filter ${ !globalFilterValid ? 'invalid' : ''}` },
          React.createElement(
            "input",
            {
              className: 'input',
              type: "text",
              value: globalFilterValue,
              onChange: event => {
                updateGlobalFilter(event.target.value);
              },
              placeholder: "REGEX FILTER",
            }
          )
        )
      ),
    ]
  );
};