const client = {
  doc: document,
  app: null,
  width: null,
  ismob: false,
  lang: navigator.language,
  langIndex: 0,
  //default
  scale: 0.2,
  model: {
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
}
const l2dSpineModule = (function () {
  const getLangCode = function (langstr) {
    langstr = langstr.toLowerCase();
    return /^en\b/.test(langstr) ? 0 : /ko-kr/.test(langstr) ? 1 : /ja-jp/.test(langstr) ? 2 : 0;
  }
  function scaleCalc(aw, cw) {
    let sclv = aw / cw;
    let offset = 0;
    console.log(sclv);
    if (sclv >= 2) {
      //mob vertical;
      console.log(1);
      offset = 0.05;
      client.ismob = true;
    } else if (sclv >= 0.8) {
      //mob hoz;
      console.log(2);
      offset = 0.15;
      client.ismob = true;
      //client.scale - 0.45;
    } else {
      console.log(3);
      offset = 0.25;
    }
    sclv = Number(((aw / cw) / 10).toFixed(2)) + offset;
    console.log(sclv);
    return sclv;
  }

  function makeRequest(method, url, data = {}) {
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.open(method ? method : 'get', url, true);
      xhr.onload = () => resolve(xhr);
      xhr.onerror = () => reject(xhr);
      data != {} ? xhr.send(JSON.stringify(data)) : xhr.send();
    });
  }
  /**
   * @class l2dSpine
   */
  class l2dSpine {
    constructor(basePath) {
      this.basePath = basePath ? basePath : './asset';
    }
    autoResize(model) {
      client.scale = scaleCalc(client.app.screen.width, client.doc.body.clientWidth);
      if (model) {
        console.log('orientation is changed');
        model.scale.set(client.scale);
      }
    }
    onAssetsLoaded(loader, res) {
      console.log('init');
      // create a spine boy
      const Modelkeys = Object.keys(res);
      const model = new PIXI.spine.Spine(res[Modelkeys[0]].spineData);
      const loopAnimations = [];
      client.model.now.n = Object.keys(client.app.loader.resources)[0];
      client.model.now.sAni = Object.keys(res[Modelkeys[0]].data.animations);
      client.model.now.aAni = [];

      // set the position
      model.x = (client.app.screen.width / 2); // client.app.screen.width/2; // this.app.screen.width;
      model.y = client.app.screen.height; // client.app.screen.height;

      model.scale.set(client.scale);
      //model.scale.set(0.25);
      client.app.stage.addChild(model);
      //console.log(model)
      console.log(res[Modelkeys[0]].data.animations);


      var bool = client.model.now.n == 'arona';
      console.log('model is arona? :', bool);
      if (bool) {
        //singleAnimations = singleAnimations.filter(a => !['Dummy', 'Dev'].includes(a));
        //console.log( this.model.now.sAni)
        loopAnimations.push('Idle_00', 'Idle_02');
      }
      client.model.now.aAni = [].concat(client.model.now.sAni, loopAnimations);
      client.model.now.nAni.n = '';

      // Press the screen to play a random animation
      client.app.stage.on('pointerdown', () => {
        let animation = '';
        do {
          animation = client.model.now.aAni[Math.floor(Math.random() * client.model.now.aAni.length)];
        } while (animation === client.model.now.nAni.n);
        console.log(animation);
        model.state.setAnimation(0, animation, loopAnimations.includes(animation));

        client.model.now.nAni.n = animation;
      });
      window.addEventListener('orientationchange', () => autoResize(model), false);
    }
    slBoxRender(json) {
      const self = this;
      const cselBox = document.querySelector('.cselContinerWrap .cselContiner');
      console.log(json);
      let slModels = [];
      for (let i in json) {
        for (let k of json[i]) {
          slModels.push({
            n: k.f,
            d: [k.ds[client.langIndex], k.n[client.langIndex]],
            etype: i,
            p: `${self.basePath}/${k.f}/${k.m[0]}`,
            fsufix: k.m[1]
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
      client.model.list = [];
      slModels.forEach(e => {
        let el = document.createElement('div');
        el.id = e.n;
        el.className = 'item';
        el.dataset.mp = e.p;
        el.dataset.sufix = e.fsufix;
        for (let i = 0, a = ['span', 'p']; i < a.length; i++) {
          let elIn = document.createElement(a[i]);
          elIn.innerText = i == 0 ? `[${e.d[i]}]` : e.d[i];
          el.appendChild(elIn);
        }
        cselBox.appendChild(el);
        client.model.list.push({
          name: e.n, url: e.p, metadata: {
            spineAtlasSuffix: e.fsufix
          }
        });
      });
      client.model.userSel = client.model.list[0];
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
                    spineAtlasSuffix: target.dataset.sufix
                  }
                };
                client.model.userSel = obj;
                self.renderStart(client.model.userSel);
              },
              //no
              function (e) {
                console.log(e);
                let ep = e.parentElement;
                ep.parentElement.querySelector('.cselContiner').childNodes.forEach(c => {
                  c.classList.remove('sortDone')
                  document.querySelector('.cselContinerWrap .cselContiner').appendChild(c);
                  //c.remove();
                });
                ep.remove();
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
    renderStart(modeldata) {
      console.log(modeldata)
      document.querySelector('.cnvWrap .startCover').remove();
      document.querySelector('.cselContinerWrap .cselContiner').childNodes.forEach(c => {
        console.log(c)
        c.remove();
      });
      document.querySelector('.cselContinerWrap .cselContiner').style.visibility = 'collapse';
      document.querySelector('.cselContinerWrap').append((() => {
        let el = document.createElement('button');
        el.innerText = 'reload';
        el.onclick = () => location.reload();
        return el;
      })())
      console.log('On rendering')
      client.app.view.parentElement.onclick = null;
      client.app.loader.add(modeldata).load(this.onAssetsLoaded);
      client.app.stage.interactive = true;
      //console.log(self.app)
      this.autoResize();
    };
    init() {
      const self = this;
      client.langIndex = getLangCode(navigator.language);
      client.width = Number(client.doc.body.clientWidth);
      client.app = new PIXI.Application({
        resizeTo: client.doc.querySelector('.cnvWrap')
      });
      const cover = document.createElement('div');
      cover.className = 'startCover';
      let stmsg = ['Click To Start Render.', 'Or', 'Drag chrCard from bottom to here.', 'start'];
      ((stmsg) => {
        for (let i = 0, a = stmsg; i < a.length; i++) {
          let el = i != a.length - 1 ? document.createElement('p') : document.createElement('button');
          el.innerText = a[i];
          if (i == a.length - 1) {
            el.onclick = () => self.renderStart(client.model.userSel);
          }
          cover.appendChild(el);
        }
        let el = document.createElement('div');
        el.className = 'dragBoxWrap';
        el.appendChild((() => {
          let e = document.createElement('div');
          e.className = 'cselContiner';
          return e;
        })())
        cover.appendChild(el);
      })(stmsg);
      // const btnwarp = document.createElement('div');
      // btnwarp.className = 'btnwarp';

      client.doc.querySelector('.cnvWrap').append(client.app.view, cover);
      document.querySelector('.cselContinerWrap .cselContiner').append((() => {
        let e = document.createElement('p');
        e.id = 'onload';
        e.innerText = 'On loading...';
        return e;
      })());
      makeRequest('get', './asset/assetList.json').then(xhr => this.slBoxRender(JSON.parse(xhr.response)))
    };
  };
  return l2dSpine;
})();