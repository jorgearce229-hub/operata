export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { from, to } = req.query
  const FCS_KEY = 'eEXgqKr9vijPIB2ZI4M3drkW'
  const url = `https://fcsapi.com/api-v3/forex/economy_cal?symbol=USD,EUR,GBP,JPY,CHF,CAD,AUD,NZD&from=${from}&to=${to}&access_key=${FCS_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ status: false, error: error.message })
  }
}
