# Example OpenAI Assistants Clipboard Tool

## Introduction

This project demonstrates how to extend the capabilities of an OpenAI Assistant to interact with the system clipboard, enabling copy and paste operations. The implementation is done in TypeScript and integrates with the OpenAI API.

## Prerequisites

- Node.js installed on your machine
- An OpenAI API key
- Basic knowledge of TypeScript and Node.js

## Installation

1. **Clone the Repository**: Clone this repository to your local machine.

2. **Install Dependencies**: Run `npm install` in the project directory to install the required dependencies, including the OpenAI SDK.

3. **Set Up Environment Variables**: Create a `.env` file in the root directory and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Project Structure

- `clipboard.ts`: Contains the `Clipboard` class for clipboard operations.
- `main.ts`: The main entry point of the application, where the OpenAI Assistant is created and managed.
- `openai` and related imports: OpenAI SDK modules for interacting with the API.

## Usage

To run the application, execute `node main.ts` in the terminal. The script will create an instance of the OpenAI Assistant, capable of performing clipboard operations based on user instructions.

## How It Works

### The OpenAI Client

```typescript
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string })
```

Initializes the OpenAI client using the provided API key.

### Clipboard Operations

The `clipboard_operations` function within `main.ts` is responsible for handling the copy and paste commands. It uses the `Clipboard` class to interact with the system clipboard.

### The Clipboard Class

Located in `clipboard.ts`, this class uses Node.js's `child_process` module to execute platform-specific shell commands for clipboard operations.

### Assistant Creation and Management

In `main.ts`, an instance of the OpenAI GPT-4 assistant is created with specific instructions for clipboard interaction. The assistant processes user prompts and executes the appropriate clipboard operation.
