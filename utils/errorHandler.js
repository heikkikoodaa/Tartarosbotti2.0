const errorHandler = (err) => {
  console.error(err.message, err.errorFrom)
}

module.exports = errorHandler