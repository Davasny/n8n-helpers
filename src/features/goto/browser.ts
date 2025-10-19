import {
  type ConnectResult,
  connect,
  type PageWithCursor,
} from "puppeteer-real-browser";

export class Browser {
  private static instance: Browser | null = null;
  private static shutdownTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
  public readonly page: PageWithCursor;
  public readonly browser: ConnectResult["browser"];

  private constructor(page: PageWithCursor, browser: ConnectResult["browser"]) {
    this.page = page;
    this.browser = browser;
  }

  static async getInstance({
    headless = true,
  }: {
    headless?: boolean;
  }): Promise<Browser> {
    if (Browser.instance) {
      Browser.instance.touch();
      return Browser.instance;
    }

    const args: string[] = [];

    const { page, browser } = await connect({ headless, args });

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
    );

    console.log("Spawned browser with arguments:", args.join(" "));

    Browser.instance = new Browser(page, browser);
    Browser.instance.touch();

    return Browser.instance;
  }

  private static scheduleShutdown(): void {
    Browser.clearShutdownTimer();
    Browser.shutdownTimer = setTimeout(() => {
      const activeInstance = Browser.instance;
      if (!activeInstance) {
        return;
      }

      activeInstance.shutdown().catch((error) => {
        console.error("Error shutting down idle browser:", error);
      });
    }, Browser.INACTIVITY_TIMEOUT_MS);
  }

  private static clearShutdownTimer(): void {
    if (Browser.shutdownTimer) {
      clearTimeout(Browser.shutdownTimer);
      Browser.shutdownTimer = null;
    }
  }

  public touch(): void {
    Browser.scheduleShutdown();
  }

  public async shutdown(): Promise<void> {
    Browser.clearShutdownTimer();

    try {
      await this.page.close();
    } catch (error) {
      console.error("Error closing browser page:", error);
    }

    try {
      await this.browser.close();
    } catch (error) {
      console.error("Error closing browser instance:", error);
    }

    if (Browser.instance === this) {
      Browser.instance = null;
    }
  }
}
