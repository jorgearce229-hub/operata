export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 's-maxage=3600')

  const { from, to } = req.query
  const FCS_KEY = 'eeE1nFSh5Ra8H5Bs88UYOgNtREMN2lEAx'

  // FCS API uses country codes, not currency codes
  // US=USD, GB=GBP, EU=EUR, JP=JPY, CH=CHF, CA=CAD, AU=AUD, NZ=NZD
  const url = `https://fcsapi.com/api-v3/forex/economy_cal?country=US,GB,EU,JP,CH,CA,AU,NZ&from=${from}&to=${to}&access_key=${FCS_KEY}`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Operata-App/1.0' }
    })
    const text = await response.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      return res.status(502).json({ status: false, error: 'Invalid JSON', raw: text.slice(0, 300) })
    }
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ status: false, error: error.message })
  }
}
