/* global React */

export const Panel = ({ title, pill, content, style, className }) => {
  const { top, left, width, height } = style;

  return React.createElement(
    "div",
    {
      className: "dash-panel",
      style: { top, left, width, height },
    },
    [
      title &&
        React.createElement(
          "div",
          {
            className: `${className} title`,
          },
          [
            title,
            pill && React.createElement(
              "span",
              {
                className: 'pill'
              },
              pill
            )
          ]
        ),
      React.createElement(
        "div",
        {
          className: "content",
        },
        content
      ),
    ].filter(Boolean)
  );
};