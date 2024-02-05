import { getRealChromium } from './real-browser';
import { ElementHandle, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { getAuthPath } from './auth-assistant';
import { getPlaywrightCacheFolder } from './paths';

const chatGPTUrl = 'https://chat.openai.com/';
const defaultAuthPath = getAuthPath();

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
        `Auth context is not provided, please login with the /login endpoint`,
      );
    }
    this.authContext = JSON.parse(
      fs.readFileSync(authPath, { encoding: 'utf-8' }),
    );
  }

  async sendMessage(prompt: string, url = chatGPTUrl) {
    const page = await this.getChatGPTPage(url);

    await this.fillPromptInput(page, prompt);
    const textContent = await this.getLastMessageHTML(page);
    const assets = await this.getAssets(page);

    await page.close();

    return {
      text: textContent,
      assets,
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

    // Wait until the text "ChatGPT" is visible
    const title = await page.waitForSelector(
      'div[type=button] >> text=ChatGPT',
    );
    const titleContent = await title.textContent();

    // For some reason sometimes the model is not selected, even if included in the url
    if (this.model === ChatGPTModels.GPT4 && !titleContent?.includes('4')) {
      await title.click();
      const gpt4Option = page.getByText('GPT-4');
      gpt4Option.click();
      await page.waitForSelector('id=prompt-textarea');
    }

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

  // TODO: Add snippets of code as an asset
  // Support other types of assets
  async getAssets(page: Page) {
    // Get available images in base64
    // Images are a bit weird to access, for now we use this neat trick
    const messages = await page.$$('[data-testid^="conversation-turn-"]');
    if (messages.length === 0) {
      throw new Error('No messages found');
    }

    const lastMessage = messages[messages.length - 1];

    const base64 = await this.downloadImageIfAvailable(page, lastMessage);

    return {
      image: base64,
    };
  }

  async downloadImageIfAvailable(
    page: Page,
    lastMessage: ElementHandle<HTMLElement | SVGElement>,
  ) {
    const image = await lastMessage.$('button img');
    if (!image) {
      return;
    }
    await image?.hover();

    // This is the download button
    const downloadButton = await lastMessage.$('button button');
    if (!downloadButton) {
      throw new Error('Download button unavailable');
    }

    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;

    // Wait for the download process to complete and save the downloaded file somewhere.
    const cachedAssestsPath = path.join(getPlaywrightCacheFolder(), 'assests');
    const filePath = path.join(cachedAssestsPath, download.suggestedFilename());
    await download.saveAs(filePath);

    const base64 = fs.readFileSync(filePath).toString('base64');
    return `data:image/webp;base64,${base64}`;
  }
}
