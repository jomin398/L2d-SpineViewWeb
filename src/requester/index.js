/**
 * @class gdMgr
 * a google drive link Manager
 */
class gdMgr {
    constructor() { };
    /**
     * @param {string} url 
     * @returns {string} drive id string.
     */
    getID(url) {
        //파일 마다 고유의 아이디가 있는데 그걸 잘라준다.
        return url.split("/d/")[1].split("/")[0];
    }
    /**
     * @property {Array} preurls
     */
    preUrls = ["https://drive.google.com/uc?export=download&id=", "https://docs.google.com/document/d/"];
    /**
     * 
     * @param {string} url input param to convert
     * @param {string} format a file format
     * @returns {string}
     * @example
     * getLink('http://www.example.com/','txt');
     */
    getLink(url, format) {
        /* 구글 드라이브의 일반적인 공유 링크를 다이렉트 다운로드 URL로 변경하는 소스 */
        let preUrlend = "/export?format=" + format ? format : "txt";
        if (url.search("document") == -1) {
            //파일이 문서가 아니고 미디어일 경우, 그냥 반환
            return this.preUrls[0] + this.getID(url);
        } else {
            //파일이 문서가 일경우 txt 파일로 저장한다는 확장자를 붙힌다.
            return this.preUrls[1] + this.getID(url) + preUrlend;
        }
    }
};
/**
 * a request handler
 * @class
 * @name requester
 * @method req
 */
class requester extends gdMgr {
    constructor() {
        super();
    };
    /**
     * xhr to promise.
     * @param {string} method method to get, post.
     * @param {string} url target url
     * @param {string} type a response type.
     * @param {string} data a post data.
     * @param {Object} process on load process object.
     * @param {function(e)} process.loading a loading function
     * @param {function(e)} process.loadStart a loadStart function
     * @returns {Promise}
     * @example
     * req('get','http://www.example.com/',null,null,{loadStart:e=>console.log(`now onstart Downloading ${e.total} bytes`),loading:e=>console.log(`${Math.round(100 * e.loaded / e.total)}% Complete`)})
     */
    req(method, url, type, data = {},process) {
        const xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            if (type) {
                xhr.responseType = type;
            }
            if(process){
                if(process.loadStart){
                    xhr.onloadstart = process.loadStart;
                }
                if(process.loading){
                    xhr.onprogress =process.loading;
                }
            }
            
            xhr.open(method ? method : 'get', url, true);
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => reject(xhr);
            data != {} ? xhr.send(JSON.stringify(data)) : xhr.send();
        });
    };
    /**
     * 
     * @param {string} method method to get, post.
     * @param {string} url target url
     * @param {string} type a response type.
     * @param {string} data a post data.
     * @param {Object} process on load process object.
     * @param {function(e)} process.loading a loading function
     * @param {function(e)} process.loadStart a loadStart function
     * @returns {Promise}
     */
    reqFromGD(method, url, type, data = {},process) {
        url = this.getLink(url);
        return this.req(method, url, type, data,process)
    }
};