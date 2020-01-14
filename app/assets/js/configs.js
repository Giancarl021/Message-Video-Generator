function load() {
    loadTransitions({
        selector: '.reset-button, .confirm-button',
        value: 'filter .15s'
    },
    {
        selector: '.edit-configs',
        value: 'background-color .3s'
    },
    {
        selector: '#raw-json-elements',
        value: 'opacity .3s'
    },
    {
        selector: '.controls-locked',
        value: 'filter .3s'
    });
    loadConfigs();
}

function editConfigs() {
    const raw = document.getElementById('raw-json');
    raw.value = JSON.stringify(config, null, 4);
    raw.parentElement.style.pointerEvents = 'all';
    raw.parentElement.style.opacity = '1';
}

function activateControls(args) {
    if(!args.event) return;
    if(args.event.key.length > 1 && !['Backspace', 'Delete'].includes(args.event.key)) return;
    const controls = document.getElementById('confirm-raw-edit');
    if(controls.classList.contains('controls-locked')) {
        controls.className = controls.className.replace('controls-locked', '');
    }
}

function deactivateControls() {
    const controls = document.getElementById('confirm-raw-edit');
    if(!controls.classList.contains('controls-locked')) {
        controls.className += ' controls-locked';
    }
}

function loadConfigs() {
    const view = document.getElementById('json-container');
    view.innerHTML = parseNode(config);
    function parseNode(node) {
        let html = '';
        if (typeof node === 'object') {
            if (Array.isArray(node)) {
                html += '<div class="json-array">'
                node.forEach(e => {
                    html += `<div class="json-array-item">${parseNode(e)}</div>`;
                });
            } else {
                if (!node) {
                    html += '<div class="json-null">null</div>';
                } else {
                    html += '<div class="json-object">';
                    for (const key in node) {
                        html += `<div class="json-object-key">${key}:</div><div class="json-object-content">${parseNode(node[key])}${key.toLowerCase().includes('color') && typeof node[key] === 'string' ? `<div class="color-viewer" style="background-color: ${node[key]}"></div>` : ''}</div>`;
                    }
                    html += '</div>';
                }
            }
        } else {
            let val, cl;
            switch (typeof node) {
                case 'undefined':
                    val = 'undefined';
                    cl = 'null';
                    break;
                case 'number':
                    val = node;
                    cl = 'number';
                    break;
                case 'string':
                    val = `"${node}"`;
                    cl = 'string';
                    break;
                case 'boolean':
                    val = node ? 'true' : 'false';
                    cl = 'bool';
                    break;
                default:
                    val = node.toString();
                    cl = 'value';
            }
            html += `<div class="json-${cl}">${val}</div>`;
        }
        return html;
    }
}

function saveEdit() {
    const data = JSON.parse(document.getElementById('raw-json').value);
    saveJSON(__configPath, data);
    deactivateControls();
    closeRaw();
}

function cancelEdit() {
    editConfigs();
    deactivateControls();
    closeRaw();
}

function closeRaw() {
    loadConfigs();
    const raw = document.getElementById('raw-json').parentElement;
    raw.style.pointerEvents = 'none';
    raw.style.opacity = '0';
    setTimeout(() => {
        document.getElementById('raw-json').scrollTo(0, 0);
    }, 300);
}

module.exports = {
    load,
    activateControls,
    editConfigs,
    cancelEdit,
    saveEdit
};
