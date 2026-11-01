const imageInput = document.querySelector('#image-input');
const message = document.querySelector('#message');
const describeButton = document.querySelector('#describe-button');
const image1Description = document.querySelector('#description-1');
const previewSlots = [
  {
    image: document.querySelector('#preview-image-1'),
    empty: document.querySelector('#empty-preview-1')
  },
  {
    image: document.querySelector('#preview-image-2'),
    empty: document.querySelector('#empty-preview-2')
  }
];

let previewUrls = [];

function clearPreviews() {
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls = [];

  previewSlots.forEach(({ image, empty }) => {
    image.hidden = true;
    image.removeAttribute('src');
    empty.hidden = false;
  });
}

imageInput.addEventListener('change', () => {
  message.textContent = '';
  image1Description.textContent = '';
  clearPreviews();

  const files = Array.from(imageInput.files || []).slice(0, 2);

  for (const [index, file] of files.entries()) {
    if (!file.type.startsWith('image/')) {
      clearPreviews();
      imageInput.value = '';
      message.textContent = 'Please select image files only.';
      return;
    }

    const { image, empty } = previewSlots[index];
    const url = URL.createObjectURL(file);
    previewUrls.push(url);
    image.src = url;
    image.hidden = false;
    empty.hidden = true;
  }
});

describeButton.addEventListener('click', async () => {
  const image1 = imageInput.files?.[0];
  if (!image1) {
    alert('Please upload an image first.');
    return;
  }

  message.textContent = '';
  image1Description.textContent = 'Describing image...';
  describeButton.disabled = true;
  describeButton.textContent = 'Processing...';

  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.addEventListener('error', () => reject(reader.error));
      reader.readAsDataURL(image1);
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

    const result = await response.json();
    image1Description.textContent = result.message.content;
  } catch (error) {
    image1Description.textContent = 'Could not reach Ollama. Make sure Ollama is running and try again.';
    message.textContent = '';
  } finally {
    describeButton.disabled = false;
    describeButton.textContent = 'Describe Selected Images';
  }
});
