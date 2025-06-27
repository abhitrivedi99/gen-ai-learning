import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY!,
});

type metadata = {
	name: string;
	coolness: number;
};

async function createIndexes() {
	return pc.createIndex({
		name: 'test',
		dimension: 1536,
		metric: 'cosine',
		spec: {
			serverless: {
				cloud: 'aws',
				region: 'us-east-1',
			},
		},
	});
}

async function listIndexes() {
	return pc.listIndexes();
}

async function getIndex<metadata>() {
	return pc.index('demo');
}

async function createNameSpace() {
	const index = await getIndex();
	return index.namespace('demo');
}

function generateNumberArray(length: number) {
	return Array.from({ length }, () => Math.random());
}

async function upsertData() {
	const embedding = generateNumberArray(1536);
	const index = await getIndex();
	return index.upsert([
		{
			id: 'id-6',
			values: embedding,
			metadata: {
				name: 'tes45',
				coolness: 45,
			},
		},
	]);
}

async function queryVectors() {
	const index = await getIndex();
	const result = await index.query({ id: 'id-1', topK: 6, includeMetadata: true, includeValues: true });
}
queryVectors();
