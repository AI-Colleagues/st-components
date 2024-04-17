import "./component.css"

import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"

interface FileWithPreview extends File {
  previewUrl: string
  originalFile: File
}

interface State {
  isFocused: boolean
  message: string
  files: FileWithPreview[]
}

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class FileChatInput extends StreamlitComponentBase<State> {
  public state = { message: "", isFocused: false, files: [] }

  public render = (): ReactNode => {
    // Arguments that are passed to the plugin in Python are accessible
    // via `this.props.args`.
    const hint = this.props.args["hint"]

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
      const borderStyling = `1px solid ${
        this.state.isFocused ? theme.primaryColor : "gray"
      }`
      style.border = borderStyling
      style.outline = borderStyling
    }

    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex", // Ensures horizontal layout
            flexDirection: "row", // Explicitly set to row for horizontal stacking
            width: "100%",
            alignItems: "center", // Align items vertically in the center
            justifyContent: "flex-start", // Align items to the start of the container
          }}
        >
          {this.state.files.map((file: FileWithPreview, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                display: "inline-block",
                marginRight: "5px",
              }}
            >
              <img
                src={file.previewUrl}
                style={{ maxWidth: "100px", maxHeight: "100px" }}
                alt="preview"
              />
              <button
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  width: "20px", // Set a fixed width
                  height: "20px", // Set a fixed height to match the width
                  borderRadius: "50%", // Make the button round
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0", // Remove padding to center the '✖' symbol
                }}
                onClick={() => this.removeFile(file)}
              >
                ✖
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row", // Maintain row layout for the controls
            width: "100%", // Expand the container to full width
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            multiple
            onChange={this.handleFileChange}
          />

          <button
            className="message-input__button"
            onClick={() => {
              const fileInput = document.getElementById("fileInput")
              if (fileInput) fileInput.click()
            }}
          >
            📎
          </button>
          <input
            type="text"
            className="message-input__input"
            placeholder={hint}
            // style={{ flexGrow: 1, margin: '0 10px' }}
            onChange={this.handleMessageChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                this.onClicked()
              }
            }}
            value={this.state.message}
          />
          <button
            onClick={this.onClicked}
            type="button"
            className="message-input__button"
          >
            🚀
          </button>
        </div>
      </div>
    )
  }

  private removeFile = (fileToRemove: FileWithPreview): void => {
    URL.revokeObjectURL(fileToRemove.previewUrl)
    this.setState((prevState: any) => ({
      files: prevState.files.filter(
        (file: FileWithPreview) => file !== fileToRemove
      ),
    }))
  }

  private handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const filesWithPreview = event.target.files
      ? Array.from(event.target.files).map((file) => {
          const previewUrl = URL.createObjectURL(file)
          return { ...file, previewUrl, originalFile: file } // Store the original file separately
        })
      : []

    this.setState((prevState: any) => ({
      files: [...prevState.files, ...filesWithPreview],
    }))
  }

  private handleMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({ message: event.target.value })
  }

  private onClicked = async (): Promise<void> => {
    const { files, message } = this.state
    if (files.length > 0 || message) {
      // Map over the files and convert each one to Base64
      const filesDataPromises = files.map((fileWithPreview: FileWithPreview) =>
        this.fileToBase64(fileWithPreview.originalFile).then((content) => ({
          // Use originalFile here
          name: fileWithPreview.name,
          size: fileWithPreview.size,
          type: fileWithPreview.type,
          content,
        }))
      )

      const filesData = await Promise.all(filesDataPromises)

      Streamlit.setComponentValue({ files: filesData, message: message })
    }
    this.setState({ files: [], message: "" })
    document
      .querySelectorAll('div[style*="position: relative;"]')
      .forEach((element) => element.remove())
  }

  // Helper function to convert a file to a Base64 encoded string
  // Note: This function returns a Promise
  private fileToBase64 = (file: File): Promise<string> => {
    console.log(file)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(FileChatInput)
