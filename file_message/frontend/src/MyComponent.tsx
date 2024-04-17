import "./component.css"

import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"

interface State {
  isFocused: boolean
  message: string
  files: File[]
}

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class MyComponent extends StreamlitComponentBase<State> {
  public state = { message: "", isFocused: false, files: [] }

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
      const borderStyling = `1px solid ${
        this.state.isFocused ? theme.primaryColor : "gray"
      }`
      style.border = borderStyling
      style.outline = borderStyling
    }

    // Show a button and some text.
    // When the button is clicked, we'll increment our "numClicks" state
    // variable, and send its new value back to Streamlit, where it'll
    // be available to the Python program.
    return (
      <div
        style={{
          display: "flex",
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
          placeholder="Type a message..."
          // style={{ flexGrow: 1, margin: '0 10px' }}
          onChange={this.handleMessageChange}
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
    )
  }
  private removeFile = (fileToRemove: File): void => {
    this.setState((prevState: any) => ({
      files: prevState.files.filter((file: File) => file !== fileToRemove),
    }))
  }

  private handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    event.persist() // This line ensures the event is not pooled
    const files = event.target.files ? Array.from(event.target.files) : []

    this.setState((prevState: any) => ({
      files: [...prevState.files, ...files],
    }))

    files.forEach((file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const thumbnailUrl = e.target?.result
        if (thumbnailUrl) {
          const thumbnailWrapper = document.createElement("div")
          thumbnailWrapper.style.position = "relative"
          thumbnailWrapper.style.display = "inline-block"
          thumbnailWrapper.style.marginRight = "5px"

          const thumbnail = document.createElement("img")

          thumbnail.onclick = () => {
            const originalFileWindow = window.open()
            if (originalFileWindow) {
              originalFileWindow.document.write(`<img src="${thumbnailUrl}" />`)
            }
          }

          thumbnail.src = thumbnailUrl as string
          thumbnail.style.maxWidth = "100px"
          thumbnail.style.maxHeight = "100px"
          thumbnailWrapper.appendChild(thumbnail)

          const removeButton = document.createElement("span")
          removeButton.textContent = "✖"
          removeButton.style.position = "absolute"
          removeButton.style.top = "0"
          removeButton.style.right = "0"
          removeButton.style.cursor = "pointer"
          removeButton.style.background = "white"
          removeButton.style.borderRadius = "50%"
          removeButton.onclick = () => {
            thumbnailWrapper.remove()
            this.removeFile(file)
          }
          thumbnailWrapper.appendChild(removeButton)

          document.body.appendChild(thumbnailWrapper)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  private handleMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({ message: event.target.value })
  }

  private onClicked = async (): Promise<void> => {
    const { files, message } = this.state
    if (files.length > 0 || message) {
      // Wait for all files to be converted to Base64
      const filesDataPromises = files.map((file: File) =>
        this.fileToBase64(file).then((content) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          content,
        }))
      )

      const filesData = await Promise.all(filesDataPromises)

      Streamlit.setComponentValue({ files: filesData, message: message })
    }
    this.setState({ files: [], message: "" })
    console.log("Debugging files:", files)
    document
      .querySelectorAll('div[style*="position: relative;"]')
      .forEach((element) => element.remove())
  }

  // Helper function to convert a file to a Base64 encoded string
  // Note: This function returns a Promise
  private fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  /** Focus handler for our "Click Me!" button. */
  private _onFocus = (): void => {
    this.setState({ isFocused: true })
  }

  /** Blur handler for our "Click Me!" button. */
  private _onBlur = (): void => {
    this.setState({ isFocused: false })
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(MyComponent)
