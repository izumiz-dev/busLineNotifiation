const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Tokyo");
// const timeTable = require("../timetables/timeTable_example.json");
const timeTable = require("../timetables/timeTable.json");

const busNotifier = event => {
  const wakeWord = event.message.text;
  if ([0, 6].includes(moment().day())) {
    return "現在，土曜日・日曜日に対応しておりません 😭";
  }

  const data = findBus({ wakeWord });
  const sendMessageText = createMessage({ data });
  return sendMessageText;
};

const findBus = ({ wakeWord }) => {
  let results = { nexts: [], destination: "", departure: "" };
  timeTable.forEach(table => {
    if (table.wakeWords.includes(wakeWord)) {
      const { destination, departure } = table;
      results.destination = destination;
      results.departure = departure;
      table.timeTable.forEach(bus => {
        const next = moment().format(`YYYY-MM-DDT${bus.time}:00`);
        if (moment(next).isBetween(moment(), moment().add(60, "m"))) {
          results.nexts.push({
            time: moment(next).format("HH:mm"),
            mins: moment(next).diff(moment(), "minutes"),
            type: bus.type
          });
        }
      });
    }
  });
  return results;
};

const createMessage = ({ data }) => {
  console.log(data);
  const { destination, departure } = data;
  let text = "";
  if (data.nexts.length === 0) {
    text +=
      "1時間以内に利用できる電車・バスはありません\nまたは「ヘルプ」と送信してください．";
  } else {
    text += "1時間以内に出発する🚌🚈\n";
    text += `${departure}発 - ${destination}行\n`;
    data.nexts.forEach((bus, index) => {
      text += `${index + 1}：${
        bus.type ? (bus.type === "exp" ? "急行" : "各停") : ""
      } ${bus.time.toString()}発 - ${bus.mins}分後\n`;
    });
  }
  return text.slice(0, -1);
};

module.exports = busNotifier;
