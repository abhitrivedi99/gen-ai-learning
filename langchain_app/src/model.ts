import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';

export const model = new ChatOpenAI({
	model: 'chatgpt-4o-latest',
	temperature: 0.7,
	maxTokens: 300,
	verbose: false,
});

async function single() {
	const response = await model.invoke(['give me 4 books for power and status to read.']);
	console.log(response);
}

async function batch() {
	const response = await model.batch(['give me 4 books for power and status to read.', 'give me 4 books for relationship to read.']);
	console.log(response);
}

async function stream() {
	const response = await model.stream(['give me 4 books for power and status to read.']);

	for await (const chunk of response) {
		console.log(chunk.content);
	}
}
