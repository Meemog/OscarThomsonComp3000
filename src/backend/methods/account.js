const { accountModel } = require('../models')
const { getRandomString } = require('../scripts/random')

module.exports.login = async function(req, res){
    const data = req.body
    // get password from database by username
    const foundUser = await accountModel.findOne({username: data.username})

    if (!foundUser){
        res.status(404)
        res.json({error:"User not found"})
        
        return
    }

    // compare passwords
    if (data.password != foundUser.password){
        res.status(404)
        res.json({error:"Incorrect password"})

        return
    }

    // generate unique token
    let unique = false
    let token
    while (!unique){
        token = getRandomString(32)
        if ((await accountModel.find({token: token})).length === 0){
            unique = true
        }
    }

    // store token and expiry in database
    const expiry = Date.now() + expiryOffset
    foundUser.token = token
    foundUser.expiry = expiry

    foundUser.save()

    console.log(`User logged in: ${data.username}`)

    // return token
    res.status(200)
    res.json({token:token, expiry:expiry})
}
