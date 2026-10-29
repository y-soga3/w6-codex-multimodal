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

describeButton.addEventListener('click', () => {
  if (!imageInput.files?.[0]) {
    alert('Please upload an image first.');
    return;
  }

  document.querySelector('#description').textContent = 'Waiting for input...';
  message.textContent = '';
});
