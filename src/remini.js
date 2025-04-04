const axios = require('axios');
const { fromBuffer } = require('file-type');
const qs = require('qs');

const getBuffer = async (url, options) => {
	try {
		options = options || {};
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		});
		return res.data;
	} catch (err) {
		throw new Error(`Gagal mengambil buffer dari URL: ${err.message}`);
	}
};

const tools = [ 'removebg', 'enhance', 'upscale', 'restore', 'colorize' ];

const pxpic = {
	upload: async (buffer) => {
		const { ext, mime } = await fromBuffer(buffer) || {};
		if (!ext || !mime) throw new Error('File tidak dikenali.');

		const fileName = Date.now() + "." + ext;
		const folder = "uploads";

		const signed = await axios.post("https://pxpic.com/getSignedUrl", { folder, fileName }, {
			headers: { "Content-Type": "application/json" },
		});

		const { presignedUrl } = signed.data;

		await axios.put(presignedUrl, buffer, {
			headers: { "Content-Type": mime },
		});

		return `https://files.fotoenhancer.com/uploads/${fileName}`;
	},

	create: async (buffer, toolName) => {
		if (!tools.includes(toolName)) {
			throw new Error(`Tool tidak valid. Pilih: ${tools.join(', ')}`);
		}

		const imageUrl = await pxpic.upload(buffer);

		const data = qs.stringify({
			imageUrl,
			targetFormat: 'png',
			needCompress: 'no',
			imageQuality: '100',
			compressLevel: '6',
			fileOriginalExtension: 'png',
			aiFunction: toolName,
			upscalingLevel: ''
		});

		const response = await axios.post("https://pxpic.com/callAiFunction", data, {
			headers: {
				'User-Agent': 'Mozilla/5.0',
				'Accept': '*/*',
				'Content-Type': 'application/x-www-form-urlencoded',
				'accept-language': 'id-ID'
			}
		});

		if (!response.data || !response.data.resultImageUrl) {
			throw new Error("Gagal mendapatkan hasil dari pxpic.");
		}

		return response.data.resultImageUrl;
	}
};

module.exports = function (app) {
	const routes = [
		{ path: "removebg", tool: "removebg" },
		{ path: "remini", tool: "enhance" },
		{ path: "upscale", tool: "upscale" },
		{ path: "colorize", tool: "colorize" }
	];

	routes.forEach(({ path, tool }) => {
		app.get(`/imagecreator/${path}`, async (req, res) => {
			const { url, apikey } = req.query;

			if (!global.apikey?.includes(apikey)) {
				return res.status(400).json({ status: false, error: 'Apikey invalid' });
			}

			if (!url) {
				return res.status(400).json({ status: false, error: 'URL is required' });
			}

			try {
				const buffer = await getBuffer(url);
				const resultImageUrl = await pxpic.create(buffer, tool);

				res.status(200).json({
					status: true,
					result: resultImageUrl
				});
			} catch (err) {
				res.status(500).json({ status: false, error: err.message });
			}
		});
	});
};
