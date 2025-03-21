const fetch = require("node-fetch")
const axios = require("axios")

const getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (err) {
		return err
	}
}


function encodeEmoji(emoji) {
return [...emoji].map(char => char.codePointAt(0).toString(16)).join('');
}

module.exports = function(app) {
app.get('/tools/emojitogif', async (req, res) => {
const { emoji } = req.query
const { apikey } = req.query;
if (!global.apikey.includes(apikey)) return res.status(400).json({ status: false, error: 'Apikey invalid' })
if (emoji) return res.status(400).json({ status: false, error: 'Emoji is required' });
const unik = await encodeEmoji(emoji)
const image = await getBuffer(`https://fonts.gstatic.com/s/e/notoemoji/latest/${unik}/512.webp`)
        try {
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': image.length,
            });
            res.end(image);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}