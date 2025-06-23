import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI();

async function callOpenAIWithTools() {
	const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
		{ role: 'system', content: `You are a helpful assistant who gives info about the time of the day` },
		{ role: 'user', content: 'What is the order status for order 1234?' },
	];

	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: context,
		tools: [
			{
				type: 'function',
				function: {
					name: 'getTimeOfDay',
					description: 'Returns the time of the day',
					// parameters: {
					// 	type: 'object',
					// 	properties: {
					// 		time: { type: 'string' },
					// 	},
					// },
				},
			},
			{
				type: 'function',
				function: {
					name: 'getOrderStatus',
					description: 'Returns the order status based on order ID',
					parameters: {
						type: 'object',
						properties: {
							orderId: { type: 'string' },
						},
						required: ['orderId'],
					},
				},
			},
		],
		tool_choice: 'auto',
	});

	const willInvokeTool = response.choices[0].finish_reason === 'tool_calls';
	const toolCall = response.choices[0].message.tool_calls![0];

	if (willInvokeTool) {
		const toolName = toolCall.function.name;

		if (toolName === 'getTimeOfDay') {
			const toolResponse = getTimeOfDay();
			context.push(response.choices[0].message);
			context.push({ role: 'tool', content: toolResponse, tool_call_id: toolCall.id });
		}
		if (toolName === 'getOrderStatus') {
			const rawArgs = toolCall.function.arguments;
			const parsedArgs = JSON.parse(rawArgs);
			const toolResponse = getOrderStatus(parsedArgs.orderId);

			context.push(response.choices[0].message);
			context.push({ role: 'tool', content: toolResponse, tool_call_id: toolCall.id });
		}
	}

	const secondResponse = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: context,
	});

	console.log(secondResponse.choices[0].message.content);
}

callOpenAIWithTools();

function getTimeOfDay() {
	return '3:45 PM';
}

function getOrderStatus(orderId: string): string {
	return parseInt(orderId) % 2 === 0 ? 'IN_PROGRESS' : 'COMPLETED';
}
