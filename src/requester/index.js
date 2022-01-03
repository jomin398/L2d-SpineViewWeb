class requester{
    constructor(){};
    req(method, url, data = {}) {
        const xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            xhr.open(method ? method : 'get', url, true);
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => reject(xhr);
            data != {} ? xhr.send(JSON.stringify(data)) : xhr.send();
        });
    };
}