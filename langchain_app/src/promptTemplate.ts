import { ChatPromptTemplate } from '@langchain/core/prompts';
import { model } from './model';

export async function fromTemplate() {
	const prompt = ChatPromptTemplate.fromMessages([`Write a short description of the following book: {book}`]);

	const chain = prompt.pipe(model);

	const response = await chain.invoke({ book: 'The Alchemist' });

	console.log({ content: response.content });
}

export async function fromMessage() {
	const prompt = ChatPromptTemplate.fromMessages([
		{ role: 'system', content: 'Write a short description of the book provided by the user.' },
		{ role: 'human', content: '{book}' },
	]);

	const chain = prompt.pipe(model);

	const response = await chain.invoke({ book: 'The Alchemist' });

	console.log({ content: response.content });
}
