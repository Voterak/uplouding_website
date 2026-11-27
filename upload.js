const shareForm = document.getElementById('shareForm');
const shareText = document.getElementById('shareText');
const shareFile = document.getElementById('shareFile');
const openLimit = document.getElementById('openLimit');
const textTypeButton = document.getElementById('textTypeButton');
const fileTypeButton = document.getElementById('fileTypeButton');
const textSharePanel = document.getElementById('textSharePanel');
const fileSharePanel = document.getElementById('fileSharePanel');
const result = document.getElementById('result-panel');

function setShareType(type) {
    const isText = type === 'text';
    textTypeButton.classList.toggle('active', isText);
    fileTypeButton.classList.toggle('active', !isText);
    textTypeButton.setAttribute('aria-selected', String(isText));
    fileTypeButton.setAttribute('aria-selected', String(!isText));
    textSharePanel.hidden = !isText;
    fileSharePanel.hidden = isText;
}

textTypeButton.addEventListener('click', () => setShareType('text'));
fileTypeButton.addEventListener('click', () => setShareType('file'));

const formatButtons = document.querySelectorAll('.format-button');

formatButtons.forEach((button) => {
    button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        const command = button.dataset.command;
        const value = button.dataset.value || null;
        document.execCommand(command, false, value);
    });
});

async function getSharedItems() {
    return ShareStore.getAll();
}

async function makeCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';

    do {
        code = '';
        for (let i = 0; i < 8; i += 1) {
            code += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
    } while (await getSharedItems().then((items) => items[code]));

    return code;
}

function showCode(code) {
    result.innerHTML = `
        <div class="shared-result">
            <strong>Share code</strong>
            <div class="share-code-row">
                <span id="createdCode" class="created-code">${code}</span>
                <button id="copyCode" class="shared-save" type="button">Copy</button>
            </div>
            <p id="shareStatus" class="shared-status success">Done. Enter this code on the Retrieve page.</p>
        </div>
    `;

    document.getElementById('copyCode').addEventListener('click', async () => {
        await navigator.clipboard.writeText(code);
        document.getElementById('shareStatus').textContent = 'Code copied.';
    });
}

shareForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = shareText.innerHTML.trim();
    const plainText = shareText.textContent.trim();
    const file = shareFile.files[0];
    const limit = Number(openLimit.value);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        result.innerHTML = '<p class="shared-status error">The number of opens must be between 1 and 100.</p>';
        openLimit.focus();
        return;
    }

    const selectedType = textSharePanel.hidden ? 'file' : 'text';

    if ((selectedType === 'text' && !plainText) || (selectedType === 'file' && !file)) {
        result.innerHTML = '<p class="shared-status error">Enter some text or choose a file.</p>';
        return;
    }

    if (file) {
        if (file.size > 4 * 1024 * 1024) {
            result.innerHTML = '<p class="shared-status error">The file is too large. The maximum size is 4 MB.</p>';
            return;
        }

        const reader = new FileReader();

        reader.onload = async () => {
            const code = await makeCode();
            const items = await getSharedItems();
            items[code] = {
                type: 'file',
                name: file.name,
                content: reader.result,
                openLimit: limit,
                opensRemaining: limit,
                updatedAt: Date.now()
            };

            try {
                await ShareStore.save(code, items[code]);
                showCode(code);
            } catch (error) {
                result.innerHTML = `<p class="shared-status error">Could not save to Firebase: ${error.message}</p>`;
            }
        };

        reader.onerror = () => {
            result.innerHTML = '<p class="shared-status error">Could not read the file.</p>';
        };

        reader.readAsDataURL(file);
        return;
    }

    const code = await makeCode();
    const items = await getSharedItems();
    items[code] = {
        type: 'text',
        content: text,
        openLimit: limit,
        opensRemaining: limit,
        updatedAt: Date.now()
    };

    try {
        await ShareStore.save(code, items[code]);
        showCode(code);
    } catch (error) {
        result.innerHTML = `<p class="shared-status error">Could not save to Firebase: ${error.message}</p>`;
    }
});
