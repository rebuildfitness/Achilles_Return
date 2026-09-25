// Explicitly exercises retained compatibility UI, not the final V2 navigation.
// Existing assertions stay intact. Final navigation has its own end-to-end suite.
import { chromium } from "playwright";
const launchPersistent = chromium.launchPersistentContext.bind(chromium);
chromium.launchPersistentContext = async function (...args) {
  const context = await launchPersistent(...args);
  await context.addInitScript(() => {
    if (location.protocol.startsWith("http")) {
      const u = new URL(location.href);
      u.searchParams.set("legacy", "1");
      history.replaceState(null, "", u);
    }
  });
  return context;
};
const launch = chromium.launch.bind(chromium);
chromium.launch = async function (...args) {
  const browser = await launch(...args),
    create = browser.newContext.bind(browser);
  browser.newContext = async function (...options) {
    const context = await create(...options);
    await context.addInitScript(() => {
      if (location.protocol.startsWith("http")) {
        const u = new URL(location.href);
        u.searchParams.set("legacy", "1");
        history.replaceState(null, "", u);
      }
    });
    return context;
  };
  const createPage = browser.newPage.bind(browser);
  browser.newPage = async function (...options) {
    const page = await createPage(...options);
    await page.addInitScript(() => {
      if (location.protocol.startsWith("http")) {
        const u = new URL(location.href);
        u.searchParams.set("legacy", "1");
        history.replaceState(null, "", u);
      }
    });
    return page;
  };
  return browser;
};
