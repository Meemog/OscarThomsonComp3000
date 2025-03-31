const { profileModel, accountModel } = require("../models")
const { getUser } = require("../scripts/auth")

module.exports.setPfp = async function(req, res){
    const token = req.header("Authorization")
    const user = await getUser(token)

    if (user.accountType != "admin" && user.username != req.params.username){
        res.status(401)
        res.json({error:"Unauthorized"})
        return
    }

    const name = `${Date.now() - 1743350980000}${Math.floor(Math.random() * 10000)}.png`


    const view = new Uint8Array(req.files.picture.data.buffer)

    const widthBytes = view.slice(16, 20)
    const heightBytes = view.slice(20, 24)

    const width = widthBytes[3] + widthBytes[2] * 256 + widthBytes[1] * 65536 + widthBytes[0] * 16777216
    const height = heightBytes[3] + heightBytes[2] * 256 + heightBytes[1] * 65536 + heightBytes[0] * 16777216

    console.log(width)
    console.log(height)

    if (width != 256 || height != 256){
        res.status(400)
        res.json({error:"Please enther a valid png file with dimentions 256x256"})
        return
    }

    let file
    try {
        file = new File([req.files.picture.data.buffer], name)
    }
    catch (e) {
        res.status(400)
        res.json({error:"Invalid file"})
        return
    }

    //upload new profile pic
    const data = new FormData()
    data.append("picture", file)

    const response = await fetch("http://images:3002/", {
        method: 'POST',
        body: data
    })

    //delete old profile pic if not default
    if (response.ok){
        const account = await accountModel.findOne({username: user.username})
        const profile = await profileModel.findOne({accountId: account._id})

        console.log(account)
        console.log(profile)

        if (profile.profilePicture != "/pfp.png"){
            await fetch(`http://images:3002${profile.profilePicture}`,{
                method: "DELETE"
            })
        }
        //update database to represent new profile pic
        profile.profilePicture = `/${name}`

        await profile.save()

        res.status(200)
        res.send()
        return
    } else {
        res.status(500)
        res.send()
        return
    }

}