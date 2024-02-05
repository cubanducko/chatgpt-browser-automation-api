import { getRealChromium } from './real-browser';
import { Page } from 'playwright';
import path from 'path';
import fs from 'fs';

const chatGPTUrl = 'https://chat.openai.com/';
const defaultAuthPath = path.join(__dirname, '../../auth/storage.json');

export enum ChatGPTModels {
  GPT4 = 'gpt-4',
  GPT3 = 'gpt-3.5-turbo',
}

export class FreeChatGPTAssistant {
  private authContext: any;
  private model: ChatGPTModels;

  constructor(model = ChatGPTModels.GPT3, authPath = defaultAuthPath) {
    this.model = model;
    const authPathExists = fs.existsSync(authPath);
    if (!authPathExists) {
      throw new Error(
        `Auth context is not provided, please execute "npm run chatgpt-auth" and log in`,
      );
    }
    this.authContext = JSON.parse(
      fs.readFileSync(authPath, { encoding: 'utf-8' }),
    );
  }

  async sendMessage(prompt: string, url = chatGPTUrl) {
    const page = await this.getChatGPTPage(url);

    await this.fillPromptInput(page, prompt);
    const html = await this.getLastMessageHTML(page);

    await page.close();

    return {
      text: html,
      assets: [],
    };
  }

  private async getChatGPTPage(url: string) {
    const finalUrl =
      this.model === ChatGPTModels.GPT4 ? `${url}?model=gpt-4` : url;
    const chromium = getRealChromium();
    const browser = await chromium.launch({
      headless: false,
    });
    const context = await browser.newContext({
      storageState: this.authContext,
    });
    const page = await context.newPage();
    await page.goto(finalUrl);
    await page.waitForSelector('id=prompt-textarea');
    return page;
  }

  private async fillPromptInput(page: Page, prompt: string) {
    const promptInput = page.locator('id=prompt-textarea');
    await promptInput.fill(prompt);

    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    // Wait for prompt to generate
    // This is super slow, so we extend the timeout to 120s
    await page.waitForTimeout(1000);
    await page.waitForFunction(
      () =>
        document.querySelector<HTMLButtonElement>('[data-testid="send-button"]')
          ?.disabled === true,
      undefined,
      { timeout: 120000 },
    );
  }

  async getLastMessageHTML(page: Page) {
    const messages = await page.$$('[data-message-author-role="assistant"]');
    if (messages.length === 0) {
      throw new Error('No messages found');
    }

    const lastMessage = messages[messages.length - 1];
    const html = await lastMessage.innerText();
    return html;
  }
}
