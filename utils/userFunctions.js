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
      throw new Error(data.errorMessage)
    }

    console.log(`Created new user: ${data.user.username}`)
    return data.user
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
      const createdUser = await createUser(user)

      // Return the newly created user
      return createdUser
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