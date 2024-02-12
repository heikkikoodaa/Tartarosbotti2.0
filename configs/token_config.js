const axios = require('axios')
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, BACKEND_URL } = require('./constants')
const { encrypt, decrypt } = require('./encryption')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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

const isTokenExpired = (tokenExpiresAt) => {
  const today = new Date()
  const expirationDate = new Date(tokenExpiresAt)

  return today > expirationDate
}

const getTokenFromDB = async () => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/token`)
    let fetchedToken = data.token

    if (!fetchedToken || !data.success) {
      console.log('No token in the DB. Trying to fetch a new one in 5 sec...')
      await delay(5000)
      console.log('Contacting the server to request a new token')
      fetchedToken = await requestAndSaveToken()
    }

    if (isTokenExpired(fetchedToken.expiresAt)) {
      console.log('Token is expired! Fetching a new one in 5 sec...')
      await delay(5000)
      console.log('Contacting the server to request a new token')
      fetchedToken = await requestAndSaveToken()
    }

    const { token } = decrypt(fetchedToken)

    return token
  } catch (error) {
    console.error(`[ERROR]: ${error.message || error}`)
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

    return data.token
  } catch (error) {
    const errorMessage = error?.message || error
    console.error(`[ERROR]: ${errorMessage}`)
  }
}

const requestAndSaveToken = async () => {
  const tokenData = await getAuthToken()

  if (tokenData) {
    console.log('Token fetched and saved to the vault')

    const savedToken = await saveTokenToDB(tokenData)
    return savedToken
  } else {
    console.error('Failed to request token')
    return null
  }
}

module.exports = {
  requestAndSaveToken,
  getTokenFromDB,
}