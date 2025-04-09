const { accountModel, scheduledShiftModel } = require("../models")
const { authenticate, getUser } = require("../scripts/auth")

module.exports.getSchedule = async function (req, res) {
    res.json({ message: "ok" })
    return
}

module.exports.getScheduleByDay = async function (req, res) {
    const token = req.header("Authorization")
    const user = await getUser(token)

    if (user.accountType != "admin" && user.username != req.params.username) {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const year = parseInt(req.params.year)
    const month = parseInt(req.params.month)
    const day = parseInt(req.params.day)

    if (year == NaN || month == NaN || day == NaN) {
        res.status(400)
        res.json({ error: "Invalid year, month or day" })
        return
    }

    const userId = await accountModel.findOne({ username: req.params.username }, ["_id"])
    if (!userId) {
        res.status(404)
        res.json({ error: "User not found" })
        return
    }

    // generate start and end timestamps for the day
    const startTime = new Date(year, month-1, day).getTime()
    const endTime = new Date(year, month-1, day + 1).getTime() - 1

    console.log(startTime, endTime)
    const shifts = await scheduledShiftModel.find({
        accountId: userId._id,
        startTime: { $gte: startTime, $lte: endTime },
    })

    res.json({ shifts: shifts })
    return
}

module.exports.getScheduleByMonth = async function (req, res) {
    const token = req.header("Authorization")
    const user = await getUser(token)

    if (user.accountType != "admin" && user.username != req.params.username) {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const year = parseInt(req.params.year)
    const month = parseInt(req.params.month)

    if (year == NaN || month == NaN) {
        res.status(400)
        res.json({ error: "Invalid year or month" })
        return
    }

    const userId = await accountModel.findOne({ username: req.params.username }, ["_id"])
    if (!userId) {
        res.status(404)
        res.json({ error: "User not found" })
        return
    }

    // generate start and end timestamps for the month

    const startTime = new Date(year, month, 1).getTime()
    const endTime = new Date(year, month+1, 1).getTime()-1

    const shifts = await scheduledShiftModel.find({
        accountId: userId._id,
        startTime: { $gte: startTime, $lte: endTime },
    })


    res.json({shifts: shifts})
    return
}

module.exports.createShift = async function (req, res) {
    const token = req.header("Authorization")
    const accountType = await authenticate(token)

    if (accountType != "admin") {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const user = await accountModel.findOne({ username: req.params.username }, ["_id"])

    const startTime = req.body.start_time
    const endTime = req.body.end_time
    const breakDuration = req.body.break_time

    if (!startTime || !endTime) {
        res.status(400)
        res.json({ error: "Missing required fields" })
        return
    }

    if (startTime >= endTime) {
        res.status(400)
        res.json({ error: "Start time must be before end time" })
        return
    }

    const newShift = await scheduledShiftModel.create({
        accountId: user._id,
        startTime: startTime,
        endTime: endTime,
        breakDuration: breakDuration,
    })

    try {
        await newShift.save()
    } catch (err) {
        console.log(err)
        res.status(500)
        res.json({ error: "Error saving shift" })
        return
    }

    res.status(200)
    res.json({ message: "Shift created" })
    return

}

module.exports.deleteShift = async function (req, res) {
    const id = req.params.id

    const token = req.header("Authorization")
    const accountType = await authenticate(token)
    if (accountType != "admin") {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const shift = await scheduledShiftModel.findById(id)
    if (!shift) {
        res.status(404)
        res.json({ error: "Shift not found" })
        return
    }

    try {
        await scheduledShiftModel.deleteOne({ _id: id })
    } catch (err) {
        console.log(err)
        res.status(500)
        res.json({ error: "Error deleting shift" })
        return
    }

    res.status(200)
    res.json({ message: "Shift deleted" })
    return
}