# 🚀 chatgpt-browser-automation-api

This project utilizes Playwright to interact with the ChatGPT web application as an API. It is primarily designed for local usage and testing purposes. For more robust and production-ready implementations, we recommend utilizing the official ChatGPT API provided by OpenAI. You can find more information about the official API in the [OpenAI Blog](https://openai.com/blog/introducing-chatgpt-and-whisper-apis).

## 📚 Routes
### 🔐 Local Login
Endpoint: `/local-login`

This route opens a Chromium window on the server executing the script. This window prompts the login for ChatGPT. After successful login, it records the authentication data in .cache/auth. If this is unavailable, you can perform this operation on another computer and copy the file to the server. We plan to create a more elegant way of logging in the future.

### 📨 Send Message
Endpoint: `/send-message`

This route sends a message to ChatGPT. It accepts a message and model query string. The model can be `gpt-4`. It returns a `{ text, image }`` object with both the raw text and image data (if available).

#### 📝 Request Parameters

- `message`: The message to be sent to ChatGPT.
- `model`: The model to be used for processing the message. Can be `gpt-4`.

#### 📬 Response

The response is a JSON object with the following properties:

- `text`: The raw text response from ChatGPT.
- `image`: The image data response from ChatGPT (if available).

## 🚧 Roadmap
Here are some future developments we're planning:

[] More elegant way of logging in
[] Support for message to specific chats
[] More comprehensive documentation and examples
