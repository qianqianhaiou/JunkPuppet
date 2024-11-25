import { InjectContexts } from '../types/Puppet';

export const deceptionDetection = async (contexts: InjectContexts) => {
  await contexts.page.evaluateOnNewDocument(() => {
    if (navigator.webdriver === false) {
    } else if (navigator.webdriver === undefined) {
    } else {
      delete Object.getPrototypeOf(navigator).webdriver;
    }
  });
  if (contexts.browser) {
    const fakeUA = (await contexts.browser.userAgent()).replace('HeadlessChrome/', 'Chrome/');
    await contexts.page.setUserAgent(fakeUA);
  }
};

export const modifyCookies = async (contexts: InjectContexts, cookies: any[]) => {
  if (cookies && cookies.length) {
    await contexts.page.setCookie(...cookies);
  }
};
