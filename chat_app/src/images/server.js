const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();
const path = require('path');
// Create express app
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Handle root route
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

// Parse JSON bodies
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI();

// Function to generate image
async function generateImage(prompt, req) {
	try {
		const response = await openai.images.generate({
			model: 'dall-e-3',
			prompt: prompt,
			n: 1,
			size: req.body.size || '1792x1024',
			style: req.body.style || 'natural',
			response_format: 'url',
		});

		if (!response.data || !response.data[0] || !response.data[0].url) {
			throw new Error('Failed to generate image: Invalid response format');
		}

		return { rawImage: response.data[0].url, updatedPrompt: response.data[0].revised_prompt };
	} catch (error) {
		console.error('Error generating image:', error);
		throw error;
	}
}

// Generate image endpoint
app.post('/generate', async (req, res) => {
	try {
		const { prompt } = req.body;
		const result = await generateImage(prompt, req);
		return res.status(200).send({ image: result.rawImage, updatedPrompt: result.updatedPrompt });
	} catch (error) {
		console.error('Error generating image:', error);
		return res.status(500).send('Failed to generate image');
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
