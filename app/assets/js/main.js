function init() {
    loadTab('welcome');
}

function loadTab(target) {
    const content = document.getElementById('content');
    content.innerHTML = loadFile(`../tabs/${target}.html`);
}

document.addEventListener('DOMContentLoaded', init);