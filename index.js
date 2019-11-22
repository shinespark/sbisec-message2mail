const moment = require('moment');
const puppeteer = require('puppeteer');

const sbisec = {
  "loginUrl": "https://site1.sbisec.co.jp/ETGate/",
  "messageBoxUrl": "https://site1.sbisec.co.jp/ETGate/?_ControlID=WPLETmbR001Control&_PageID=WPLETmbR001Rsub15&_DataStoreID=DSWPLETmbR001Control&_ActionID=DefaultAID&category_id=03&message_filter_value=2"
}

const date = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

async function login(page) {
  await page.goto(sbisec.loginUrl);
  const loginButton = '.ov';
  await page.waitForSelector(loginButton);

  await page.type('#user_input > input', `${process.env.SBISEC_USERNAME}`);
  await page.type('#password_input > input', `${process.env.SBISEC_PASSWORD}`);
  await page.click(loginButton);
}

async function showMessageBox(page) {
  await page.goto(sbisec.messageBoxUrl);

  const unreadMessagesSelector = 'form > table:nth-of-type(2) table';
  await page.waitForSelector(unreadMessagesSelector);

  const unreadMessages = await page.$$(unreadMessagesSelector);
  if (unreadMessages.length == 0) {
    return;
  }

  await page.screenshot({path: date + '_.png'}); // for debug

  // ページ読み込み完了まで待つ
  // await page.waitForSelector('p.m-txtAreaR');
  //
  // const title = await page.$('.m-hdr1.ng-star-inserted', node => node.innerText);
  // console.log(title);
  // const datetime = await page.$('.m-txtAreaR.ng-star-inserted', node => node.innerText);
  // console.log(datetime);
  // const text = await page.$('p.m-txtAreaR', node => node.innerText);
  // console.log(text);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await login(page);
  await page.screenshot({path: 'afterlogin.png'});
  await showMessageBox(page);
  // await captureAllPortfolio(page, 'service/portfolio', '.section-frame');

  await browser.close();
})();
