import OpenAI from 'openai';
import 'dotenv/config';
import { createReadStream, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { randomBytes } from 'crypto';

const openai = new OpenAI();

function c(): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
	const randomPart = randomBytes(4).toString('hex');
	return join('public', `audio_${timestamp}_${randomPart}.mp3`);
}

async function generateAudio() {
	try {
		const response = await openai.audio.transcriptions.create({
			model: 'whisper-1',
			file: createReadStream(resolve('public/AudioSample.m4a')),
		});
		console.log(response.text);
	} catch (error) {
		console.error('Error generating audio:', error);
		throw error;
	}
}

async function generateAudioTranslation() {
	try {
		const response = await openai.audio.translations.create({
			model: 'whisper-1',
			file: createReadStream(resolve('public/audio-call.m4a')),
		});
		console.log(response.text);
	} catch (error) {
		console.error('Error generating audio translation:', error);
		throw error;
	}
}

async function textToSpeech() {
	try {
		const response = await openai.audio.speech.create({
			model: 'tts-1-hd',
			response_format: 'mp3',
			voice: 'alloy',
			input: 'If 9th Aadhaar is not good, there is a 100% problem with money. Got it. And the work does not go till the end. His Swami is Ketu. Ketu strongly does finance. The planet that gives finance is Saturn. Ketu also gives good finance. These two planets give permanent money. Rahu is a phoenix. Now you have a pass, tomorrow someone else will have a pass. Okay? Yes. Mooladhara is very weak. You have to correct Mooladhara. After that you will get the opportunity. You are thinking too much. You are thinking too much. Tell me, dont you think? All this is to think. This business started when it stopped. Earlier I used to do everything. Now you are thinking too much. You are trying to think. You know the condition. When you say it, I feel like I should stop thinking. Yes. I know everything. Yes. Dont even think of leaving it. Okay? Yes. Mooladhara is not even 1% open. Okay. Mooladhara Swadhisthana is 60%. Which is Swadhisthana? The one above it or the one above all? Above Mooladhara. Okay above Mooladhara. It is 60% open. Manipura Chakra is also 40-45%. Okay. Okay? Yes. Sahasrara is extraordinary. Swadhisthana Chakra is extraordinary. Okay. Anahata is also very good. Okay. Mooladhara is of complete connection. If Mooladhara is not good, there is no connection in life. Yes. What should I say? No, no, say it again. Yes, yes, yes. Okay. Okay. Okay? Yes, yes. Yes. Okay. Yes. Yes. Yes. Yes. Yes. Yes. Okay. Yes. Yes. Okay. Yes. Yes. Yes. Okay. Hmm. Hmm. Okay. Okay. Yes. Yes. Yes. Hmm. Hmm. Okay. Hmm. Hmm. Hmm. Okay. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Okay. Okay. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Okay. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. No problem. No problem. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Yeah. Hmm. Yeah. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Hmm. Okay. Bye.',
		});
		console.log(response.text);

		const buffer = Buffer.from(await response.arrayBuffer());

		const filename = c();

		const publicDir = resolve('public');
		try {
			mkdirSync(publicDir, { recursive: true });
		} catch (err) {
			console.error('Error creating public directory:', err);
			throw err;
		}

		writeFileSync(resolve(filename), buffer);
		console.log(`Audio saved as: ${filename}`);
	} catch (error) {
		console.error('Error generating text to speech:', error);
		throw error;
	}
}

textToSpeech();
