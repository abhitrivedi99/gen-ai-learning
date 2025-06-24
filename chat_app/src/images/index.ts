import OpenAI, { toFile } from 'openai';
import 'dotenv/config';
import { writeFileSync, mkdirSync, createReadStream, readFile } from 'fs';
import { join, resolve } from 'path';
import { randomBytes } from 'crypto';

function c(): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
	const randomPart = randomBytes(4).toString('hex');
	return join('public', `image_${timestamp}_${randomPart}.png`);
}

const openai = new OpenAI();

async function generateImage() {
	let base64Image: Buffer;
	try {
		const response = await openai.images.generate({
			model: 'dall-e-3',
			prompt: 'A 8 year old nri is playing ps5 in a living room. so take a backshot where his parents are worried about his future focus should be on his mother more concerned',
			n: 1,
			size: '1792x1024',
			style: 'natural',
			response_format: 'b64_json',
			quality: 'hd',
		});

		if (!response.data || !response.data[0] || !response.data[0].b64_json) {
			throw new Error('Failed to generate image: Invalid response format');
		}

		const rawImage = response.data[0].b64_json;
		base64Image = Buffer.from(rawImage, 'base64');
	} catch (error) {
		console.error('Error generating image:', error);
		throw error;
	}
	const filename = c();
	const publicDir = resolve('public');
	try {
		mkdirSync(publicDir, { recursive: true });
	} catch (err) {
		console.error('Error creating public directory:', err);
		throw err;
	}
	writeFileSync(resolve(filename), base64Image);
	console.log(`Image saved as: ${filename}`);
}

// generateImageVariation();

async function generateImageVariation() {
	const response = await openai.images.createVariation({
		model: 'dall-e-2',
		n: 1,
		response_format: 'b64_json',
		image: createReadStream(resolve('public/image_2025-06-23T14_07_19_942Z_67228779.png')),
	});

	if (!response.data || !response.data[0] || !response.data[0].b64_json) {
		throw new Error('Failed to generate image: Invalid response format');
	}

	const rawImage = response.data[0].b64_json;
	const base64Image = Buffer.from(rawImage, 'base64');
	const filename = c();
	const publicDir = resolve('public');
	try {
		mkdirSync(publicDir, { recursive: true });
	} catch (err) {
		console.error('Error creating public directory:', err);
		throw err;
	}
	writeFileSync(resolve(filename), base64Image);
	console.log(`Image saved as: ${filename}`);
}

// async function editImage() {
// 	const response = await openai.images.edit({
// 		prompt: 'change the background behind parents',
// 		image: createReadStream(resolve('public/spider-man.png')),
// 		model: 'gpt-image-1',
// 		size: '1024x1024',
// 	});
// 	if (!response.data || !response.data[0] || !response.data[0].b64_json) {
// 		throw new Error('Failed to generate image: Invalid response format');
// 	}

// 	const rawImage = response.data[0].b64_json;
// 	console.log(rawImage);
// 	const base64Image = Buffer.from(rawImage, 'base64');
// 	const filename = c();
// 	const publicDir = resolve('public');
// 	try {
// 		mkdirSync(publicDir, { recursive: true });
// 	} catch (err) {
// 		console.error('Error creating public directory:', err);
// 		throw err;
// 	}
// 	writeFileSync(resolve(filename), base64Image);
// 	console.log(`Image saved as: ${filename}`);
// }

// editImage();
