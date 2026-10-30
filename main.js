const imageInput = document.querySelector('#image-input');
const fileName = document.querySelector('#file-name');
const previewImage = document.querySelector('#preview-image');
const emptyPreview = document.querySelector('#empty-preview');
const describeButton = document.querySelector('#describe-button');
const message = document.querySelector('#message');

let previewUrl = null;

imageInput.addEventListener('change', () => {
  const file = imageInput.files?.[0];
  message.textContent = '';

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  if (!file) {
    fileName.textContent = 'No image selected';
    previewImage.hidden = true;
    previewImage.removeAttribute('src');
    emptyPreview.hidden = false;
    return;
  }

  if (!file.type.startsWith('image/')) {
    imageInput.value = '';
    fileName.textContent = 'No image selected';
    previewImage.hidden = true;
    emptyPreview.hidden = false;
    message.textContent = 'Please choose an image file.';
    return;
  }

  previewUrl = URL.createObjectURL(file);
  previewImage.src = previewUrl;
  previewImage.hidden = false;
  emptyPreview.hidden = true;
  fileName.textContent = file.name;
});

describeButton.addEventListener('click', async () => {
  if (!imageInput.files?.[0]) {
    alert('Please upload an image first.');
    return;
  }

  const file = imageInput.files[0];
  const description = document.querySelector('#description');
  description.textContent = 'Processing image, please wait...';
  message.textContent = '';
  describeButton.disabled = true;
  describeButton.textContent = 'Processing...';

  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.addEventListener('error', () => reject(reader.error));
      reader.readAsDataURL(file);
    });
    const base64Image = dataUrl.split(',')[1];

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava',
        messages: [
          {
            role: 'user',
            content: 'Describe this image in detail.',
            images: [base64Image]
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const reply = await response.json();
    description.textContent = reply.message.content;
    message.textContent = 'Description ready.';
  } catch (error) {
    description.textContent = 'Could not reach Ollama. Please make sure Ollama is running and try again.';
    message.textContent = '';
  } finally {
    describeButton.disabled = false;
    describeButton.textContent = 'Describe image';
  }
});
