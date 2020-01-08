function init() {
    loadTab('welcome');
}

function loadTab(target, element) {
    const toolbarItems = document.getElementsByClassName('toolbar-item');
    for (const toolbarItem of toolbarItems) {
        const classes = toolbarItem.classList;
        if (classes.contains('toolbar-item-selected') && toolbarItem !== element) {
            classes.remove('toolbar-item-selected');
        }
    }
    if (element) {
        element.classList.add('toolbar-item-selected');
    }
    const content = document.getElementById('content');
    content.innerHTML = loadFile(`../tabs/${target}.html`);
}

document.addEventListener('DOMContentLoaded', init);