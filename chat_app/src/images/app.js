// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('prompt');
const imagePreview = document.getElementById('imagePreview');
const loading = document.querySelector('.loading');
const errorMessage = document.querySelector('.error-message');
const updatedPromptDiv = document.getElementById('updatedPrompt');
const updatedPromptText = document.getElementById('updatedPromptText');

// Check if all elements are found
console.log('DOM Elements:', {
	generateBtn: !!generateBtn,
	promptInput: !!promptInput,
	imagePreview: !!imagePreview,
	loading: !!loading,
	errorMessage: !!errorMessage,
	updatedPromptDiv: !!updatedPromptDiv,
	updatedPromptText: !!updatedPromptText,
});

// Base URL for API calls
const BASE_URL = window.BASE_URL;

// Event Listener for Generate Button
console.log('Button clicked!');
generateBtn.addEventListener('click', async (e) => {
	console.log('Event listener triggered');
	e.preventDefault();
	console.log('Prompt:', promptInput.value);
	console.log('Selected size:', document.querySelector('input[name="size"]:checked').value);
	console.log('Selected style:', document.querySelector('input[name="style"]:checked').value);
	const prompt = promptInput.value.trim();

	if (!prompt) {
		showErrorMessage('Please enter a description for the image');
		return;
	}

	// Clear previous state
	imagePreview.style.display = 'none';
	updatedPromptDiv.style.display = 'none';
	const imageSize = document.getElementById('imageSize');
	const imageStyle = document.getElementById('imageStyle');
	if (imageSize) imageSize.textContent = '';
	if (imageStyle) imageStyle.textContent = '';

	// Show loading state
	loading.style.display = 'block';
	generateBtn.disabled = true;
	hideErrorMessage();

	// Get selected options
	const selectedSize = document.querySelector('input[name="size"]:checked')?.value || '1792x1024';
	const selectedStyle = document.querySelector('input[name="style"]:checked')?.value || 'natural';

	try {
		try {
			console.log('Making API call with:', { prompt, size: selectedSize, style: selectedStyle });
			const response = await fetch(new URL('/generate', BASE_URL).href, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt, size: selectedSize, style: selectedStyle }),
			});
			console.log('Response status:', response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('API Error:', errorText);
				throw new Error(`Failed to generate image: ${errorText}`);
			}

			const data = await response.json();
			console.log('API Response:', data);

			try {
				// Show the updated prompt
				updatedPromptText.textContent = data.updatedPrompt;
				updatedPromptDiv.style.display = 'block';

				// Update the preview
				imagePreview.src = data.image;
				imagePreview.style.display = 'block';

				// Update the image info
				const imageSize = document.getElementById('imageSize');
				const imageStyle = document.getElementById('imageStyle');
				if (imageSize && imageStyle) {
					imageSize.textContent = `Size: ${selectedSize}`;
					imageStyle.textContent = `Style: ${selectedStyle}`;
				}

				// Clean up the blob URL when no longer needed
				imagePreview.onload = () => {
					URL.revokeObjectURL(data.image);
				};
			} catch (error) {
				console.error('Error updating UI:', error);
				showErrorMessage('Failed to display image. Please try again.');
			}
		} catch (error) {
			console.error('Error in API call:', error);
			throw error;
		}
	} catch (error) {
		console.error('Error:', error);
		showErrorMessage('Failed to generate image. Please try again.');
	} finally {
		// Hide loading state
		loading.style.display = 'none';
		generateBtn.disabled = false;
	}
});

// Helper functions
function showErrorMessage(message) {
	errorMessage.textContent = message;
	errorMessage.style.display = 'block';
}

function hideErrorMessage() {
	errorMessage.style.display = 'none';
}

// Handle Enter key press in input field
promptInput.addEventListener('keypress', async (e) => {
	if (e.key === 'Enter') {
		e.preventDefault();
		generateBtn.click();
	}
});
