# sbisec-message2mail

SBI証券の重要なお知らせ > 未確認 のメッセージを自動でGmailへメール送信した上で確認済みにしてくれるスクリプトです。

[Gmail API  \|  Google Developers](https://developers.google.com/gmail/api) を利用する為、Gmailアカウントである必要があります。


## 下準備

* [Node\.js Quickstart  \|  Gmail API  \|  Google Developers](https://developers.google.com/gmail/api/quickstart/nodejs) を参考に、Gmail APIが利用可能な状態にしておく
  * credentials.json の配置
  * token.json の配置
      * ただし、 `SCOPES = ['https://www.googleapis.com/auth/gmail.send']` のSCOPEでtoken.jsonを取得しておく


```
$ cp .env{.sample,}
$ vi .env

$ yarn install
```

## 実行 

```sh
$ node index.js
```
