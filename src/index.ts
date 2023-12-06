import { OpenAI } from "openai" // Assuming 'openai' has TypeScript definitions
import { MessageContentText } from "openai/resources/beta/threads/messages/messages"
import Clipboard from "./clipboard"

// Assuming OPENAI_API_KEY is set in your .env file
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })

const userPrompt = "Copy this text: 'Hello, clipboard!'"

const instructions = `**You are the 'ClipboardAssistant':** A Chatbot designed to interact with the system clipboard. Your primary function is to perform copy and paste operations based on user instructions.

**Instructions for Using the 'clipboard_operations' Tool:**

1. **Understanding the Tool:**
   - The "clipboard_operations" tool is capable of copying text to the system clipboard and pasting text from it. This tool interacts with the system's clipboard utility.

2. **Identifying the User Query:**
   - Interpret the user's instructions, determining whether to copy text to the clipboard or paste text from it.

3. **Executing Clipboard Operations:**
   - Perform the requested operation:
     - If the operation is 'copy', take the provided text and use the Clipboard class to copy it to the clipboard.
     - If the operation is 'paste', use the Clipboard class to paste the text currently in the clipboard.

4. **Communicating the Outcome:**
   - Inform the user of the success or failure of the clipboard operation. If it's a paste operation, display the pasted text.

**Example Usage:**

If a user asks to "Copy this text: 'Hello, World!'", you would:
- Perform a 'copy' operation with the text 'Hello, World!'.

If a user asks to "Paste the text from the clipboard", you would:
- Perform a 'paste' operation and return the text currently in the clipboard.
`

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function executeAssistantRun(
  threadId: string,
  assistantId: string,
  tools: { [key: string]: Function }
) {
  let run = await client.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  })

  while (run.status === "queued" || run.status === "in_progress") {
    await sleep(1000)
    run = await client.beta.threads.runs.retrieve(threadId, run.id)
  }

  if (
    run.status === "requires_action" &&
    run.required_action?.submit_tool_outputs?.tool_calls[0].type === "function"
  ) {
    const toolFunction =
      run.required_action.submit_tool_outputs.tool_calls[0].function
    const functionName = toolFunction.name
    const functionArguments = JSON.parse(toolFunction.arguments)

    const result = await tools[functionName](functionArguments)
    run = await client.beta.threads.runs.submitToolOutputs(threadId, run.id, {
      tool_outputs: [
        {
          tool_call_id:
            run.required_action.submit_tool_outputs.tool_calls[0].id,
          output: JSON.stringify(result),
        },
      ],
    })

    while (run.status === "queued" || run.status === "in_progress") {
      await sleep(1000)
      run = await client.beta.threads.runs.retrieve(threadId, run.id)
    }
  }

  return run
}

async function main() {
  try {
    const tools: { [key: string]: Function } = {
      clipboard_operations: (args: { operation: string; text?: string }) => {
        if (args.operation === "copy" && args.text) {
          Clipboard.copy(args.text)
          return { success: true }
        } else if (args.operation === "paste") {
          const pastedText = Clipboard.paste()
          return { success: true, pastedText }
        } else {
          return {
            success: false,
            error: "Invalid operation or missing text for copy",
          }
        }
      },
    }

    // Create the GPT-4 assistant
    // Create the GPT-4 assistant
    const assistant = await client.beta.assistants.create({
      model: "gpt-4-1106-preview",
      name: "ClipboardAssistant",
      instructions,
      tools: [
        {
          type: "function",
          function: {
            name: "clipboard_operations",
            description: "Perform clipboard operations like copy and paste.",
            parameters: {
              type: "object",
              properties: {
                operation: {
                  type: "string",
                  description: "Specify the clipboard operation (copy/paste).",
                },
                text: {
                  type: "string",
                  description: "Text to be copied, if the operation is copy.",
                },
              },
              required: ["operation"],
            },
          },
        },
      ],
    })

    // Create a new thread
    const threadId = (await client.beta.threads.create()).id

    // Send the user's query
    await client.beta.threads.messages.create(threadId, {
      role: "user",
      content: userPrompt,
    })

    await executeAssistantRun(threadId, assistant.id, tools)

    let messages = await client.beta.threads.messages.list(threadId)

    messages.data
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
      .forEach((message) => {
        console.log(
          `${message.assistant_id ? "Assistant" : "User"}: ${
            (message.content[0] as MessageContentText).text.value
          }`
        )
      })
    console.log("After first run clipboard content: ", Clipboard.paste())

    Clipboard.copy("Testing other clipboard content")

    await client.beta.threads.messages.create(threadId, {
      role: "user",
      content: "Tell me what is in the clipboard now",
    })

    await executeAssistantRun(threadId, assistant.id, tools)

    // Retrieve and print all messages in the thread
    messages = await client.beta.threads.messages.list(threadId)

    messages.data
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
      .slice(-2)
      .forEach((message) => {
        console.log(
          `${message.assistant_id ? "Assistant" : "User"}: ${
            (message.content[0] as MessageContentText).text.value
          }`
        )
      })
    console.log("After second run clipboard content: ", Clipboard.paste())
  } catch (err) {
    console.error("Error:", err)
  }
}

main()
