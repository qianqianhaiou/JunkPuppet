import { Browser, Page, CDPSession } from 'puppeteer-core';

export interface InjectContexts {
	page: Page;
	browser?: Browser;
	client?: CDPSession;
}
