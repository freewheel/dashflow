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
                React.createElement("div", { className: "active-item item" }, 
                  [
                    React.createElement("span", { className: "text" }, currentDashboardTitle),
                    React.createElement("div", { className: "arrow down" })
                  ]
                ),
                React.createElement("ul", { className: "inactive-items" },
                  dashboards.map(({ title }) => {
                    const inactive = (title === currentDashboardTitle) ? 'inactive' : '';
                    return React.createElement(
                      "li",
                      {
                        className: `item ${inactive}`,
                        key: title,
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