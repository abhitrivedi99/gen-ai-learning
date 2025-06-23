import { OpenAI } from 'openai';
import { encoding_for_model } from 'tiktoken';
import 'dotenv/config';

const openai = new OpenAI();

async function main() {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: `You are a helpful assistant who is funny. your answer should be in json format, like this: funnyLevel: 1-10, answer: your answer` },
			{
				role: 'user',
				content: 'How tall is mount Everest?',
			},
		],
		max_completion_tokens: 100,
		frequency_penalty: 1.5,
		seed: 5555,
	});
	console.log(response.choices[0].message);
}

function encodePrompt() {
	const prompt = 'How are you today?';
	const encoder = encoding_for_model('gpt-4o-mini');
	const words = encoder.encode(prompt);
	console.log(words);
}
// encodePrompt();
main();
