const {accountModel} = require('../models')

module.exports.IntervalMethods = function() {
    checkExpiredAccounts()
}

async function checkExpiredAccounts() {
    let accounts = await accountModel.find({expiry: {$lt: Date.now()}}, {username: true})
    await accountModel.updateMany({expiry: {$lt: Date.now()}}, {$unset: {token: "", expiry: ""}})

    const usernames = []
    accounts.forEach((username)=>{
        usernames.push(username.username)
    })
    if (usernames.length != 0){
        console.log(`Tokens of the following users expired: ${usernames}`)
    }
}