const { scheduledShiftModel, actualShiftModel, accountModel } = require("../models")
const { authenticate } = require("../scripts/auth")
const { getRandomString } = require("../scripts/random")

module.exports.getShiftState = async function (req, res) {
    // method that gets the current shift state (in, out, break, none)

    const token = req.header("Authorization")
    const accountType = await authenticate(token)
    if (accountType != "clock") {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const userToken = req.header("UserToken")
    const foundUser = await accountModel.findOne({ tempToken: userToken }, ["_id"])
    if (!foundUser) {
        res.status(404)
        res.json({ error: "User not found" })
        return
    }

    const currentShift = await actualShiftModel.findOne({
        accountId: foundUser._id,
        startTime: { $lte: Date.now() },
        endTime: { $exists: false },
    })

    if (!currentShift) {
        res.status(200)
        res.json({ state: "none" })
        return
    }

    if (currentShift.breakStart && !currentShift.breakEnd) {
        res.status(200)
        res.json({ state: "break", actualShift: currentShift, scheduled: await scheduledShiftModel.findById(currentShift.shiftId) })
        return
    }

    res.status(200)
    res.json({ state: "in", actualShift: currentShift, scheduled: await scheduledShiftModel.findById(currentShift.shiftId) })
    return
}

module.exports.getRelevantShift = async function (req, res) {
    // method that gets the current shift with 5 mins overlap

    // returns:
    //     nothing
    //     the current shift with 5 mins front buffer

    const token = req.header("Authorization")
    const accountType = await authenticate(token)
    if (accountType != "clock") {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const userToken = req.header("UserToken")
    const foundUser = await accountModel.findOne({ tempToken: userToken }, ["_id"])
    if (!foundUser) {
        res.status(404)
        res.json({ error: "User not found" })
        return
    }

    // check if current time is within shift
    const startTimeOffset = 5 * 60 * 1000
    const time = Date.now()
    const shift = await scheduledShiftModel.findOne({
        accountId: foundUser._id,
        startTime: { $lte: time + startTimeOffset },
        endTime: { $gte: time},
    })

    if (!shift) {
        res.status(204)
        res.json({ message: "No shift found" })
        return
    }

    const currentShift = await actualShiftModel.findOne({shiftId: shift._id})
    if (currentShift) {
        res.status(204)
        res.json({ message: "No shift found" })
        return
    }

    res.status(200)
    res.json({ 
        message: "Shift found",
        shift: shift })
}

module.exports.tempLogin = async function (req, res) {
    // seperate login method required as to not logout users from other devices
    // this method will generate a temporary token that will expire after 5 minutes

    const token = req.header("Authorization")
    const accountType = await authenticate(token)

    if (accountType != "clock") {
        console.log("Unauthorized")
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const username = req.body.username
    const password = req.body.password

    const foundUser = await accountModel.findOne({ username: username })
    if (!foundUser) {
        res.status(404)
        res.json({ error: "User not found" })
        return
    }

    if (foundUser.password != password) {
        res.status(401)
        res.json({ error: "Invalid password" })
        return
    }

    let unique = false
    let tempToken
    while (!unique){
        tempToken = getRandomString(32)
        if ((await accountModel.find({tempToken: tempToken})).length === 0){
            unique = true
        }
    }

    // store token and expiry in database
    const expiry = Date.now() + 5 * 60 * 1000 // 5 minutes
    foundUser.tempToken = tempToken
    foundUser.tempExpiry = expiry

    foundUser.save()

    res.status(200)
    res.json({ token: tempToken })
    return
}

module.exports.clockIn = async function (req, res) {
    const token = req.header("Authorization")
    const accountType = await authenticate(token)
    if (accountType != "clock") {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const user = await accountModel.findOne({ tempToken: req.header("UserToken") })

    const shift = await scheduledShiftModel.findById(req.body.shiftId)
    if (!shift) {
        res.status(404)
        res.json({ error: "Shift not found" })
        return
    }

    if (shift.accountId != user._id) {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const currentShift = await actualShiftModel.findOne({
        shiftId: shift._id
    })

    if (currentShift) {
        res.status(400)
        res.json({ error: "Already clocked in" })
        return
    }

    if (shift.startTime - 5*60*1000 > Date.now()) {
        res.status(400)
        res.json({ error: "Shift has not started yet" })
        return
    }
    
    if (shift.endTime < Date.now()) {
        res.status(400)
        res.json({ error: "Shift has already ended" })
        return
    }

    const actualShift = await actualShiftModel.create({
        shiftId: shift._id,
        accountId: user._id,
        startTime: Date.now(),
    })

    actualShift.save()
    res.status(200)
    res.json({ message: "Clocked in", actualShift: actualShift, scheduled: shift })
    return
}

module.exports.clockOut = async function (req, res) {
    const token = req.header("Authorization")
    const accountType = await authenticate(token)
    if (accountType != "clock") {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const user = await accountModel.findOne({ tempToken: req.header("UserToken") })


    const currentShift = await actualShiftModel.findById(req.body.shiftId)

    if (!currentShift) {
        res.status(404)
        res.json({ error: "Shift not found" })
        return
    }

    if (currentShift.accountId != user._id) {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    if (!currentShift) {
        res.status(400)
        res.json({ error: "Not clocked in" })
        return
    }

    currentShift.endTime = Date.now()
    currentShift.save()

    res.status(200)
    res.json({ message: "Clocked out", actualShift: currentShift, scheduled: await scheduledShiftModel.findById(currentShift.shiftId) })
}

module.exports.startBreak = async function (req, res) {
    const token = req.header("Authorization")
    const accountType = await authenticate(token)
    if (accountType != "clock") {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const user = await accountModel.findOne({ tempToken: req.header("UserToken") })

    const currentShift = await actualShiftModel.findById(req.body.shiftId)
    if (!currentShift) {
        res.status(404)
        res.json({ error: "Shift not found" })
        return
    }

    if (currentShift.accountId != user._id) {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    if (currentShift.endTime) {
        res.status(400)
        res.json({ error: "Already clocked out" })
        return
    }

    if (currentShift.breakStart) {
        res.status(400)
        res.json({ error: "Already on break" })
        return
    }
    if (currentShift.breakEnd) {
        res.status(400)
        res.json({ error: "Already had break" })
        return
    }

    const shift = await scheduledShiftModel.findById(currentShift.shiftId)

    if (shift.breakDuration <= 0) {
        res.status(400)
        res.json({ error: "No break left" })
        return
    }

    currentShift.breakStart = Date.now()
    currentShift.save()

    res.status(200)
    res.json({ message: "Break started", actualShift: currentShift, scheduled: shift })
}

module.exports.endBreak = async function (req, res) {
    const token = req.header("Authorization")
    const accountType = await authenticate(token)
    if (accountType != "clock") {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    const user = await accountModel.findOne({ tempToken: req.header("UserToken") })

    const currentShift = await actualShiftModel.findById(req.body.shiftId)
    if (!currentShift) {
        res.status(404)
        res.json({ error: "Shift not found" })
        return
    }

    if (currentShift.accountId != user._id) {
        res.status(401)
        res.json({ error: "Unauthorized" })
        return
    }

    if (currentShift.endTime) {
        res.status(400)
        res.json({ error: "Already clocked out" })
        return
    }

    if (!currentShift.breakStart) {
        res.status(400)
        res.json({ error: "Not on break" })
        return
    }

    currentShift.breakEnd = Date.now()
    currentShift.save()

    res.status(200)
    res.json({ message: "Break ended", actualShift: currentShift })
}