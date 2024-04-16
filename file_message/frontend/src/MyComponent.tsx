import './message.css'
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"

import {
  useMessageInputContext,
  useComponentContext,
  AttachmentPreviewList as DefaultAttachmentPreviewList,
  LinkPreviewList as DefaultLinkPreviewList,
} from 'stream-chat-react';

const AttachmentUploadButton = () => {
  const { uploadNewFiles, isUploadEnabled, maxFilesLeft } = useMessageInputContext();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;

    if (files && files.length > 0) {
      uploadNewFiles(files);
    }
  }

  if (maxFilesLeft === 0) {
    return null;
  }

  return (
    <label className='message-input__button'>
      <input type='file' className='visually-hidden' onChange={handleChange} />
      📎
    </label>
  );
};



const CustomAttachmentPreviewList = () => {
  const { fileOrder = [], imageOrder = [] } = useMessageInputContext();

  if (fileOrder.length === 0 && imageOrder.length === 0) {
    return null;
  }

  return (
    <ul className='message-input__attachments'>
      {imageOrder.map((id) => (
        <li className='message-input__attachment' key={id}>
          <ImageAttachmentPreview id={id} />
        </li>
      ))}
      {fileOrder.map((id) => (
        <li key={id}>
          <FileAttachmentPreview id={id} />
        </li>
      ))}
    </ul>
  );
};

const ImageAttachmentPreview = ({ id }: { id: string }) => {
  const { imageUploads } = useMessageInputContext();
  const image = imageUploads[id];
  const url = image.previewUri ?? image.url ?? 'fallback.webm';

  return (
    <div
      className='message-input__attachment-preview message-input__attachment-preview_image'
      style={{ backgroundImage: `url(${url})` }}
      aria-label={image.file.name}
    >
      <AttachmentActions attachment={image} type='image' />
    </div>
  );
};

const FileAttachmentPreview = ({ id }: { id: string }) => {
  const { fileUploads } = useMessageInputContext();
  const attachment = fileUploads[id];

  return (
    <div className='message-input__attachment-preview message-input__attachment-preview_file'>
      📄 {attachment.file.name} <br />({attachment.file.size} bytes)
      <AttachmentActions attachment={attachment} type='file' />
    </div>
  );
};

const AttachmentActions = ({ type, attachment }) => {
  const { removeImage, uploadImage, removeFile, uploadFile } = useMessageInputContext();
  let [remove, upload] = type === 'image' ? [removeImage, uploadImage] : [removeFile, uploadFile];
  let children = null;

  if (attachment.state === 'uploading') {
    children = <div className='message-input__attachment-action'>Loading...</div>;
  }

  if (attachment.state === 'finished') {
    children = (
      <>
        <a
          className='message-input__attachment-action'
          href={attachment.url}
          target='_blank'
          rel='noreferrer'
        >
          📥
        </a>
        <button className='message-input__attachment-action' onClick={() => remove(attachment.id)}>
          ❌
        </button>
      </>
    );
  }

  if (attachment.state === 'failed') {
    <button className='message-input__attachment-action' onClick={() => upload(attachment.id)}>
      Failed. Retry?
    </button>;
  }

  return <div className='message-input__attachment-actions'>{children}</div>;
};


const CustomMessageInput = () => {
  const { text, handleChange, handleSubmit } = useMessageInputContext();
  const { AttachmentPreviewList = DefaultAttachmentPreviewList } = useComponentContext();

  return (
    <div className='message-input'>
      <div className='message-input__composer'>
        <AttachmentUploadButton />
        <textarea className='message-input__input' value={text} onChange={handleChange} />
        <button type='button' className='message-input__button' onClick={handleSubmit}>
          ⬆️
        </button>
      </div>
      <CustomAttachmentPreviewList />
    </div>
  );
};



interface State {
  isFocused: boolean
}

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class MyComponent extends StreamlitComponentBase<State> {
  public state = { isFocused: false }

  public render = (): ReactNode => {
    // Arguments that are passed to the plugin in Python are accessible
    // via `this.props.args`. Here, we access the "name" arg.
    const name = this.props.args["name"]

    // Streamlit sends us a theme object via props that we can use to ensure
    // that our component has visuals that match the active theme in a
    // streamlit app.
    const { theme } = this.props
    const style: React.CSSProperties = {}

    // Maintain compatibility with older versions of Streamlit that don't send
    // a theme object.
    if (theme) {
      // Use the theme object to style our button border. Alternatively, the
      // theme style is defined in CSS vars.
      const borderStyling = `1px solid ${this.state.isFocused ? theme.primaryColor : "gray"
        }`
      style.border = borderStyling
      style.outline = borderStyling
    }

    // Show a chat input component. There is a message box, a send button, and a attachment button for attaching images and other files.
    return (
      <div>
        <CustomMessageInput/>
      </div>
    );
  }

}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(MyComponent)
