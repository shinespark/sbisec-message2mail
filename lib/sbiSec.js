import puppeteer from "puppeteer";
import dotenv from "dotenv";

const NETWORK_IDLE2 = "networkidle2";
const LOGIN_URL = "https://site1.sbisec.co.jp/ETGate/";
const MESSAGE_BOX_URL =
  "https://site1.sbisec.co.jp/ETGate/?_ControlID=WPLETmbR001Control&_PageID=WPLETmbR001Rsub15&_DataStoreID=DSWPLETmbR001Control&_ActionID=DefaultAID&category_id=03&message_filter_value=2";

export default class SbiSec {
  constructor() {
    dotenv.config();

    this.browser = {};
    this.page = {};
  }

  async launch() {
    this.browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();
  }

  async login() {
    await this.page.goto(LOGIN_URL, { waitUntil: NETWORK_IDLE2 });

    await this.page.type(
      "#user_input > input",
      `${process.env.SBISEC_USERNAME}`
    );
    await this.page.type(
      "#password_input > input",
      `${process.env.SBISEC_PASSWORD}`
    );
    await Promise.all([this.page.waitForNavigation(), this.page.click(".ov")]);
  }

  async getUnreadMessageUrls() {
    await this.page.goto(MESSAGE_BOX_URL, { waitUntil: NETWORK_IDLE2 });

    const unreadMessagesSelector =
      'form > table:nth-of-type(2) table[width="100%"] a';
    const unreadMessageUrls = await this.page.$$eval(
      unreadMessagesSelector,
      (unreadMessages) =>
        unreadMessages.map((unreadMessage) => unreadMessage.href)
    );
    return unreadMessageUrls;
  }

  async getUnreadMessageDetails(messageUrl) {
    await this.page.goto(messageUrl, { waitUntil: NETWORK_IDLE2 });

    const subjectSelector =
      "form > table:nth-of-type(1) > tbody > tr:last-child";
    const subject = await this.page.$eval(subjectSelector, (item) => {
      return item.textContent.trim();
    });
    const bodySelector = "form > table:nth-of-type(3)";
    const body = await this.page.$eval(bodySelector, (item) => {
      return item.innerHTML;
    });
    return {
      subject,
      body,
      url: messageUrl,
    };
  }

  async submitUnreadMessage(messageUrl) {
    await this.page.goto(messageUrl, { waitUntil: NETWORK_IDLE2 });

    const submitSelector = 'form > table:nth-of-type(4) input[type="submit"]';
    await this.page.click(submitSelector);
  }

  async close() {
    this.browser.close();
  }
}
