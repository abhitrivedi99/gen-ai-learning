import { generateEmbeddings, DataWithEmbeddings, writeJsonDataSync, loadJsonDataSync } from '../data';
import { cosineSimilarity } from '../similar';

const movies = loadJsonDataSync<movie[]>('src/emb/movie_recommandation/movie.json');

type movie = {
	name: string;
	description: string;
};

type moviesWithEmbedding = {
	name: string;
	description: string;
	embeddings: number[];
};

console.log('I am movie suggesting Agent, Let me know your choices?');
console.log('...............');

async function getMovieEmbeddings() {
	const data = loadJsonDataSync<movie[]>('src/emb/movie_recommandation/movie.json');

	const embeddings = await generateEmbeddings(data.map((movie: movie) => movie.description));

	const dataWithEmbeddings: DataWithEmbeddings[] = embeddings.data.map((embedding, index) => ({
		input: data[index].name,
		embeddings: embedding.embedding,
	}));
	writeJsonDataSync('src/emb/movie_recommandation/movie_embeddings.json', dataWithEmbeddings);
}

process.stdin.addListener('data', async function (input) {
	let userInput = input.toString().trim();
	await recommendMovies(userInput);
});

async function recommendMovies(userInput: string) {
	const movieEmbeddings = loadJsonDataSync<DataWithEmbeddings[]>('src/emb/movie_recommandation/movie_embeddings.json');

	const moviesWithEmbeddings: moviesWithEmbedding[] = [];

	if (movieEmbeddings.length === 0) {
		console.log('No embeddings found');
		return;
	}

	for (let i = 0; i < movies.length; i++) {
		moviesWithEmbeddings.push({
			name: movies[i].name,
			embeddings: movieEmbeddings[i].embeddings,
			description: movies[i].description,
		});
	}

	const inputEmbeddings = await generateEmbeddings(userInput);

	const similarities: { name: string; similarity: number; description: string }[] = [];

	for (let entry of moviesWithEmbeddings) {
		const similarity = cosineSimilarity(entry.embeddings, inputEmbeddings.data[0].embedding);

		similarities.push({
			name: entry.name,
			similarity,
			description: entry.description,
		});
	}

	similarities.sort((a, b) => b.similarity - a.similarity);

	console.log(similarities[0], similarities[1], similarities[2], similarities[3]);
}
