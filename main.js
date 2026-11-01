const imageInput = document.querySelector('#image-input');
const message = document.querySelector('#message');
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
