import 'dotenv/config';

import { loadJsonDataSync, DataWithEmbeddings, generateEmbeddings } from './data.js';

function dotProduct(a: number[], b: number[]) {
	return a.map((value, index) => value * b[index]).reduce((a, b) => a + b, 0);
}

function findSimilarEmbeddings(embeddings: DataWithEmbeddings[], targetEmbedding: number[]) {
	const dotProducts = embeddings.map((embedding) => dotProduct(embedding.embeddings, targetEmbedding));
	const maxDotProductIndex = dotProducts.indexOf(Math.max(...dotProducts));
	return maxDotProductIndex;
}

async function main() {
	try {
		const dataWithEmbeddings = loadJsonDataSync<DataWithEmbeddings[]>('src/emb/embeddings2.json');
		if (dataWithEmbeddings.length === 0) {
			console.log('No embeddings found');
			return;
		}

		const input = 'how many contries sarah visited?';

		const inputEmbeddings = await generateEmbeddings(input);

		const similarities: { input: string; similarity: number }[] = [];

		for (const entry of dataWithEmbeddings) {
			const similarity = cosineSimilarity(entry.embeddings, inputEmbeddings.data[0].embedding);
			similarities.push({
				input: entry.input,
				similarity,
			});
		}

		console.log(
			'similarities',
			similarities.sort((a, b) => b.similarity - a.similarity),
		);
	} catch (error) {
		console.error('Error:', error);
	}
}

export function cosineSimilarity(a: number[], b: number[]) {
	const product = dotProduct(a, b);
	const aMagnitude = Math.sqrt(a.map((value) => value * value).reduce((a, b) => a + b, 0));
	const bMagnitude = Math.sqrt(b.map((value) => value * value).reduce((a, b) => a + b, 0));
	return product / (aMagnitude * bMagnitude);
}
