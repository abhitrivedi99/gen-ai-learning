import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { model } from '../model';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const data = [
	'*The Alchemist* by Paulo Coelho is a philosophical novel that follows the journey of Santiago',
	'a young Andalusian shepherd who dreams of discovering a hidden treasure located near the Egyptian pyramids. Guided by a series of spiritual signs and wise mentors',
	'Santiago embarks on a quest of self-discovery and personal legend. Along the way',
	'he learns profound lessons about destiny',
	'perseverance',
	"and the importance of listening to one's heart. Rich with symbolism and universal themes",
	'*The Alchemist* inspires readers to pursue their dreams and trust in the journey of life.',
];

async function main() {
	const question = 'What is the main universal theme of The Alchemist?';
	const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

	await vectorStore.addDocuments(data.map((text) => new Document({ pageContent: text })));

	const retriever = vectorStore.asRetriever({
		k: 3,
	});

	const results = await retriever.invoke(question);
	console.log(results.map((result) => result.pageContent));

	const template = ChatPromptTemplate.fromMessages([
		{ role: 'system', content: 'Answer the question based on the context provided. {context}' },
		{ role: 'user', content: '{input}' },
	]);

	const chain = template.pipe(model);

	const response = await chain.invoke({ input: question, context: results });
	console.log(response.content);
}
