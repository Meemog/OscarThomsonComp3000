const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const fileupload = require('express-fileupload')

const { login, logout, createAccount, auth, getAccounts, deleteAccount, getAccount, updateAccount} = require('./methods/account')
const { setPfp } = require('./methods/pfp')
const { getSchedule, createShift, getScheduleByDay, getScheduleByMonth, deleteShift } = require('./methods/schedule')

const { IntervalMethods } = require('./scripts/interval')
const { tempLogin, getShiftState, getRelevantShift, clockIn, clockOut, startBreak, endBreak } = require('./methods/clock')

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(fileupload())

mongoose.connect('mongodb://database:27017/schedule')

setInterval(IntervalMethods, 20000)

app.post('/login', login)
app.post('/logout', logout)

app.post('/createAccount', createAccount)
app.get('/getAccounts', getAccounts)
app.get('/getAccount/:username', getAccount)
app.patch('/updateAccount/:username', updateAccount)
app.delete('/deleteAccount/:username', deleteAccount)

app.get('/auth', auth)

app.post('/setPfp/:username', setPfp)

app.get('/schedule/:username', getSchedule)
app.get('/schedule/:username/:year/:month', getScheduleByMonth)
app.get('/schedule/:username/:year/:month/:day', getScheduleByDay)
app.post('/schedule/:username', createShift)
app.delete('/schedule/:id', deleteShift)

app.post('/clock/login', tempLogin)
app.get('/clock/state', getShiftState)
app.get('/clock/shift', getRelevantShift)
app.post('/clock/clockIn', clockIn)
app.post('/clock/clockOut', clockOut)
app.post('/clock/startBreak', startBreak)
app.post('/clock/endBreak', endBreak)


app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})