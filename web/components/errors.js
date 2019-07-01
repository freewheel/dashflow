/* global React */

export const Errors = ({ messages, onClear }) => {
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