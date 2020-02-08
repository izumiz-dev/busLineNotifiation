"use strict";

require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");
const busNotifier = require("./busNotifier");

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();
let result = "";

app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  console.log("event: ", event);
  try {
    if (event.type !== "message" || event.message.type !== "text") {
      return Promise.resolve(null);
    }
    result = busNotifier(event);
    console.log("results: ", result);
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: result
    });
  } catch (error) {
    console.error(error);
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `${error.message}`
    });
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
