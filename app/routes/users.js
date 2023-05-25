const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/:id', async (req, res) => {
  // Get user by id
  const user = await User.findOne({ discordId: req.params.id }).lean()

  // If user does not exist, return error
  if (!user) {
    res.send({ success: false, message: 'User not found' })
    return
  }

  // If user exists, return user
  res.send({ success: true, user: user })
})

router.post('/', async (req, res) => {
  // Create new user
  const { discordId, username } = req.body

  if (!discordId || !username) {
    res.send({ success: false, message: 'Missing required fields' })
    return
  }

  const newUser = new User({
    discordId: discordId,
    username: username,
  })

  try {
    await newUser.save()
    res.send({ success: true, message: 'User created' })
  } catch (error) {
    res.send({ success: false, message: 'User could not be created' })
  }
})

router.patch('/:id', async (req, res) => {
  const { isStreaming } = req.body

  try {
    // Update user stream status
    await User.findOneAndUpdate(
      { discordId: req.params.id },
      { isStreaming: isStreaming },
    )
    res.send({ success: true, message: 'Stream status updated' })
  } catch (error) {
    res.send({ success: false, message: 'Stream status could not be updated' })
  }
})

module.exports = router
