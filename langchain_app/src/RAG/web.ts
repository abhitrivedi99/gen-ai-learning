import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { model } from '../model';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChatPromptTemplate } from '@langchain/core/prompts';

async function main() {
	const loader = new CheerioWebBaseLoader('https://www.vegrecipesofindia.com/eggless-banana-cake-recipe/');

	const data = await loader.load();

	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 500,
		chunkOverlap: 150,
	});

	const splittedDocs = await splitter.splitDocuments(data);

	const question = 'give me the recipe';

	const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

	await vectorStore.addDocuments(splittedDocs);

	const retriever = vectorStore.asRetriever({
		k: 5,
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

main();
