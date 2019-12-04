const moment = require("moment-timezone")
moment.tz.setDefault("Asia/Tokyo")
const timeTableUniv = require("../timetables/timeTableUniv.json")
const timeTableBusCenter = require("../timetables/timeTableBusCenter.json")

const busNotifier = event => {
  let result = ""
  let busTimeTable
  if ([6, 5].includes(moment().day())) {
    return "現在，土曜日・日曜日に対応しておりません 😭"
  }
  if (event.message.text === "大学" || event.message.text === "帰り") {
    result += "大学発 - 駅方面\n"
    busTimeTable = timeTableUniv
  } else if (event.message.text === "バスセンター" || event.message.text === "行き") {
    result += "バスセンター発 - 大学行\n"
    busTimeTable = timeTableBusCenter
  } else {
    return "-「行き」もしくは「バスセンター」を送信すると，バスセンター発\n-「帰り」もしくは「大学」を送信すると大学発\nのバス出発時刻を返信します"
  }
  const findedBus = findBus(busTimeTable)
  if (findedBus.length === 0) {
    return "現在利用時間外です"
  }
  result += "1時間以内の出発予定のバス🚌💨\n"
  findedBus.forEach((bus, index) => {
    result += `${index + 1}：${bus.type ? bus.type === "exp" ? "急行" : "普通" : ""} ${bus.time.toString()}発 - ${bus.mins}分後\n`
  })
  return result.slice(0, -1)
}



const findBus = data => {
  const res = []
  data.forEach(bus => {
    const next = moment().format(`YYYY-MM-DD ${bus.time}:00`)
    if (moment(next).isBetween(moment(), moment().add(60, "m"))) {
      res.push({ "time": moment(next).format("HH:mm"), "mins": moment(next).diff(moment(), "minutes"), "type": bus.type })
    }
  })
  return res
}

module.exports = busNotifier
