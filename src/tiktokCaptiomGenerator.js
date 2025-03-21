const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/tiktok/generate-caption", async (req, res) => {
    try {
      const { prompt, apikey } = req.query;
      if (!global.apikey.includes(apikey))
        return res.status(400).json({ status: false, error: "Apikey invalid" });
      if (!prompt) {
                return res.status(400).json({ status: false, error: 'Prompt is required' });
            }

      let payload = {
        language: "id-ID",
        post_description: `${prompt}. The answer should have an approximate number of 30 words. Answer in a tone of voice. You are an AI writing assistant that helps generating the social media captions based on the user requirements. The answer should include some emoji and hashtags. The answer should be for tiktok social media platform.`,
        tone_of_voice: "casual",
      };

      let { data } = await axios.post(
        "https://countik.com/api/generate_caption",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Connection: "keep-alive",
            Origin: "https://countik.com",
            Referer: "https://countik.com/",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
          },
        }
      );

      res.status(200).json({
        status: true,
        result: data,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};