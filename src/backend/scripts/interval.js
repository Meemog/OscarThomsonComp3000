const {accountModel} = require('../models')

module.exports.IntervalMethods = function() {
    checkexpiredaccounts()
    checkexpiredtempaccounts()
}

async function checkexpiredaccounts() {
    let accounts = await accountModel.find({expiry: {$lt: Date.now()}}, {username: true})
    await accountModel.updateMany({expiry: {$lt: Date.now()}}, {$unset: {token: "", expiry: ""}})

    const usernames = []
    accounts.forEach((username)=>{
        usernames.push(username.username)
    })
    if (usernames.length != 0){
        console.log(`tokens of the following users expired: ${usernames}`)
    }
}

async function checkexpiredtempaccounts() {
    let accounts = await accountModel.find({tempExpiry: {$lt: Date.now()}}, {username: true})
    await accountModel.updateMany({tempExpiry: {$lt: Date.now()}}, {$unset: {tempToken: "", tempExpiry: ""}})

    const usernames = []
    accounts.forEach((username)=>{
        usernames.push(username.username)
    })
    if (usernames.length != 0){
        console.log(`temp tokens of the following users expired: ${usernames}`)
    }
}