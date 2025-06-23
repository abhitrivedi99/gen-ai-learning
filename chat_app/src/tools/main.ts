import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI();

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: 'system', content: `You are a helpful assistant that gives information about flights and makes reservations` }];

async function callOpenAIWithTools() {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: context,
		temperature: 0.0,
		tools: [
			{
				type: 'function',
				function: {
					name: 'bookAvailableFlights',
					description: 'books available flights from a given flight number',
					parameters: {
						type: 'object',
						properties: {
							flightNumber: {
								type: 'string',
								description: 'The flight number to book',
							},
						},
						required: ['flightNumber'],
					},
				},
			},
			{
				type: 'function',
				function: {
					name: 'getAvailableFlights',
					description: 'returns the available flights for a given departure and destination',
					parameters: {
						type: 'object',
						properties: {
							departure: {
								type: 'string',
								description: 'The departure airport code',
							},
							destination: {
								type: 'string',
								description: 'The destination airport code',
							},
						},
						required: ['departure', 'destination'],
					},
				},
			},
		],
		tool_choice: 'auto',
	});

	const willInvokeFunction = response.choices[0].finish_reason === 'tool_calls';

	if (willInvokeFunction) {
		const toolCall = response.choices[0].message.tool_calls![0];
		const toolName = toolCall.function.name;
		if (toolName === 'getAvailableFlights') {
			const rawArgs = toolCall.function.arguments;
			const parsedArgs = JSON.parse(rawArgs);
			const flights = getAvailableFlights(parsedArgs.departure, parsedArgs.destination);
			context.push(response.choices[0].message);
			context.push({ role: 'tool', content: flights.toString(), tool_call_id: toolCall.id });
		}
		if (toolName === 'bookAvailableFlights') {
			const rawArgs = toolCall.function.arguments;
			const parsedArgs = JSON.parse(rawArgs);
			const reservationNumber = bookAvailableFlights(parsedArgs.flightNumber);
			context.push(response.choices[0].message);
			context.push({ role: 'tool', content: reservationNumber, tool_call_id: toolCall.id });
		}

		const secondResponse = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: context,
		});
		console.log(secondResponse.choices[0].message.content);
	}
}

process.stdin.addListener('data', async (input) => {
	const userInput = input.toString().trim();
	if (!userInput) return;

	context.push({ role: 'assistant', content: userInput });
	await callOpenAIWithTools();
});

function getAvailableFlights(departure: string, destination: string): string[] {
	console.log('Inside function getAvailableFlights');
	if (departure === 'GJ' && destination === 'BOM') {
		return ['GJ 123', 'BM 456'];
	}
	if (departure === 'BOM' && destination === 'GJ') {
		return ['GJ 678', 'BM 910'];
	}
	return ['BM 129'];
}

function bookAvailableFlights(flightNumber: string): string {
	console.log('Inside function bookAvailableFlights');
	if (flightNumber.length === 6) {
		console.log(`Reserving flight ${flightNumber}`);
		return '123456';
	}
	return 'FULLY_BOOKED';
}
