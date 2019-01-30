import React, { Component } from "react";
import {
  CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  convertFromHTML
} from "draft-js";

const styles = {
  root: {
    fontFamily: "'Helvetica', sans-serif",
    padding: 20,
    width: 600
  },
  editor: {
    border: "1px solid #ccc",
    cursor: "text",
    minHeight: 80,
    padding: 10
  },
  button: {
    marginTop: 10,
    textAlign: "center"
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.decorator = new CompositeDecorator([
      {
        strategy: this.findLinkEntities,
        component: this.Link
      },
      {
        strategy: this.findImageEntities,
        component: this.Image
      }
    ]);

    this.state = {
      editorState: "",
      previewState: EditorState.createEmpty()
    };
    this.setEditorRef = ref => (this.editor = ref);
    this.editorFocus = () => this.editor.focus();
  }

  onChange = e => {
    let htmlString = e.target.value;

    let newState = {};
    if (!htmlString) {
      newState = {
        editorState: htmlString,
        previewState: EditorState.createEmpty()
      };
    } else {
      const blocksFromHTML = convertFromHTML(htmlString);
      if (blocksFromHTML.contentBlocks) {
        const newPreviewState = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap
        );
        newState = {
          editorState: htmlString,
          previewState: EditorState.createWithContent(
            newPreviewState,
            this.decorator
          )
        };
      } else {
        newState = {
          editorState: htmlString,
          previewState: EditorState.createEmpty()
        };
      }
    }
    this.setState(newState);
  };

  render() {
    return (
      <div style={styles.root}>
        <textarea
          value={this.state.editorState}
          onChange={this.onChange}
          ref={this.setEditorRef}
          style={{ fontSize: "20px", width: "600px", height: "300px" }}
        />
        <div style={{ marginBottom: 10 }}>
          Sample HTML converted into Draftjs content preview
        </div>
        <div style={styles.editor}>
          <Editor
            editorState={this.state.previewState}
            ref={this.setPreviewRef}
            readOnly
          />
        </div>
      </div>
    );
  }

  findLinkEntities = (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === "LINK"
      );
    }, callback);
  };

  Link = props => {
    const { url } = props.contentState.getEntity(props.entityKey).getData();
    return (
      <a href={url} style={styles.link} target="_blank">
        {props.children}
      </a>
    );
  };
  findImageEntities = (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === "IMAGE"
      );
    }, callback);
  };
  Image = props => {
    const { height, src, width } = props.contentState
      .getEntity(props.entityKey)
      .getData();
    return <img src={src} height={height} width={width} alt="aaa" />;
  };
}

export default App;
