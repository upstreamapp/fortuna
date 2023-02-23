// setup.js
module.exports = async () => {
  const writeConnectionStr = process.env.DATABASE_URL

  if (writeConnectionStr.includes('prod')) {
    throw new Error('Not allowed connect to prod DB')
  } else {
    console.log('DB Connection string seems ok')
  }
}
