import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI();

async function generateEmbeddings(input: string | string[]) {
	const response = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: input,
	});
	console.log(response.data[0]);
	return response;
}

generateEmbeddings(['cat is like a dog', 'dog is cheater', 'cat is better than dog']);
