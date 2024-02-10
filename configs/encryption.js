const crypto = require('crypto')
const { ENCRYPT_PASS, ENCRYPT_SALT } = require('./constants')

const algorithm = 'aes-256-cbc'
const password = ENCRYPT_PASS
const salt = ENCRYPT_SALT
const key = crypto.scryptSync(password, salt, 32)
const iv = crypto.randomBytes(16)

const encrypt = (encryptable) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(encryptable, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return { iv: iv.toString('hex'), encryptedData: encrypted }
}

module.exports = {
  encrypt,
}