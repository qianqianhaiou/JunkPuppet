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
    const fakeUA = (await contexts.browser.userAgent()).replace(
      'HeadlessChrome/',
      'Chrome/',
    );
    await contexts.page.setUserAgent(fakeUA);
  }
};

export const modifyCookies = async (
  contexts: InjectContexts,
  cookies: Cookie[] | undefined,
  targetUrl: string,
) => {
  if (cookies && cookies.length) {
    const target = cookies.map((cookie) => {
      return {
        name: cookie.cookieName,
        value: cookie.cookieValue,
        url: targetUrl,
      };
    });
    await contexts.page.setCookie(...target);
  }
};
