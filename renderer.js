document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('text-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrCodeDiv = document.getElementById('qrcode');

    generateBtn.addEventListener('click', () => {
        qrCodeDiv.innerHTML = '';
        const text = input.value.trim();

        if (text) {
            new QRCode(qrCodeDiv, {
                text: text,
                width: 128,
                height: 128
            });
        } else {
            alert('Please enter some text or a URL.');
        }
    });
});
