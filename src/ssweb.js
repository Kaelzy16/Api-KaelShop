const fetch = require("node-fetch")

module.exports = function(app) {
app.get('/tools/ssweb', async (req, res) => {
       const { url } = req.query
       const { apikey } = req.query;
if (!global.apikey.includes(apikey)) return res.status(400).json({ status: false, error: 'Apikey invalid' })
if (!url) return res.status(400).json({ status: false, error: 'Url is required' });
        try {
            let anu = await fetch(`https://api.pikwy.com/?tkn=125&d=3000&u=${url}&fs=0&w=1280&h=1200&s=100&z=100&f=$jpg&rt=jweb`).then(response => response.json()).then(r => r)
            res.status(200).json({
                status: true,
                result: anu.iurl
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}