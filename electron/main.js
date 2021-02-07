const { BrowserWindow, BrowserView, app } = require('electron');
const pie = require('puppeteer-in-electron');
const puppeteer = require('puppeteer-core');

const main = async () => {
  await pie.initialize(app);
  const browser = await pie.connect(app, puppeteer);

  const window = new BrowserWindow({ webPreferences: { webviewTag: true } });
  const url = 'https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_iframe';
  // await window.loadURL(url);
  await window.loadFile('iframe.html');

  const page = await pie.getPage(browser, window);

  let iframe = (await page.mainFrame().childFrames())[0];

  console.log(await page.mainFrame().childFrames());
  console.log(await page.frames());

  let frames = await page.frames();
  let childFrames = await page.mainFrame().childFrames();

  console.log('frames', frames.length);
  console.log('childFrames', childFrames.length);

  console.log(frames[1] === childFrames[0]);

  let targets = await browser.targets();
  let webview = targets.find(async (target) => (await target.url()) === '');

  console.log(await webview.page());

  // await iframe.goto('https://google.de');
  // await page2.goto('https://google.de');

  // window.destroy();
};

main();
