const { accountModel, profileModel } = require('../models')
const { getRandomString } = require('../scripts/random')
const { getUser, authenticate } = require('../scripts/auth')

const expiryOffset = 43200000

function validate(data){
    const errors = []
        if (data.username.length <= 3){
            errors.push("Username needs to be 4 or more characters long")
        }
        if (data.password.length != 64){
            errors.push("Password is invalid")
        }
        if (!data.email){
            errors.push("Email cannot be empty")
        }
        if (!data.accountType){
            errors.push("Account type cannot be empty")
        }
        if (!data.firstName){
            errors.push("First name cannot be empty")
        }
        if (!data.lastName){
            errors.push("Last name cannot be empty")
        }
        if (data.payRate < 0){
            errors.push("Pay rate cannot be negative")
        }
        if (data.overtimePayRate < data.payRate){
            errors.push("Overtime pay rate cannot be less than pay rate")
        }
    return errors
}

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

module.exports.logout = async function(req, res) {
    // authenticate user

    const token = req.header("Authorization") 
    const user = await getUser(token)
    
    if (user == 0){
        res.status(401)
        res.json({error:"Unauthorized"})
        return
    }

    await accountModel.findOneAndUpdate({token: data.token}, {"$unset": {expiry: "", token: ""}})

    res.status(200)
    res.json({message:"Logged out"})
    return
}

module.exports.createAccount = async function(req, res){
    console.log("Creating account")
    // authenticate user
    const token = req.header("Authorization")
    const accountType = await authenticate(token)

    if (accountType != "admin"){
        res.status(401)
        res.json({error:"Unauthorized"})
        return
    }

    const errors = validate(req.body)

    const userExists = await accountModel.find({username: req.body.username})

    if (userExists.length != 0){
        errors.push("Username already exists")
    }

    if (errors.length === 0){
        let newAcc = await accountModel.create({
            username: req.body.username,
            password: req.body.password,
            accountType: req.body.accountType
        })
        let newProfile = await profileModel.create({
            accountId: newAcc._id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            otherNames: req.body.otherNames,
            profilePicture: "/pfp.png",
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            payRate: req.body.payRate,
            overtimePayRate: req.body.overtimePayRate,
            contractedHours: req.body.contractedHours
        })

        try{
            newAcc.save()
            newProfile.save()
        } catch (err) {
            console.log(err)
            res.status(500)
            res.json({error:"Server error"})
            return
        }
        res.status(200)
        res.json({message:"Account created"})
        return
    } 
    else{
        res.status(400)
        res.json({error:errors})
        return
    }

}

module.exports.auth = async function(req, res){
    const token = req.header("Authorization")

    const account = await accountModel.findOne({token: token})

    if (!account){
        res.status(401)
        res.json({error:"Unauthorized"})
        return
    }

    account.expiry = Date.now() + expiryOffset
    account.save()

    res.status(200)
    res.json({username: account.username, accountType: account.accountType})
    return
}

module.exports.getAccounts = async function(req, res){
    const token = req.header("Authorization")
    const accountType = await authenticate(token)

    if (accountType != "admin"){
        res.status(401)
        res.json({error:"Unauthorized"})
        return
    }

    try {
        const users = []
        const accounts = await accountModel.find({}, {password: false, token: false, expiry: false})
        for (let i = 0; i < accounts.length; i++){
            const account = accounts[i]
            const profile = await profileModel.findOne({accountId: account._id})
            const obj = {
                username: account.username,
                accountType: account.accountType,
            }
            if (account.accountType != "admin"){
                obj.firstName = profile.firstName
                obj.lastName = profile.lastName
                obj.otherNames = profile.otherNames
                obj.email = profile.email
                obj.phoneNumber = profile.phoneNumber
                obj.profilePicture = profile.profilePicture
                obj.payRate = profile.payRate
                obj.overtimePayRate = profile.overtimePayRate
                obj.contractedHours = profile.contractedHours
            }
            users.push(obj)
        }
        res.status(200)
        res.json(users)
        return
    } catch (err) {
        res.status(500)
        res.json({error:"Server error"})
        return
    }

}

module.exports.getAccount = async function(req, res){
    const token = req.header("Authorization")
    const user = await getUser(token)

    if (user.accountType != "admin" && user.username != req.params.username){
        res.status(401)
        res.json({error:"Unauthorized"})
        return
    }

    const account = await accountModel.findOne({username: req.params.username}, {password: false, token: false, expiry: false})

    if (!account){
        res.status(404)
        res.json({error:"User not found"})
        return
    }
    
    const profile = await profileModel.findOne({accountId: account._id})

    const toReturn = {
        username: account.username,
        accountType: account.accountType,
        firstName: profile.firstName,
        lastName: profile.lastName,
        otherNames: profile.otherNames,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        profilePicture: profile.profilePicture,
        payRate: profile.payRate,
        overtimePayRate: profile.overtimePayRate,
        contractedHours: profile.contractedHours
    }

    res.status(200)
    res.json(toReturn)
    return
}

module.exports.deleteAccount = async function(req, res){
    const token = req.header("Authorization")
    const accountType = await authenticate(token)

    if (accountType != "admin"){
        res.status(401)
        res.json({error:"Unauthorized"})
        return
    }

    const username = req.params.username

    const account = await accountModel.findOne({username: username})

    if (!account){
        res.status(404)
        res.json({error:"User not found"})
        return
    }

    await profileModel.deleteOne({accountId: account._id})
    await accountModel.deleteOne({username: username})

    res.status(200)
    res.json({message:"Account deleted"})
    return
}

module.exports.updateAccount = async function(req, res){
    const token = req.header("Authorization")
    const user = await getUser(token)

    if (user.accountType != "admin" && user.username != req.params.username){
        res.status(401)
        res.json({error:"Unauthorized"})
        return
    }

    const account = await accountModel.findOne({username: req.params.username})

    if (!account){
        res.status(404)
        res.json({error:"User not found"})
        return
    }

    const profile = await profileModel.findOne({accountId: account._id})

    const data = req.body

    if (data.firstName){
        profile.firstName = data.firstName
    }
    if (data.lastName){
        profile.lastName = data.lastName
    }
    if (data.otherNames){
        profile.otherNames = data.otherNames
    }
    if (data.email){
        profile.email = data.email
    }
    if (data.phoneNumber){
        profile.phoneNumber = data.phoneNumber
    }
    if (data.profilePicture){
        profile.profilePicture = data.profilePicture
    }
    if (user.accountType == "admin"){
        if (data.payRate){
            profile.payRate = data.payRate
        }
        if (data.overtimePayRate){
            profile.overtimePayRate = data.overtimePayRate
        }
        if (data.contractedHours){
            profile.contractedHours = data.contractedHours
        }
    }

    profile.save()

    res.status(200)
    res.json({message:"Account updated"})
    return
}