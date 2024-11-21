const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
})

module.exports.register = async function (req, res) {
    const data = req.body

    await mongoose.connect('mongodb://database:27017/data')
    const userDoc = mongoose.model('User', userSchema)

    // check if username exists

    await userDoc.create({username: data.username, email: data.email, password: data.password})
    res.json({'data': "hiii"})
}