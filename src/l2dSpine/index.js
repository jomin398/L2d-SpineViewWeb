const l2dSpineModule = (function() {
  const getLangCode = function(langstr) {
    langstr = langstr.toLowerCase();
    return /^en\b/.test(langstr) ? 0 : /ko-kr/.test(langstr) ? 1 : /ja-jp/.test(langstr) ? 2 : 0;
  }
  const client = {
    doc: document,
    app: null,
    width: null,
    ismob: false,
    lang: navigator.language,
    langIndex: getLangCode(navigator.language),
    //default
    scale: 0.2,
    model: {
      list: null,
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
    constructor() {}
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
      client.doc.querySelector('.cnvWrap button').innerText = 'reload';
      client.doc.querySelector('.cnvWrap button').onclick = () => location.reload();
    }
    slBoxRender(json) {
      const cselBox = document.querySelector('.cselContiner');
      console.log(json);
      let slModels = [];
      for (let i in json) {
        for (let k of json[i]) {
          slModels.push({
            n: k.f,
            d: [k.ds[client.langIndex], k.n[client.langIndex]],
            etype: i,
            p: k.f + '/' + k.m[0],
            fsufix: k.m[1]
          })
        }
      };
      let ctn = slModels.length;
      console.log(`${ctn} chr${ctn>1?'s are ':' is'} loaded.`);
      cselBox.querySelector('p#onload').remove();
      
      slModels.forEach(e => {
          let el = document.createElement('div');
          el.id = e.n;
          el.className = 'item';
          for (let i = 0, a = ['span', 'p']; i < a.length; i++) {
              let elIn = document.createElement(a[i]);
              elIn.innerText = i==0?`[${e.d[i]}]`:e.d[i];
              el.appendChild(elIn);
          }
          cselBox.appendChild(el)
      });
    }
    init() {
      const self = this;
      client.width = Number(client.doc.body.clientWidth);
      client.app = new PIXI.Application({
        resizeTo: client.doc.querySelector('.cnvWrap')
      });
      const cover = document.createElement('div');
      cover.className = 'startCover';
      let stmsg = ['Click To Start Render.', 'Or', 'Drag chrCard from bottom to here.'];
      ((stmsg) => {
        for (let i = 0, a = stmsg; i < a.length; i++) {
          let el = document.createElement('p')
          el.innerText = a[i];
          cover.appendChild(el);
        }
        let el = document.createElement('div');
        el.className = 'dragBox';
        cover.appendChild(el);
      })(stmsg);
      // const btnwarp = document.createElement('div');
      // btnwarp.className = 'btnwarp';

      client.doc.querySelector('.cnvWrap').append(client.app.view, cover);
      document.querySelector('.cselContiner').append((()=>{
        let e= document.createElement('p');
        e.id='onload';
      e.innerText = 'On loading...';
        return e;
      })());
      makeRequest('get', './asset/assetList.json').then(xhr => this.slBoxRender(JSON.parse(xhr.response)))
      // let st = client.doc.createElement('button');
      // st.innerText = 'start';
      // const pOnclick = function (modeldata) {
      //     console.log('onclick');
      //     client.app.view.parentElement.onclick = null;
      //     client.app.loader.add(modeldata).load(self.onAssetsLoaded);
      //     client.app.stage.interactive = true;
      //     //console.log(self.app)
      //     self.autoResize();
      // };
      // st.addEventListener('click', () => pOnclick(setups.tempChrModelData));
      // btnwarp.append(st);
    }
  };
  return l2dSpine;
})();