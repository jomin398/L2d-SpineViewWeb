class zip {
    /**
     * @constructor
     * @param {ArrayBuffer} data arraybuffer from zip file;
     * @throws {Error} JSZip module init error;
     */
    constructor(data) {
        if (!JSZip) {
            throw new Error('require JSZip module.');
        }
        this.target = data;
        this.links = null;
    };
    /**
     * @param {*} onStart onStart unzip callback
     * @param {*} onDone onDone unzip callback
     * @returns 
     */
    unzip(onStart, onDone) {
        if (onStart) {
            onStart();
        }
        return new Promise(async (res, rej) => {
            try {
                let d = await JSZip.loadAsync(this.target);
                res(d)
            } catch (error) {
                rej(e)
            }
            if(onDone){
                onDone();
            }
        });
    }
}