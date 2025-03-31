const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const fileupload = require('express-fileupload')

const { login, logout, createAccount, auth, getAccounts, deleteAccount, getAccount, updateAccount} = require('./methods/account')
const { IntervalMethods } = require('./scripts/interval')
const { setPfp } = require('./methods/pfp')

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


app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})