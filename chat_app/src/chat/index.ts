import { OpenAI } from 'openai';
import { encoding_for_model } from 'tiktoken';
import 'dotenv/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const MAX_TOKENS = 50;

const encoder = encoding_for_model('gpt-4o-mini');

if (!OPENAI_API_KEY) {
	console.error('Missing OPENAI_API_KEY environment variable.');
	process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: 'system', content: `You are a helpful chatbot` }];

function deleteOlderMessages() {
	let contextLength = getContextLength();

	while (contextLength > MAX_TOKENS) {
		for (let i = 0; i < context.length; i++) {
			const message = context[i];
			if (message.role != 'system') {
				context.splice(i, 1);
				contextLength = getContextLength();
				console.log({ updatedContextLength: contextLength });
				break;
			}
		}
	}
}

function getContextLength() {
	let length = 0;

	context.forEach((message) => {
		if (typeof message.content === 'string') {
			length += encoder.encode(message.content).length;
		} else if (Array.isArray(message.content)) {
			message.content.forEach((content) => {
				if (content.type === 'text') {
					length += encoder.encode(content.text).length;
				}
			});
		}
	});
	return length;
}

async function createChatCompletion() {
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: context,
			max_tokens: MAX_TOKENS,
		});

		const responseMessage = response.choices[0].message;
		context.push({ role: 'assistant', content: responseMessage.content });

		if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
			deleteOlderMessages();
		}
		console.log(responseMessage.content);
	} catch (error) {
		console.error('Error creating chat completion:', error);
	}
}

process.stdin.addListener('data', async (input) => {
	const userInput = input.toString().trim();
	if (!userInput) return;

	context.push({ role: 'user', content: userInput });
	await createChatCompletion();
});
