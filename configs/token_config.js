const axios = require('axios')
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, BACKEND_URL } = require('./constants')
const { encrypt } = require('./encryption')

const getAuthToken = async () => {
  const clientId = TWITCH_CLIENT_ID
  const clientSecret = TWITCH_CLIENT_SECRET
  const grantType = 'client_credentials'
  const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}`

  try {
    const { data } = await axios.post(authUrl)

    const { access_token, expires_in } = data

    if (!access_token) {
      throw new Error('Auth token not required')
    }

    const expiresAt = new Date(new Date().getTime() + expires_in * 1000)

    return { token: access_token, expiresAt }
  } catch (error) {
    console.error(`[ERROR]: ${error}`)
    return null
  }
}

const saveTokenToDB = async (tokenData) => {
  const { token, expiresAt } = tokenData
  const encryptedToken = encrypt(token)

  try {
    const newToken = {
      iv: encryptedToken.iv,
      encryptedToken: encryptedToken.encryptedData,
      expiresAt,
    }

    const { data } = await axios.post(`${BACKEND_URL}/token`, newToken)

    if (!data.success) {
      throw new Error(data.errorMessage)
    }

    console.log('Token saved successfully')
  } catch (error) {
    const errorMessage = error?.message || error
    console.error(`[ERROR]: ${errorMessage}`)
  }
}

const requestAndSaveToken = async () => {
  const tokenData = await getAuthToken()

  if (tokenData) {
    await saveTokenToDB(tokenData)
    console.log('Token fetched and saved to the vault')
  } else {
    console.error('Failed to request token')
  }
}

module.exports = {
  requestAndSaveToken,
}