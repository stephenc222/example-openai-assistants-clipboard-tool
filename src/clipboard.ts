import { execSync } from "child_process"

class Clipboard {
  /**
   * Copies text to the clipboard based on the operating system.
   * @param text The text to be copied to the clipboard.
   */
  static copy(text: string): void {
    const platform = process.platform
    try {
      if (platform === "win32") {
        execSync(`echo ${text} | clip`)
      } else if (platform === "darwin") {
        execSync(`echo "${text}" | pbcopy`)
      } else if (platform === "linux") {
        execSync(`echo "${text}" | xclip -selection clipboard`)
      } else {
        console.error("Platform not supported for clipboard operations")
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    }
  }

  /**
   * Pastes text from the clipboard based on the operating system.
   * @returns The text from the clipboard.
   */
  static paste(): string {
    const platform = process.platform
    try {
      if (platform === "win32") {
        return execSync("powershell Get-Clipboard").toString()
      } else if (platform === "darwin") {
        return execSync("pbpaste").toString()
      } else if (platform === "linux") {
        return execSync("xclip -selection clipboard -o").toString()
      } else {
        console.error("Platform not supported for clipboard operations")
        return ""
      }
    } catch (error) {
      console.error("Error pasting from clipboard:", error)
      return ""
    }
  }
}

export default Clipboard
