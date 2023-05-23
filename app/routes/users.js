const express = require('express')
const router = express.Router()
const User = require('../models/user')

const getAllUsers = async () => {
  const userlist = await User.find()
  return userlist
}

router.get('/', async (req, res) => {
  // Get all users from DB
  const users = await getAllUsers()

  if (users.length === 0) {
    res.status(404).send('No users found')
    return
  }

  res.status(200).send(users)
})

module.exports = router
