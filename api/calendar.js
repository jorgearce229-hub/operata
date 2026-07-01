export const config = { runtime: 'nodejs' }
 
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 's-maxage=3600')
 
  const { from, to } = req.query
  const FCS_KEY = 'eeE1nFSh5Ra8H5Bs88UYOgNtREMN2lEAx'
  const url = `https://fcsapi.com/api-v3/forex/economy_cal?country=US,GB,EU,JP,CH,CA,AU,NZ&from=${from}&to=${to}&access_key=${FCS_KEY}`
 
  try {
    const response = await fetch(url)
    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message })
  }
}
 
