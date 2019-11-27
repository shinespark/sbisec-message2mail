# sbisec-message2mail

SBI証券の重要なお知らせ > 未確認 のメッセージを自動でGmailへメール送信した上で確認済みにしてくれるスクリプトです。

実行するには下記の環境が必要です。
* [Gmail API  \|  Google Developers](https://developers.google.com/gmail/api)
* [puppeteer/puppeteer: Headless Chrome Node\.js API](https://github.com/puppeteer/puppeteer)


## 下準備

* [Node\.js Quickstart  \|  Gmail API  \|  Google Developers](https://developers.google.com/gmail/api/quickstart/nodejs) を参考に、Gmail APIが利用可能な状態にしておく
  * credentials.json の配置
  * token.json の配置
      * ただし、 `SCOPES = ['https://www.googleapis.com/auth/gmail.send']` のSCOPEでtoken.jsonを取得しておく
* [puppeteer/puppeteer: Headless Chrome Node\.js API](https://github.com/puppeteer/puppeteer) が利用可能な状態にしておく


```
$ cp .env{.sample,}
$ vi .env

$ yarn install
```

## 実行 

下記のいずれかで実行可能

```sh
$ node index.js
$ yarn run message2mail
$ yarn --cwd ./sbisec-message2mail/ message2mail # プロジェクトルートの外部から実行可能
```
