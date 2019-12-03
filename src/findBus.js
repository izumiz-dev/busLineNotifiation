const moment = require("moment")

const findBus = data => {
  const res = []
  data.forEach(bus => {
    const next = moment().format(`YYYY-MM-DD ${bus}:00`)
    if (moment(next).isBetween(moment(), moment().add(60, "m"))) {
      res.push({ "time": moment(next).format("HH:mm"), "mins": moment(next).diff(moment(), "minutes") })
    }
  })
  return res
}

module.exports = findBus
