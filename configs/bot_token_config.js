const jwt = require('jsonwebtoken')
const { BACKEND_URL, BOT_ID, TOKEN_SECRET } = require('./constants')
const axios = require('axios')

let token = null
let expiration = 0

const generateToken = () => {
  const payload = {
    bot_id: BOT_ID,
  }
  expiration = Math.floor(Date.now() / 1000) + (60 * 5)
  token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: '5m' })
}

const getToken = () => {
  const currentTime = Math.floor(Date.now() / 1000)
  if (!token || currentTime >= expiration) {
    generateToken()
  }
  return token
}

const apiClient = axios.create({
  baseURL: BACKEND_URL,
})

apiClient.interceptors.request.use(config => {
  const jwtToken = getToken()
  config.headers.Authorization = `Bearer ${jwtToken}`
  return config
}, error => {
  return Promise.reject(error)
})

module.exports = apiClient