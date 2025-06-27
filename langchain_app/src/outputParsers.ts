import { model } from './model';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser } from '@langchain/core/output_parsers';

export async function stringParser() {
	const prompt = ChatPromptTemplate.fromMessages([`Write a short description of the following book: {book}`]);

	const parser = new StringOutputParser();

	const chain = prompt.pipe(model).pipe(parser);

	const response = await chain.invoke({ book: 'The Alchemist' });

	console.log(response);
}

export async function listParser() {
	const prompt = ChatPromptTemplate.fromMessages([`Write a short description of the following book: {book}`]);

	const parser = new CommaSeparatedListOutputParser();

	const chain = prompt.pipe(model).pipe(parser);

	const response = await chain.invoke({ book: 'The Alchemist' });

	console.log(response);
}

export async function structuredParser() {
	const prompt = ChatPromptTemplate.fromMessages([`Write a short description of the following book: {book} in a following formatting structure. {formatting_Structure}`]);

	const parser = StructuredOutputParser.fromNamesAndDescriptions({
		title: 'Title of the book',
		author: 'Author of the book',
		summary: 'Summary of the book',
	});

	const chain = prompt.pipe(model).pipe(parser);

	const response = await chain.invoke({ book: 'The Alchemist', formatting_Structure: parser.getFormatInstructions() });

	console.log(response);
}

structuredParser();
