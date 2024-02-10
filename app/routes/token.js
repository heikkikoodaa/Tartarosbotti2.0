const express = require('express')
const router = express.Router()
const Token = require('../models/token')

router.post('/', async (req, res) => {
  // Create new user
  const { iv, encryptedToken, expiresAt } = req.body

  if (!iv || !encryptedToken) {
    return res.send({ success: false, message: 'Missing required token fields' })
  }

  const newToken = new Token({
    iv,
    encryptedToken,
    expiresAt,
  })

  try {
    await newToken.save()
    res.send({ success: true, message: 'Token saved', token: newToken })
  } catch (error) {
    res.send({ success: false, message: 'Token could not be saved', errorMessage: error })
  }
})

module.exports = router
