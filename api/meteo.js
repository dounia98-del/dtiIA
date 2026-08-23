export default async function handler(req, res) {
  const { ville } = req.query;

  if (!ville || typeof ville !== 'string' || ville.length > 50) {
    return res.status(400).json({ error: 'Ville invalide' });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${ville}&appid=${process.env.METEO_API_KEY}&units=metric&lang=fr`
    );
    const data = await response.json();
    return res.status(200).json(data);
  } catch (erreur) {
    return res.status(500).json({ error: 'Erreur météo' });
  }
}