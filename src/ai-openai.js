const axios = require('axios');
const Groq = require('groq-sdk');

module.exports = function(app) {
    let api = [
"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", 
"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", 
"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", 
"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"
]

let apikey = api[Math.floor(Math.random() * api.length)]

const client = new Groq({
  apiKey: apikey,
});

async function groq(teks, prompt = `sekarang kamu adalah ai yang siap membantu & menjawab pertanyaan dan selalu gunakan bahasa Indonesia saat menjawab`) {
try {
  const chatCompletion = await client.chat.completions
    .create({
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: teks }
      ],
      model: 'llama3-8b-8192',
    })
    .catch(async (err) => {
      if (err instanceof Groq.APIError) {
        console.log(err.status);
        console.log(err.name);
        console.log(err.headers);
      } else {
        throw err;
      }
    })
    
    return chatCompletion.choices[0].message.content
  
  } catch (e) {
  console.log(e)
  }
}

app.get('/ai/openai', async (req, res) => {
        try {
            const { apikey } = req.query;
            if (!global.apikey.includes(apikey)) return res.status(400).json({ status: false, error: 'Apikey invalid' })
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const result = await groq(text);
            res.status(200).json({
                status: true,
                result: result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
    
}
