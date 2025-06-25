import 'dotenv/config';
import { InferenceClient } from '@huggingface/inference';
import fs from 'fs';

const inference = new InferenceClient(process.env.HF_API_KEY);

async function main() {
	const output = await inference.featureExtraction({
		inputs: 'Hello, how are you?',
		model: 'sentence-transformers/all-MiniLM-L6-v2',
	});
	console.log(output);
}

async function translate() {
	const output = await inference.translation({
		inputs: 'Hello, how are you?',
		model: 't5-base',
		// options: {
		// 	wait_for_model: true,
		// },
		// parameters: { tgt_lang: 'ar' },
	});
	console.log(output);
}

async function answerQuestion() {
	const output = await inference.questionAnswering({
		inputs: {
			context: 'the quick brown fox jumps over the lazy dog',
			question: 'What color is the fox?',
		},
		model: 'deepset/roberta-base-squad2',
	});
	console.log(output);
}

async function textToImage() {
	const output = await inference.textToImage({
		inputs: 'cat in the background',
		model: 'ZB-Tech/Text-to-Image',
		parameters: {
			negative_prompt: 'blurry',
			guidance_scale: 7,
			width: 512,
			height: 512,
		},
	});

	const base64Image = output;
	console.log('Base64 image length:', base64Image.length);
	fs.writeFileSync('cat.png', Buffer.from(base64Image, 'base64'));
}

textToImage();
