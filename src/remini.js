const axios = require('axios');
const { fromBuffer } = require('file-type');
const qs = require('qs');

const getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Requests': 1
      },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (err) {
    throw new Error(`Gagal mengambil buffer dari URL: ${err.message}`);
  }
};

const toolList = ['removebg', 'enhance', 'upscale', 'restore', 'colorize'];

const pxpic = {
  upload: async (buffer) => {
    const fileInfo = await fromBuffer(buffer);
    if (!fileInfo) throw new Error('Gagal mendeteksi tipe file.');
    
    const { ext, mime } = fileInfo;
    const fileName = `${Date.now()}.${ext}`;
    const folder = 'uploads';

    const res = await axios.post('https://pxpic.com/getSignedUrl', {
      folder,
      fileName
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const { presignedUrl } = res.data;

    await axios.put(presignedUrl, buffer, {
      headers: { 'Content-Type': mime }
    });

    return `https://files.fotoenhancer.com/uploads/${fileName}`;
  },

  create: async (buffer, toolName) => {
    if (!toolList.includes(toolName)) {
      throw new Error(`Tool tidak valid. Gunakan salah satu: ${toolList.join(', ')}`);
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

    const res = await axios.post('https://pxpic.com/callAiFunction', data, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': 'id-ID'
      }
    });

    if (!res.data || !res.data.resultImageUrl) {
      throw new Error('Gagal mendapatkan hasil dari API pxpic');
    }

    return res.data.resultImageUrl;
  }
};

module.exports = function (app) {
  const endpoints = [
    { path: '/imagecreator/removebg', tool: 'removebg' },
    { path: '/imagecreator/remini', tool: 'enhance' },
    { path: '/imagecreator/upscale', tool: 'upscale' },
    { path: '/imagecreator/colorize', tool: 'colorize' },
    { path: '/imagecreator/restore', tool: 'restore' }
  ];

  endpoints.forEach(({ path, tool }) => {
    app.get(path, async (req, res) => {
      const { url, apikey } = req.query;

      if (!global.apikey || !global.apikey.includes(apikey)) {
        return res.status(401).json({ status: false, error: 'Apikey invalid' });
      }

      if (!url) {
        return res.status(400).json({ status: false, error: 'URL diperlukan' });
      }

      try {
        const buffer = await getBuffer(url);
        const resultUrl = await pxpic.create(buffer, tool);
        return res.json({
          status: true,
          result: resultUrl
        });
      } catch (err) {
        return res.status(500).json({ status: false, error: err.message });
      }
    });
  });
};
