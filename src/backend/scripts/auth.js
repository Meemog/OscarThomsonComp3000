const { accountModel } = require('../models')

async function getUser(token) {
    const userWithToken = await accountModel.findOne({token:token})
    return userWithToken
}

module.exports.authenticate = async function(token){
    const user = await getUser(token)

    if (user == null){
        return 0
    }
    return user.accountType
}

module.exports.getUser = async function(token){
    const user = await getUser(token)

    if (user == null){
        return 0
    }
    return user
}