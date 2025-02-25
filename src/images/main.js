const path = require('path')
const express = require('express')
const fileUpload = require('express-fileupload');
const cors = require('cors')
const fs = require('node:fs')

//client app
const client_app = express()
const client_port = 3001

var dir = path.join(__dirname, 'public')

client_app.use(express.static(dir))

//admin app
const admin_app = express()
const admin_port = 3002

admin_app.use(express.json())
admin_app.use(fileUpload())
admin_app.use(cors())

admin_app.post('/', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }

  let file = req.files.picture

  console.log(file)

  file.mv(`./public/${file["name"]}`, function(err) {
    if (err){
      console.log(err)
      return res.status(500).send(err)
    }

    res.send('File uploaded!')
  })
})

admin_app.delete('/:filename', (req, res) => {
  fs.unlink(`./public/${req.params.filename}`, (err) => {
    if (err) return res.sendStatus(400)
    return res.sendStatus(200)
  })
})

client_app.listen(client_port, () => {
  console.log(`Client webserver listening on port ${client_port}`)
})

admin_app.listen(admin_port, () => {
  console.log(`Admin webserver listening on port ${admin_port}`)
})