module.exports.getRandomString = function(size) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890!"£$%^&*()-=_+`¬|,.<>/?;:@#~][}{'
  const charactersLength = characters.length
  let response = ''
  for (let i = 0; i < size; ++i) {
    response += characters[Math.floor(Math.random() * charactersLength)]
  }
  return response
}