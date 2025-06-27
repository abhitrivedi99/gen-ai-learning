import 'dotenv/config';

import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI();

const studentInfo = `Alexandra Thompson, a 19-year-old computer science sophomore with a 3.7 GPA,Add commentMore actions
is a member of the programming and chess clubs who enjoys pizza, swimming, and hiking
in her free time in hopes of working at a tech company after graduating from the University of Washington.`;

const clubInfo = `The university chess club provides an outlet for students to come together and enjoy playing
the classic strategy game of chess. Members of all skill levels are welcome, from beginners learning
the rules to experienced tournament players. The club typically meets a few times per week to play casual games,
participate in tournaments, analyze famous chess matches, and improve members' skills.`;

const universityInfo = `The University of Washington, founded in 1861 in Seattle, is a public research university
with over 45,000 students across three campuses in Seattle, Tacoma, and Bothell.
As the flagship institution of the six public universities in Washington state,
UW encompasses over 500 buildings and 20 million square feet of space,
including one of the largest library systems in the world.`;

type Info = {
	info: string;
	reference: string;
	relevance: number;
};
const dataToEmbed: Info[] = [
	{
		info: studentInfo,
		reference: 'studentInfo',
		relevance: 0.9,
	},
	{
		info: clubInfo,
		reference: 'clubInfo',
		relevance: 0.8,
	},
	{
		info: universityInfo,
		reference: 'universityInfo',
		relevance: 0.7,
	},
];

const pcIndex = pc.Index<Info>('demo');

async function storeEmbeddings() {
	dataToEmbed.forEach(async (info, index) => {
		const embeddings = await openai.embeddings.create({
			model: 'text-embedding-3-small',
			input: info.info,
		});

		const embedding = embeddings.data[0].embedding;

		await pcIndex.upsert([
			{
				id: `id-${index}`,
				values: embedding,
				metadata: info,
			},
		]);
	});
}

async function queryEmbeddings(question: string) {
	const queryEmbeddings = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: question,
	});

	const embedding = queryEmbeddings.data[0].embedding;

	return pcIndex.query({
		vector: embedding,
		topK: 2,
		includeMetadata: true,
		includeValues: true,
	});
}

async function main() {
	const question = 'tell me few important things about Alexandra';
	const result = await queryEmbeddings(question);
	const relavantInfo = result.matches.map((match) => match.metadata?.info).join('\n');
	return askOpenAI(question, relavantInfo);
}

async function askOpenAI(question: string, relavantInfo: string) {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		temperature: 0.7,
		messages: [
			{
				role: 'assistant',
				content: `Answer the next question based on the given context: ${relavantInfo}`,
			},
			{
				role: 'user',
				content: question,
			},
		],
	});

	const responseMessage = response.choices[0].message;
	console.log({ responseMessage });
	return responseMessage;
}

main();
