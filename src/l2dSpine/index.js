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
  function autoResize(model, arSetList) {
    client.scale = scaleCalc(client.app.screen.width, client.doc.body.clientWidth, arSetList);
    if (model) {
      console.log('orientation is changed');
      model.scale.set(client.scale);
    }
  }
  function scaleCalc(aw, cw, arSetList) {
    let sclv = aw / cw;
    let offset = 0;
    if (!arSetList) {
      arSetList = [
        0.04,
        0.15,
        0.25
      ]
    }
    if (sclv >= 2) {
      //mob vertical;
      console.log(1);
      offset = arSetList[0];
      client.ismob = true;
    } else if (sclv >= 0.8) {
      //mob hoz;
      console.log(2);
      offset = arSetList[1];
      client.ismob = true;
      //client.scale - 0.45;
    } else {
      console.log(3);
      offset = arSetList[2];
    }
    sclv = Number(((aw / cw) / 10).toFixed(2));
    console.log(offset)
    sclv = sclv + offset;
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
    onAssetsLoaded(loader, res) {
      const self = this;
      console.log('init');
      // create a spine boy
      const Modelkeys = Object.keys(res);

      const model = new PIXI.spine.Spine(res[Modelkeys[0]].spineData);
     

      let ar = res[Modelkeys[0]].metadata.ar;
      ar = ar ? ar.split(',').map(x => Number(x)) : null;
      const loopAnimations = [];
      client.model.now.n = Object.keys(client.app.loader.resources)[0];
      client.model.now.sAni = Object.keys(res[Modelkeys[0]].data.animations);
      client.model.now.aAni = [].concat(client.model.now.sAni, loopAnimations);
      client.model.now.aAni.forEach(e => {
        let el = document.createElement('div');
        el.className = 'anis';
        el.innerText = e;
        el.addEventListener('click', (a) => {
          // console.log(model.state.getCurrent(model.state.tracks.length))
          model.state.setAnimation(0, a.target.innerText, false)
        })
        document.querySelector('.cselContinerWrap .cselContiner').appendChild(el)
      })
      document.querySelector('.cselContinerWrap .cselContiner').style.visibility = 'visible';
      document.querySelector('.cselContinerWrap .cselContiner').style.flexWrap = 'wrap';
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
      window.addEventListener('orientationchange', () => { autoResize(model, ar) }, false);
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
      client.model.list = [];
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
        client.model.list.push({
          name: e.n, url: e.p, metadata: {
            spineAtlasSuffix: e.fsufix,
            ar: e.a || null
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
                    spineAtlasSuffix: target.dataset.sufix,
                    ar: target.dataset.ar ? target.dataset.ar : null
                  }
                };
                client.model.userSel = obj;
                self.renderStart(client.model.userSel);
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
                console.log( document.querySelector('.cselContinerWrap .cselContiner').children)
                Array.from(document.querySelector('.cselContinerWrap .cselContiner').children).forEach(c => {
                  c.classList.remove('sortDone')});
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
      client.app.view.parentElement.onclick = null;
      client.app.loader.add(modeldata).load(this.onAssetsLoaded);
      client.app.stage.interactive = true;
      let ar = modeldata.metadata.ar;
      ar = ar ? ar.split(',').map(x => Number(x)) : null;
      autoResize(null, ar);
    };
    init() {
      const self = this;
      client.langIndex = getLangCode(navigator.language);
      client.width = Number(client.doc.body.clientWidth);
      client.app = new PIXI.Application({
        // resizeTo: client.doc.querySelector('.cnvWrap'),
        // height:600
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