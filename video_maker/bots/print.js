let __printElement;

function print(message) {
    console.log(message);
    __printElement.innerHTML += message + '<br/>';
}

function setElement(element) {
    __printElement = element;
}

module.exports = {
    print,
    setElement
};
