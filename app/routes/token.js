const express = require('express')
const router = express.Router()
const Token = require('../models/token')

router.post('/', async (req, res) => {
  // Create new user
  const { iv, encryptedToken, expiresAt } = req.body

  if (!iv || !encryptedToken) {
    return res.send({ success: false, message: 'Missing required token fields' })
  }

  const name = 'botToken'

  try {
    const token = await Token.findOneAndUpdate(
      { name },
      { $set: { name, iv, token: encryptedToken, expiresAt } },
      { upsert: true, new: true },
    )
    res.send({ success: true, message: 'Token saved', token: token })
  } catch (error) {
    res.send({ success: false, message: 'Token could not be saved', errorMessage: error.message || error })
  }
})

router.get('/', async (req, res) => {
  try {
    const token = await Token.findOne({ name: 'botToken' }).lean()

    if (!token) {
      return res.send({ success: false, message: 'No token found in the DB' })
    }

    res.send({ success: true, token: token })
  } catch (error) {
    res.send({ success: false, message: 'An error occured when fetching the token', errorMessage: error.message || error })
  }


})

module.exports = router
