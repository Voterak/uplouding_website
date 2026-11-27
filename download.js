const codeForm = document.getElementById('codeForm');
const codeInput = document.getElementById('access-code');
const result = document.getElementById('result-panel');

async function getSharedItems() {
    return ShareStore.getAll();
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = value;
    return element.innerHTML;
}

function showText(code, item) {
    result.innerHTML = `
        <div class="shared-result">
            <div class="shared-toolbar">
                <strong>Shared text</strong>
                <span class="shared-code">Kod: ${escapeHtml(code)}</span>
            </div>
            <div class="format-toolbar editor-format-toolbar" aria-label="Text formatting">
                <button type="button" class="format-button" data-command="bold" aria-label="Bold"><b>B</b></button>
                <button type="button" class="format-button" data-command="italic" aria-label="Italic"><i>I</i></button>
                <button type="button" class="format-button" data-command="underline" aria-label="Underline"><u>U</u></button>
                <button type="button" class="format-button marker-button" data-command="backColor" data-value="#ffe58f" aria-label="Highlight" title="Highlight"><span></span></button>
            </div>
            <div id="sharedText" class="shared-text" contenteditable="true" role="textbox" aria-multiline="true">${item.content}</div>
            <button id="saveSharedText" class="shared-save" type="button">Save changes</button>
            <p id="sharedStatus" class="shared-status" role="status">Opens remaining: ${item.opensRemaining}</p>
        </div>
    `;

    const textarea = document.getElementById('sharedText');
    const saveButton = document.getElementById('saveSharedText');
    const status = document.getElementById('sharedStatus');

    document.querySelectorAll('#result-panel .format-button').forEach((button) => {
        button.addEventListener('mousedown', (event) => {
            event.preventDefault();
            document.execCommand(button.dataset.command, false, button.dataset.value || null);
        });
    });

    saveButton.addEventListener('click', async () => {
        const itemToSave = await ShareStore.get(code);
        itemToSave.content = textarea.innerHTML;
        itemToSave.updatedAt = Date.now();
        await ShareStore.save(code, itemToSave);

        status.textContent = 'Changes saved.';
        status.className = 'shared-status success';
    });
}

function showFile(code, item) {
    result.innerHTML = `
        <div class="shared-result">
            <strong>Shared file</strong>
            <p class="shared-file-name">${escapeHtml(item.name)}</p>
            <a class="shared-download" id="sharedDownload" download="${escapeHtml(item.name)}">Download file</a>
            <p class="shared-status">Code: ${escapeHtml(code)} | Opens remaining: ${item.opensRemaining}</p>
        </div>
    `;

    document.getElementById('sharedDownload').href = item.content;
}

codeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        result.innerHTML = '<p class="shared-status error">Enter a share code.</p>';
        codeInput.focus();
        return;
    }

    const items = await getSharedItems();
    const item = await ShareStore.get(code);

    if (!item) {
        result.innerHTML = '<p class="shared-status error">No item was found for this code.</p>';
        return;
    }

    if (typeof item.opensRemaining === 'number') {
        if (item.opensRemaining <= 0) {
            result.innerHTML = '<p class="shared-status error">This code has reached its maximum number of opens.</p>';
            delete items[code];
            await ShareStore.remove(code);
            return;
        }

        item.opensRemaining -= 1;
        await ShareStore.save(code, item);
    }

    if (item.type === 'file') {
        showFile(code, item);
    } else {
        showText(code, item);
    }
});

codeInput.addEventListener('input', () => {
    codeInput.value = codeInput.value.toUpperCase();
});
