import OpenAI from 'openai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI();

export type DataWithEmbeddings = {
	input: string;
	embeddings: number[];
};

/**
 * Loads JSON data from a file synchronously
 * @param filePath Path to the JSON file
 * @returns Parsed JSON data
 * @throws Error if file cannot be read or parsed
 */
export const loadJsonDataSync = <T>(filePath: string): T => {
	try {
		const absolutePath = path.resolve(filePath);
		const fileData = fs.readFileSync(absolutePath, 'utf-8');
		return JSON.parse(fileData) as T;
	} catch (error) {
		throw new Error(`Failed to load JSON data: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
};

/**
 * Writes data to a JSON file synchronously
 * @param filePath Path to the JSON file
 * @param data Data to write to the file
 * @param options Optional JSON.stringify options
 * @throws Error if file cannot be written
 */
export const writeJsonDataSync = <T>(filePath: string, data: T, options?: { spaces?: number }) => {
	try {
		const absolutePath = path.resolve(filePath);
		const dir = path.dirname(absolutePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		const jsonStr = JSON.stringify(data, null, options?.spaces ?? 2);
		fs.writeFileSync(absolutePath, jsonStr, 'utf-8');
	} catch (error) {
		throw new Error(`Failed to write JSON data: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
};

export const generateEmbeddings = async (input: string | string[]) => {
	const response = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: input,
	});

	return response;
};

async function main() {
	const data = loadJsonDataSync<string[]>('src/emb/data2.json');
	const embeddings = await generateEmbeddings(data);

	const dataWithEmbeddings: DataWithEmbeddings[] = embeddings.data.map((embedding, index) => ({
		input: data[index],
		embeddings: embedding.embedding,
	}));
	writeJsonDataSync('src/emb/embeddings2.json', dataWithEmbeddings);
}

main();
