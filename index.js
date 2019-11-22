const moment = require('moment');
const puppeteer = require('puppeteer');

const sbisec = {
  "loginUrl": "https://site1.sbisec.co.jp/ETGate/",
  "messageBoxUrl": "https://site1.sbisec.co.jp/ETGate/?_ControlID=WPLETmbR001Control&_PageID=WPLETmbR001Rsub15&_DataStoreID=DSWPLETmbR001Control&_ActionID=DefaultAID&category_id=03&message_filter_value=2"
}

const date = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

async function login(page) {
  await page.goto(sbisec.loginUrl, {waitUntil: 'networkidle2'});

  await page.type('#user_input > input', `${process.env.SBISEC_USERNAME}`);
  await page.type('#password_input > input', `${process.env.SBISEC_PASSWORD}`);
  await page.click('.ov'); // login button
}

async function getUnreadMessages(page) {
  await page.goto(sbisec.messageBoxUrl, {waitUntil: 'networkidle2'});

  const unreadMessagesSelector = 'form > table:nth-of-type(2) table[width="100%"] a';
  const result = await page.$$eval(unreadMessagesSelector, unreadMessages => {
    let list = [];
    for (let i = 0; unreadMessages.length > i; i++) {
      list.push({
        href: unreadMessages[i].href,
        text: unreadMessages[i].textContent
      })
    }
    return list
  });

  return result
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await login(page);
  await page.screenshot({path: 'afterlogin.png'});
  const unreadMessages = await getUnreadMessages(page);
  console.log(unreadMessages);
  // await captureAllPortfolio(page, 'service/portfolio', '.section-frame');

  await browser.close();
})();
