const e = require('express')
const mongoose = require('mongoose')

const accountSchema = mongoose.Schema({
    username: String,
    password: String,
    token: String,
    accountType: String,
    expiry: Number,
    tempToken: String,
    tempExpiry: Number
})

module.exports.accountModel = mongoose.model('Account', accountSchema)

const profileSchema = mongoose.Schema({
    accountId: String,
    firstName: String,
    lastName: String,
    otherNames: Array,
    email: String,
    phoneNumber: String,
    profilePicture: String,
    payRate: Number,
    overtimePayRate: Number,
    contractedHours: Number
})

module.exports.profileModel = mongoose.model('Profile', profileSchema)

const ScheduledShiftSchema = mongoose.Schema({
    accountId: String,
    startTime: Number,
    endTime: Number,
    breakDuration: Number,
})

module.exports.scheduledShiftModel = mongoose.model('ScheduledShift', ScheduledShiftSchema)

const ActualShiftSchema = mongoose.Schema({
    accountId: String,
    startTime: Number,
    endTime: Number,
    breakStart: Number,
    breakEnd: Number
})

module.exports.actualShiftModel = mongoose.model('ActualShift', ActualShiftSchema)