const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const chatControllers = {
    getChat: async (req, res) => {
        const { question } = req.body;

        try {
            const result = await hf.textGeneration({
                model: 'EleutherAI/gpt-neo-1.3B',
                inputs: question,
                parameters: {
                    max_new_tokens: 50,
                }
            });
    
            const generatedText = result.generated_text || 'No response generated.';
            res.status(200).json({ message: generatedText });
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    }
}

module.exports = chatControllers;