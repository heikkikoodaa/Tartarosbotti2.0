class TartarosError extends Error {
  constructor(message, errorFrom) {
    super(message)
    this.name = 'TartarosError'
    this.errorFrom = errorFrom
  }
}

module.exports = TartarosError