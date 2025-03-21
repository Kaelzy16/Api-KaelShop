const cheerio = require("cheerio")
const axios = require("axios")

const GetIdYoutube = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname === "youtu.be") {
      return urlObj.pathname.substring(1);
    }

    if (
      hostname.includes("youtube.com") &&
      (urlObj.pathname.startsWith("/watch") || urlObj.searchParams.has("v"))
    ) {
      return urlObj.searchParams.get("v");
    }

    const match = urlObj.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
    if (match) return match[2];

    throw new Error("ID video tidak ditemukan dalam URL");
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
    return null;
  }
};

const ytmp3 = {
  getInfo: async (url) => {
    try {
      const idYt = GetIdYoutube(url);
      if (!idYt) throw new Error("Gagal mendapatkan ID video");

      const { data } = await axios.get(
        `https://c01-h01.cdnframe.com/api/v4/info/${idYt}`
      );

      return data;
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil info:", error.message);
      return null;
    }
  },

  convert: async (token) => {
    try {
      const { data } = await axios.post(
        "https://c01-h01.cdnframe.com/api/v4/convert",
        { token },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        }
      );

      return data;
    } catch (error) {
      console.error("Terjadi kesalahan saat konversi:", error.message);
      return null;
    }
  },

  process: async (url) => {
    try {
      const info = await ytmp3.getInfo(url);
      if (!info) throw new Error("Gagal mendapatkan informasi video");

      const { title, thumbnail, formats } = info;
      if (!formats?.audio?.mp3?.length)
        throw new Error("Format audio tidak tersedia");

      const token = formats.audio.mp3[0].token;
      const convertData = await ytmp3.convert(token);
      if (!convertData?.id) throw new Error("Gagal melakukan konversi");

      let statusData;
      do {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay 2 detik sebelum request berikutnya

        const { data } = await axios.get(
          `https://c01-h01.cdnframe.com/api/v4/status/${convertData.id}`
        );

        statusData = data;
        console.log(`Proses: ${statusData.progress}% - Status: ${statusData.state}`);
      } while (!statusData.download);

      return statusData;
    } catch (error) {
      console.error("Terjadi kesalahan saat memproses:", error.message);
      return null;
    }
  },
}


module.exports = function (app) {
app.get('/download/ytmp3', async (req, res) => {
        try {
            const { apikey } = req.query;
            if (!global.apikey.includes(apikey)) return res.status(400).json({ status: false, error: 'Apikey invalid' })
            const { url } = req.query;
            if (!url) {
            return res.status(400).json({ status: false, error: 'Url is required' });
            }
            const results = await ytmp3.process(url);
            res.status(200).json({
                status: true,
                result: {
                title: results.title, 
                audio: results.download
                }
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}