class Request {
    private url: string = "";
    private headers: HeadersInit = {};
    private body: Object = {};
    constructor(_url?: string, _headers?: HeadersInit, _body?: Object) {
        if (_url) this.url = _url;
        if (_headers) this.headers = _headers;
        if (_body) this.body = _body;
    }
    async get(_url?: string, _headers?: HeadersInit) {
        // For override
        if (_url) this.url = _url;
        if (_headers) this.headers = _headers;
        const options = { method: "GET", headers: {...this.headers} }
        if (!this.url) {
            throw Error("Cannot make GET request without a URL");
        }
        return fetch(this.url, options)
        .then(res => res.json())
        .then(res => {
            return res;
        })
        .catch(err => {
            console.log(err);
            return err;
        }) 
    }
    async post(_url?: string, _headers?: HeadersInit, _body?: Object) {
        // For override
        if (_url) this.url = _url;
        if (_headers) this.headers = _headers;
        if (_body) this.body = _body;
        const options = { method: "POST", headers: {...this.headers}, body: JSON.stringify(this.body) }
        if (!this.url) {
            throw Error("Cannot make POST request without a URL");
        }
        return fetch(this.url, options)
        .then(res => res.json())
        .then(res => {
            return res;
        })
        .catch(err => {
            console.log(err);
            return err;
        }) 
    }

}

function validateUrl(hostname: string, path: string, params: string): void | Error {
    if (!hostname.match("^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63}){1,}$"))
        return new Error("Not a valid hostname")
    if (path === "" || !path.match("^\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)$"))
        return new Error("Not a valid path") 
    if (params === "" || !params.match("\?(\w+=\w+(&\w+=\w+)*)?")) 
        return new Error("Not a valid set of params")
}

export default Request;