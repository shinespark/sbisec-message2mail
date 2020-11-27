# sbisec-message2mail

SBI証券の重要なお知らせ > 未確認 のメッセージを自動でGmailへメール送信した上で確認済みにしてくれるスクリプトです。

実行するには下記の環境が必要です。
* [Gmail API  \|  Google Developers](https://developers.google.com/gmail/api)
* [puppeteer/puppeteer: Headless Chrome Node\.js API](https://github.com/puppeteer/puppeteer)


## 下準備

```
$ cp .env{.sample,}
$ vi .env

$ yarn install
```

* [Node\.js Quickstart  \|  Gmail API  \|  Google Developers](https://developers.google.com/gmail/api/quickstart/nodejs) を参考に、Gmail APIが利用可能な状態にしておく
* [API とサービス - Google Cloud Platform](https://console.cloud.google.com/apis) からcredentials.json の取得と配置
  * API とサービス > 認証情報 > 認証情報を作成 > OAuth クライアントID > デスクトップ アプリ で作成してclient_secret.jsonをcredentials.jsonとしてディレクトリ直下に配置します。
* token.json の生成
  * 初回実行時にOAuthの認証URLが出力されるのでアクセスし、画面に従って許可を行う
  * token.json が配置されればOK
  
## 実行 

下記のいずれかで実行可能

```sh
$ node index.js
$ yarn run message2mail
$ yarn --cwd ./sbisec-message2mail/ message2mail # プロジェクトルートの外部から実行可能
```
