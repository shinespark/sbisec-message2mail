const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const {google} = require('googleapis');
require('dotenv').config();

const SBISEC = {
  "loginUrl": "https://site1.sbisec.co.jp/ETGate/",
  "messageBoxUrl": "https://site1.sbisec.co.jp/ETGate/?_ControlID=WPLETmbR001Control&_PageID=WPLETmbR001Rsub15&_DataStoreID=DSWPLETmbR001Control&_ActionID=DefaultAID&category_id=03&message_filter_value=2"
}

// https://developers.google.com/gmail/api/quickstart/nodejs#step_3_set_up_the_sample
// https://github.com/googleapis/google-api-nodejs-client/blob/master/samples/gmail/send.js
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
let auth;
fs.readFile(path.join(__dirname, 'credentials.json'), (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  const {client_secret, client_id, redirect_uris} = JSON.parse(content).installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    oAuth2Client.setCredentials(JSON.parse(token));
    auth = oAuth2Client;
  });
});

async function login(page) {
  await page.goto(SBISEC.loginUrl, {waitUntil: 'networkidle2'});

  await page.type('#user_input > input', `${process.env.SBISEC_USERNAME}`);
  await page.type('#password_input > input', `${process.env.SBISEC_PASSWORD}`);
  await page.click('.ov'); // login button
}

async function getUnreadMessages(page) {
  await page.goto(SBISEC.messageBoxUrl, {waitUntil: 'networkidle2'});

  const unreadMessagesSelector = 'form > table:nth-of-type(2) table[width="100%"] a';
  const result = await page.$$eval(unreadMessagesSelector, unreadMessages => {
    let list = [];
    for (let i = 0; unreadMessages.length > i; i++) {
      list.push({
        href: unreadMessages[i].href,
        text: unreadMessages[i].textContent.trim()
      })
    }
    return list
  });

  return result
}

async function message2mail(page, url) {
  await page.goto(url, {waitUntil: 'networkidle2'});

  const subjectSelector = 'form > table:nth-of-type(1) > tbody > tr:last-child';
  const bodySelector = 'form > table:nth-of-type(3)';
  const submitSelector = 'form > table:nth-of-type(4) input[type="submit"]';
  const subject = await page.$eval(subjectSelector, item => {
    return item.textContent.trim();
  });
  const body = await page.$eval(bodySelector, item => {
    return item.innerHTML;
  });

  const res = await sendMail(subject, body);
  console.log(res.status);
  if (res && res.status === 200) {
    await page.click(submitSelector);
  }
}

async function sendMail(subject, body) {
  console.log(subject);
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `From: sbisec-message2mail <${process.env.FROM}>`,
    `To: Yourself <${process.env.TO}>`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    `${body}`
  ];
  const message = messageParts.join('\n');

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const gmail = google.gmail({version: 'v1', auth: auth});
  return gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
}

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  await login(page);

  const unreadMessages = await getUnreadMessages(page);
  for await (unreadMessage of unreadMessages) {
    await message2mail(page, unreadMessage.href);
  }

  await browser.close();
})();

