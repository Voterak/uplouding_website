if (!localStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
}

const codeForm = document.getElementById('codeForm');
const codeInput = document.getElementById('fname');
const result = document.getElementById('wynikkod');

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
                <strong>Udostępniony tekst</strong>
                <span class="shared-code">Kod: ${escapeHtml(code)}</span>
            </div>
            <div class="format-toolbar editor-format-toolbar" aria-label="Formatowanie tekstu">
                <button type="button" class="format-button" data-command="bold" aria-label="Pogrubienie"><b>B</b></button>
                <button type="button" class="format-button" data-command="italic" aria-label="Kursywa"><i>I</i></button>
                <button type="button" class="format-button" data-command="underline" aria-label="Podkreślenie"><u>U</u></button>
                <button type="button" class="format-button marker-button" data-command="backColor" data-value="#ffe58f" aria-label="Zakreślacz" title="Zakreślacz"><span></span></button>
            </div>
            <div id="sharedText" class="shared-text" contenteditable="true" role="textbox" aria-multiline="true">${item.content}</div>
            <button id="saveSharedText" class="shared-save" type="button">Zapisz zmiany</button>
            <p id="sharedStatus" class="shared-status" role="status">Pozostałe otwarcia: ${item.opensRemaining}</p>
        </div>
    `;

    const textarea = document.getElementById('sharedText');
    const saveButton = document.getElementById('saveSharedText');
    const status = document.getElementById('sharedStatus');

    document.querySelectorAll('#wynikkod .format-button').forEach((button) => {
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

        status.textContent = 'Zmiany zapisane.';
        status.className = 'shared-status success';
    });
}

function showFile(code, item) {
    result.innerHTML = `
        <div class="shared-result">
            <strong>Udostępniony plik</strong>
            <p class="shared-file-name">${escapeHtml(item.name)}</p>
            <a class="shared-download" id="sharedDownload" download="${escapeHtml(item.name)}">Pobierz plik</a>
            <p class="shared-status">Kod: ${escapeHtml(code)} | Pozostałe otwarcia: ${item.opensRemaining}</p>
        </div>
    `;

    document.getElementById('sharedDownload').href = item.content;
}

codeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        result.innerHTML = '<p class="shared-status error">Wpisz kod udostępniania.</p>';
        codeInput.focus();
        return;
    }

    const items = await getSharedItems();
    const item = await ShareStore.get(code);

    if (!item) {
        result.innerHTML = '<p class="shared-status error">Nie znaleziono elementu dla tego kodu.</p>';
        return;
    }

    if (typeof item.opensRemaining === 'number') {
        if (item.opensRemaining <= 0) {
            result.innerHTML = '<p class="shared-status error">Kod został już otwarty maksymalną liczbę razy.</p>';
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
