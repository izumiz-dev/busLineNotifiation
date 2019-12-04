"use strict";

require("dotenv").config()
const line = require("@line/bot-sdk");
const express = require("express");
const findBus = require("./findBus")
const timeTableUniv = require("./timeTable")

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();
let result = ""
app.post("/callback", line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }
  result = ""
  if (event.message.text === "バス") {
    const busTimes = findBus(timeTableUniv)
    if (busTimes.length < 1) {
      result = "現在バスはありません"
    } else {
      result += "⌚️1時間以内の出発予定のバス🚌\n"
      busTimes.forEach((bus, index) => {
        result += `${bus.time.toString()}発 ${bus.mins} 分後\n`
      })
      result = result.slice(0, -1)
    }
  } else {
    result = "1時間以内に発車予定のバスの時刻表を返すBotです．現在開発中..."
  }
  const text = { type: "text", text: result }

  return client.replyMessage(event.replyToken, text);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});