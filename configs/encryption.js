const crypto = require('crypto')
const { ENCRYPT_PASS, ENCRYPT_SALT } = require('./constants')

const algorithm = 'aes-256-cbc'
const password = ENCRYPT_PASS
const salt = ENCRYPT_SALT
const key = crypto.scryptSync(password, salt, 32)
const iv = crypto.randomBytes(16)

const encrypt = (token) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return { iv: iv.toString('hex'), encryptedData: encrypted }
}

const decrypt = (encryptedToken) => {
  const decryptIv = Buffer.from(encryptedToken.iv, 'hex')
  const encryptedText = Buffer.from(encryptedToken.encryptedToken, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, decryptIv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  const decryptedToken = {
    token: decrypted,
    expiresAt: encryptedToken.expiresAt,
  }

  return decryptedToken
}

module.exports = {
  encrypt,
  decrypt,
}