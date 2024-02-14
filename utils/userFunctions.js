const axios = require('axios')
const { BACKEND_URL } = require('../configs/constants')
const TartarosError = require('../classes/TartarosError')
const errorHandler = require('../utils/errorHandler')

const createUser = async (user) => {
  const newUser = {
    discordId: user.id,
    username: user.username,
    twitchUrl: user.twitchUrl,
  }

  try {
    const { data } = await axios.post(`${BACKEND_URL}/users`, newUser)

    if (!data.success) {
      throw new TartarosError(data.errorMessage, 'Creating a new user')
    }

    console.log(`Created new user: ${data.user.username}`)
    return data.user
  } catch (error) {
    errorHandler(error)
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
    const errorMessage = error?.message || error
    console.error(errorMessage)
  }
}

module.exports = {
  createUser,
  checkUser,
}