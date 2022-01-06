class l2dSpine {
    constructor() {
        this.core = null;
        this.basePath = './asset';
        this.langIndex = 0;
        this.width = 800;
        this.app = null;
        this.docCL = null;
        this.scale = 0.2;
        this.model = {
            list: null,
            userSel: null,
            now: {
                n: null,
                //single
                sAni: null,
                //all
                aAni: null,
                //now
                nAni: { n: '', o: null }
            }
        }
        this.resizeModule = null;
        this.requestModule = null;
    }
    getLangCode(langstr) {
        langstr = langstr.toLowerCase();
        return /^en\b/.test(langstr) ? 0 : /ko-kr/.test(langstr) ? 1 : /ja-jp/.test(langstr) ? 2 : 0;
    };
    onAssetsLoaded(loader, res) {

        // const self = this;
        console.log('init');
        // create a spine boy
        const Modelkeys = Object.keys(res);
        console.log(res[Modelkeys[0]])
        const model = new PIXI.spine.Spine(res[Modelkeys[0]].spineData);
        
        let ar = res[Modelkeys[0]].metadata.ar;
        ar = ar ? (typeof ar == 'string' ? ar.split(',').map(x => Number(x)) : ar) : null;
        const loopAnimations = [];
        this.model.now.n = Object.keys(this.app.loader.resources)[0];
        this.model.now.sAni = Object.keys(res[Modelkeys[0]].data.animations);
        this.model.now.aAni = [].concat(this.model.now.sAni, loopAnimations);
        this.model.now.aAni.forEach(e => {
            let el = document.createElement('div');
            el.className = 'anis';
            el.innerText = e;
            el.addEventListener('click', (a) => {
                // console.log(model.state.getCurrent(model.state.tracks.length))
                model.state.setAnimation(0, a.target.innerText, false)
            })
            document.querySelector(`.${this.docCL[2]} .${this.docCL[3]}`).appendChild(el)
        })
        document.querySelector(`.${this.docCL[2]} .${this.docCL[3]}`).classList.add('ml')
        // set the position
        model.x = (this.app.screen.width / 2); // this.app.screen.width/2; // this.app.screen.width;
        model.y = this.app.screen.height; // this.app.screen.height;
        console.log(this.scale)
        model.scale.set(this.scale);
        //model.scale.set(0.25);
        /* debug*/
        model.drawDebug = true;
        // model.drawBones = true;
        //model.drawRegionAttachments = true;
        //model.drawClipping = true;
        //model.drawMeshHull = true;
        // model.drawMeshTriangles = true;
        //model.drawPaths = true;
        model.drawBoundingBoxes = true;
        console.log(model)
        this.app.stage.addChild(model);
        //console.log(model)
        console.log(res[Modelkeys[0]].data.animations);


        var bool = this.model.now.n == 'arona';
        console.log('model is arona? :', bool);
        if (bool) {
            //singleAnimations = singleAnimations.filter(a => !['Dummy', 'Dev'].includes(a));
            //console.log( this.model.now.sAni)
            loopAnimations.push('Idle_00', 'Idle_02');
        }

        this.model.now.nAni.n = '';

        // Press the screen to play a random animation
        this.app.stage.on('pointerdown', () => {
            let animation = '';
            do {
                animation = this.model.now.aAni[Math.floor(Math.random() * this.model.now.aAni.length)];
            } while (animation === this.model.now.nAni.n);
            console.log(animation);
            model.state.setAnimation(0, animation, loopAnimations.includes(animation));

            this.model.now.nAni.n = animation;
        });
        window.addEventListener('orientationchange', () => {
            this.resizeModule.autoResize(model, ar);
            this.scale = this.resizeModule.scale;

        }, false);
    }
    renderStart(modeldata) {
        const self = this;
        console.log(modeldata)
        document.querySelector(`.${this.docCL[4]} .${this.docCL[0]}`).remove();
        document.querySelector(`.${this.docCL[2]} .${this.docCL[3]}`).remove();
        document.querySelector(`.${this.docCL[2]}`).append((() => {
            let el = document.createElement('div');
            el.className = 'cselContiner';
            return el;
        })())
        document.querySelector(`.${this.docCL[2]} .${this.docCL[3]}`).style.visibility = 'collapse';
        document.querySelector(`.${this.docCL[4]}`).insertAdjacentElement('afterend', (() => {
            let el = document.createElement('button');
            el.className = 'btn reload';
            el.innerText = 'reload';
            el.onclick = () => location.reload();
            return el;
        })())

        console.log('On rendering')
        this.app.view.parentElement.onclick = null;
        let ar = modeldata.metadata.ar;
        ar = ar ? (typeof ar == 'string' ? ar.split(',').map(x => Number(x)) : ar) : null;
        this.resizeModule.autoResize(null, ar);
        this.scale = this.resizeModule.scale;
        this.app.loader.add(modeldata).load(this.onAssetsLoaded.bind(this));
        this.app.stage.interactive = true;

    };
    slBoxRender(json) {
        const self = this;
        const cselBox = document.querySelector(`.${this.docCL[2]} .${this.docCL[3]}`);
        console.log(json);
        let slModels = [];
        for (let i in json) {
            for (let k of json[i]) {
                slModels.push({
                    n: k.f,
                    d: [k.ds[self.langIndex], k.n[self.langIndex]],
                    etype: i,
                    p: `${self.basePath}/${k.f}/${k.m[0]}`,
                    fsufix: k.m[1],
                    a: k.a || null
                })
            }
        };
        let ctn = slModels.length;

        console.log(`${ctn} chr${ctn > 1 ? 's are ' : ' is'} loaded.`);
        cselBox.querySelector('p#onload').remove();
        const sortSetup = {
            group: 'chr',
            filter: '.sortDone',
            animation: 200,
            ghostClass: 'sortOnMove',
            onEnd: onsortDone
        }
        this.model.list = [];
        slModels.forEach(e => {
            let el = document.createElement('div');
            el.id = e.n;
            el.className = 'item';
            el.dataset.mp = e.p;
            el.dataset.sufix = e.fsufix;
            if (e.a) {
                el.dataset.ar = e.a;
            }
            for (let i = 0, a = ['span', 'p']; i < a.length; i++) {
                let elIn = document.createElement(a[i]);
                elIn.innerText = i == 0 ? `[${e.d[i]}]` : e.d[i];
                el.appendChild(elIn);
            }
            cselBox.appendChild(el);
            this.model.list.push({
                name: e.n, url: e.p, metadata: {
                    spineAtlasSuffix: e.fsufix,
                    ar: e.a || null
                }
            });
        });
        this.model.userSel = this.model.list[0];
        function onsortDone(evt) {
            const d = 'sortDone';
            var eli = evt.item;
            if (evt.to.parentElement.parentElement.className == 'startCover') {
                eli.classList.add(d);
                cselBox.childNodes.forEach(c => c.classList ? c.classList.add(d) : c.className = d);
                evt.to.parentElement.append((() => {
                    let el = document.createElement('div');
                    el.className = 'cover';
                    let fns = [
                        //yes
                        (e) => {
                            let ep = e.parentElement, target = null;

                            target = ep.parentElement.querySelector(`.${self.docCL[3]}`).childNodes[0];

                            let obj = {
                                name: target.id, url: target.dataset.mp, metadata: {
                                    spineAtlasSuffix: target.dataset.sufix,
                                    ar: target.dataset.ar ? target.dataset.ar : null
                                }
                            };

                            self.model.userSel = obj;
                            self.renderStart(self.model.userSel);
                        },
                        //no
                        (e) => {
                            console.log(e);
                            let ep = e.parentElement;
                            console.log(ep.parentElement.querySelector(`.${self.docCL[3]}`));
                            ep.parentElement.querySelector(`.${self.docCL[3]}`).childNodes.forEach(c => {
                                c.classList.remove('sortDone');
                                document.querySelector(`.${self.docCL[2]} .${self.docCL[3]}`).appendChild(c);
                                //c.remove();
                            });
                            ep.remove();
                            console.log(document.querySelector(`.${self.docCL[2]} .${self.docCL[3]}`).children);
                            Array.from(document.querySelector(`.${self.docCL[2]} .${self.docCL[3]}`).children).forEach(c => {
                                c.classList.remove('sortDone');
                            });
                        }
                    ];
                    for (let i = 0, a = ['p', 'button', 'button'], b = ['Are You Sure?', 'Yes', 'No']; i < a.length; i++) {
                        let element = document.createElement(a[i]);
                        element.innerText = b[i];
                        if (i != 0) {
                            element.addEventListener("click", (e) => fns[i - 1](e.target))
                        }
                        el.appendChild(element)
                    }
                    return el;
                })())
            };

        };
        $(`.${this.docCL[0]} .${this.docCL[1]} .${this.docCL[3]}`).sortable(sortSetup);
        $(`.${this.docCL[2]} .${this.docCL[3]}`).sortable(sortSetup);
    };
    init() {
        const self = this;
        let cover = null;
        let stmsg = ['Click To Start Render.', 'Or', 'Drag chrCard from bottom to here.', 'start', 'CardContiner'];
        this.docCL = ['startCover', 'dragBoxWrap', 'cselContinerWrap', 'cselContiner', 'cnvWrap'];
        this.langIndex = this.getLangCode(navigator.language);
        this.width = Number(document.body.clientWidth);
        this.app = new PIXI.Application();
        this.requestModule = new requester();
        this.resizeModule = new resizeMgr();
        this.resizeModule.init(this.app);

        ((stmsg, doc) => {
            cover = document.createElement('div');
            cover.className = this.docCL[0];
            stmsg.forEach((e, i, a) => {
                let el = i != a.length - 2 ? doc.createElement('p') : doc.createElement('button');
                el.innerText = e;
                if (i == a.length - 2) {
                    el.onclick = () => self.renderStart(self.model.userSel);
                }
                cover.appendChild(el);
            });
            let el = doc.createElement('div');
            el.className = this.docCL[1];
            el.appendChild((() => {
                let e = doc.createElement('div');
                e.className = this.docCL[3];
                return e;
            })())
            cover.lastChild.replaceWith(el);
            doc.querySelector(`.${this.docCL[4]}`).append(self.app.view, cover);
            doc.querySelector(`.${this.docCL[2]} .${this.docCL[3]}`).append((() => {
                let e = doc.createElement('p');
                e.id = 'onload';
                e.innerText = 'On loading...';
                return e;
            })());
        })(stmsg, document);
        this.requestModule.req('./asset/assetList.json').then(xhr => this.slBoxRender(JSON.parse(xhr.response)));
    };
};
