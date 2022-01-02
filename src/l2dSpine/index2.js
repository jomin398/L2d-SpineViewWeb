class l2dSpine {
    constructor() {
        this.core= null;
        this.basePath = './asset';
        this.langIndex = 0;
        this.width = 800;
        this.app = null;
        this.doc = null;
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
    }
    makeRequest(method, url, data = {}) {
        const xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            xhr.open(method ? method : 'get', url, true);
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => reject(xhr);
            data != {} ? xhr.send(JSON.stringify(data)) : xhr.send();
        });
    }
    getLangCode(langstr) {
        langstr = langstr.toLowerCase();
        return /^en\b/.test(langstr) ? 0 : /ko-kr/.test(langstr) ? 1 : /ja-jp/.test(langstr) ? 2 : 0;
    };
    onAssetsLoaded(loader, res) {

        // const self = this;
        console.log('init');
        // create a spine boy
        console.log(this)
        const Modelkeys = Object.keys(res);
        
        const model = new PIXI.spine.Spine(res[Modelkeys[0]].spineData);
  
        let ar = res[Modelkeys[0]].metadata.ar;
        ar = ar ?(typeof ar =='string'?ar.split(',').map(x => Number(x)):ar) : null;
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
          document.querySelector('.cselContinerWrap .cselContiner').appendChild(el)
        })
        document.querySelector('.cselContinerWrap .cselContiner').classList.add('ml')
        // set the position
        model.x = (this.app.screen.width / 2); // this.app.screen.width/2; // this.app.screen.width;
        model.y = this.app.screen.height; // this.app.screen.height;
  
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
        window.addEventListener('orientationchange', () => { this.resizeModule.autoResize(model, ar) }, false);
      }
    renderStart(modeldata) {
        const self = this;
        console.log(modeldata)
        let continer = '.cselContinerWrap .cselContiner';
        document.querySelector('.cnvWrap .startCover').remove();
        document.querySelector('.cselContinerWrap .cselContiner').remove();
        document.querySelector('.cselContinerWrap').append((() => {
            let el = document.createElement('div');
            el.className = 'cselContiner';
            return el;
        })())
        document.querySelector('.cselContinerWrap .cselContiner').style.visibility = 'collapse';
        document.querySelector('.cnvWrap').insertAdjacentElement('afterend', (() => {
            let el = document.createElement('button');
            el.className = 'btn reload';
            el.innerText = 'reload';
            el.onclick = () => location.reload();
            return el;
        })())

        console.log('On rendering')
        this.app.view.parentElement.onclick = null;
        this.app.loader.add(modeldata).load(this.onAssetsLoaded.bind(this));
        this.app.stage.interactive = true;
        let ar = modeldata.metadata.ar;
        ar = ar ? (typeof ar == 'string' ? ar.split(',').map(x => Number(x)) : ar) : null;
        this.resizeModule.autoResize(null, ar);
    };
    slBoxRender(json) {
        const self = this;
        const cselBox = document.querySelector('.cselContinerWrap .cselContiner');
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
                        function (e) {
                            let ep = e.parentElement, target = null;
                            target = ep.parentElement.querySelector('.cselContiner').childNodes[0];

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
                        function (e) {
                            console.log(e);
                            let ep = e.parentElement;
                            console.log(ep.parentElement.querySelector('.cselContiner'))
                            ep.parentElement.querySelector('.cselContiner').childNodes.forEach(c => {
                                c.classList.remove('sortDone')
                                document.querySelector('.cselContinerWrap .cselContiner').appendChild(c);
                                //c.remove();
                            });
                            ep.remove();
                            console.log(document.querySelector('.cselContinerWrap .cselContiner').children)
                            Array.from(document.querySelector('.cselContinerWrap .cselContiner').children).forEach(c => {
                                c.classList.remove('sortDone')
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

        $('.startCover .dragBoxWrap .cselContiner').sortable(sortSetup);
        $('.cselContinerWrap .cselContiner').sortable(sortSetup);
    }
    init() {
        const self = this;
        this.langIndex = this.getLangCode(navigator.language);
        this.width = Number(document.body.clientWidth);
        this.app = new PIXI.Application({
            width:1200,
               height:1200
        });
        this.resizeModule = new resizeMgr();
        this.resizeModule.init(this.app);

        const cover = document.createElement('div');
        cover.className = 'startCover';
        let stmsg = ['Click To Start Render.', 'Or', 'Drag chrCard from bottom to here.', 'start'];
        ((stmsg, doc) => {
            for (let i = 0, a = stmsg; i < a.length; i++) {
                let el = i != a.length - 1 ? doc.createElement('p') : doc.createElement('button');
                el.innerText = a[i];
                if (i == a.length - 1) {
                    el.onclick = () => self.renderStart(self.model.userSel);
                }
                cover.appendChild(el);
            }
            let el = doc.createElement('div');
            el.className = 'dragBoxWrap';
            el.appendChild((() => {
                let e = doc.createElement('div');
                e.className = 'cselContiner';
                return e;
            })())
            cover.appendChild(el);
        })(stmsg, document);
        // const btnwarp = document.createElement('div');
        // btnwarp.className = 'btnwarp';

        document.querySelector('.cnvWrap').append(this.app.view, cover);
        document.querySelector('.cselContinerWrap .cselContiner').append((() => {
            let e = document.createElement('p');
            e.id = 'onload';
            e.innerText = 'On loading...';
            return e;
        })());
        this.makeRequest('get', './asset/assetList.json').then(xhr => this.slBoxRender(JSON.parse(xhr.response)))
    };
};
