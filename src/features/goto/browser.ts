import {
	type ConnectResult,
	connect,
	type PageWithCursor,
} from "puppeteer-real-browser";

export class Browser {
	private static instance: Browser | null = null;
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
			return Browser.instance;
		}

		const args: string[] = [];

		const { page, browser } = await connect({ headless, args });

		await page.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
		);

		console.log("Spawned browser with arguments:", args.join(" "));

		Browser.instance = new Browser(page, browser);

		return Browser.instance;
	}

	public async shutdown(): Promise<void> {
		await this.page.close();
		await this.browser.close();
		Browser.instance = null;
	}
}
