import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

export function getRealChromium() {
  // We tell playwright-extra to use the plugin (or plugins) we want.
  // Certain plugins might have options you can pass in - read up on their documentation!
  chromium.use(stealthPlugin());
  return chromium;
}
