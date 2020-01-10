let __printElement;

function print(message) {
    console.log(message);
    __printElement.value += message + '\n';
}

function setElement(element) {
    __printElement = element;
}

module.exports = {
    print,
    setElement
};
