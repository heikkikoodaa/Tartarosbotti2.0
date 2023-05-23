const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/', (req, res) => {
  // Get all users from DB
  User.find({}, (err, allUsers) => {
    if (err) {
      console.log(err)
    } else {
      res.status(200).json(allUsers)
    }
  })
})

module.exports = router
