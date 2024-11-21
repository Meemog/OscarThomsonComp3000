const express = require('express')
const cors = require('cors')

const { getTestData } = require('./methods/test')
const { register } = require('./methods/register')

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.get('/test', async (req, res, next) => {
    const content = await getTestData(req.query.num, next)
    res.json(content)
})

app.post('/register', register)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})