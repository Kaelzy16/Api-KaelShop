const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

module.exports = function (app) {
  app.get("/ai/text2image", async (req, res) => {
    try {
      const { prompt, apikey } = req.query;
      if (!global.apikey.includes(apikey))
        return res.status(400).json({ status: false, error: "Apikey invalid" });
      if (!prompt) {
                return res.status(400).json({ status: false, error: 'Prompt is required' });
            }

      let taskId = uuidv4();
      let payload = {
        orientation: "square",
        prompt: prompt,
        task_id: taskId,
      };

      await axios.post(
        "https://magichour.ai/api/free-tools/v1/ai-image-generator",
        payload
      );

      let result;
      do {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        let resData = await axios.get(
          `https://magichour.ai/api/free-tools/v1/ai-image-generator/${taskId}/status`
        );
        result = resData.data;
      } while (result.status !== "SUCCESS");

      res.status(200).json({
        status: true,
        result: result.urls,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};