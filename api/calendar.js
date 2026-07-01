export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 's-maxage=3600') // Cache 1 hour to save credits
 
  const { from, to } = req.query
  const FCS_KEY = 'eEXgqKr9vijPIB2ZI4M3drkW'
  
  // Try v3 endpoint first (economy calendar)
  const url = `https://fcsapi.com/api-v3/forex/economy_cal?symbol=USD,EUR,GBP,JPY,CHF,CAD,AUD,NZD&from=${from}&to=${to}&access_key=${FCS_KEY}`
 
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Operata-App/1.0' }
    })
    
    if (!response.ok) {
      return res.status(502).json({ status: false, error: `FCS API returned ${response.status}` })
    }
 
    const text = await response.text()
    
    // Try parsing JSON
    let data
    try {
      data = JSON.parse(text)
    } catch {
      return res.status(502).json({ status: false, error: 'Invalid JSON from FCS API', raw: text.slice(0, 200) })
    }
 
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ status: false, error: error.message })
  }
}
 
