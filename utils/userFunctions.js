const axios = require('axios')
const { BACKEND_URL } = require('../configs/constants')

const createUser = async (user) => {
  const newUser = {
    discordId: user.id,
    username: user.username,
    twitchUrl: user.twitchUrl,
  }

  try {
    const { data } = await axios.post(`${BACKEND_URL}/users`, newUser)

    if (!data.success) {
      return false
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const checkUser = async (user) => {
  // Check if user exists in database
  try {
    const { data } = await axios.get(`${BACKEND_URL}/users/${user.id}`)

    if (!data.success) {
      // If user does not exist, create new user
      const newUserCreated = await createUser(user)

      if (!newUserCreated) return
      console.log(`New user created: ${user.username}`)
    }

    // If user exists, return their data
    return data.user
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  createUser,
  checkUser,
}