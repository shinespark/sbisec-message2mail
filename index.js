import Gmail from "./lib/gmail.js";
import SbiSec from "./lib/sbiSec.js";

(async () => {
  const sbiSec = new SbiSec();

  try {
    await sbiSec.launch();
    await sbiSec.login();
    let unreadMessageUrls = await sbiSec.getUnreadMessageUrls();

    let unreadMessages = [];
    for await (const unreadMessageUrl of unreadMessageUrls) {
      const details = await sbiSec.getUnreadMessageDetails(unreadMessageUrl);
      unreadMessages.push(details);
    }

    const gmail = new Gmail();
    for await (const unreadMessage of unreadMessages) {
      const mail = gmail.buildMail(unreadMessage);
      await gmail.exec(gmail.sendMail, mail);
      await sbiSec.submitUnreadMessage(unreadMessage.url);
    }
  } finally {
    await sbiSec.close();
  }
})();
