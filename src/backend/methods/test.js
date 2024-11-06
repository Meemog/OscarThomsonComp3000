const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
    testString: String,
    testInt: Number
})

module.exports.getTestData = async function(num, next){
    //connect to db
    await mongoose.connect('mongodb://database:27017/data')
    const testDocument = mongoose.model('Test', testSchema)

    //get data
    let doc
    try{
        doc = await testDocument.findOne({testInt: num})
    } catch(err){
        next(err)
    }
    
    if (doc) {
        return ({
            text: doc.testString,
        })
    } else {
        return ({
            text: "Input not a number or record not found",
        })
    }
}