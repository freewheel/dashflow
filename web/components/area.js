/* global React */

const TEXTAREA_LINE_BREAK = String.fromCharCode(13, 10);

export class ReadOnlyArea extends React.Component {
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

    const textareaRef = this.textareaRef;
    return React.createElement("textarea", {
      ref: textareaRef,
      className: "read-only-area",
      readOnly: true,
      value: lines.join(TEXTAREA_LINE_BREAK),
    });
  }
}

export const EditableArea = ({ value, onChange }) =>
  React.createElement("textarea", {
    className: "editable-area",
    value,
    onChange: event => {
      onChange(event.target.value);
    },
  });
