/* global React */

export const Header = ({
  dashboards,
  currentDashboardTitle,
  updateCurrentDashboardTitle,
  globalFilter,
  updateGlobalFilter,
}) => {
  return React.createElement(
    "header",
    {
      className: "navbar dash-header",
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
            href: "https://github.com/freewheel/dashflow",
            className: "logo",
            target: "_blank",
          },
          React.createElement("img", {
            src: "/logo/dashflow-icon-32x32.png",
            alt: "Dashflow",
          })
        )
      ),
      React.createElement(
        "section",
        { className: "navbar-section" },
        React.createElement(
          "div",
          { className: "filter" },
          React.createElement("input", {
            className: "input",
            type: "text",
            value: globalFilter,
            onChange: event => {
              updateGlobalFilter(event.target.value);
            },
            placeholder: "REGEX FILTER",
          })
        )
      ),
    ]
  );
};