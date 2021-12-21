const client = {
  width: null,
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
window.onload = () => {
  const doc = document;
  client.width = Number(doc.body.clientWidth);
  const app = new PIXI.Application({
    resizeTo: doc.querySelector('.cnvWrap')
  });
  const btnwarp = document.createElement('div');
  btnwarp.className = 'btnwarp';
  function autoResize(model) {
    client.scale = app.screen.width / doc.body.clientWidth;
    console.log(client.scale)
    if (client.scale >= 2) {
      console.log(1)
      client.scale = Number(((app.screen.width /
        doc.body.clientWidth) / 10).toFixed(2));
    } else if (client.scale >= 0.8) {
      console.log(2)
      client.scale = Number(((app.screen.width /
        doc.body.clientWidth) / 10).toFixed(2)) + 0.15//client.scale - 0.45;
    } else {
      console.log(3)
      client.scale = Number(((app.screen.width /
        doc.body.clientWidth) / 10).toFixed(2)) + 0.24
    }
    console.log(client.scale)
    if (model) {
      console.log('orientation is changed')
      model.scale.set(client.scale);
    }
  }
  function pOnclick() {
    console.log('onclick')
    app.view.parentElement.onclick = null;
    app.loader.add([
      {
        // name: "demon",
        // url: "./data/Demon.json",
        // metadata: {
        //     spineAtlasSuffix: ".txt"
        // }
        name: "arona",
        url: "./asset/arona/arona_workpage.json",
        metadata: {
          spineAtlasSuffix: ".atlas"
        }
      }
    ]).load(onAssetsLoaded);

    app.stage.interactive = true;
    //console.log(app)
    autoResize();


    function onAssetsLoaded(loader, res) {
      // create a spine boy
      const Modelkeys = Object.keys(res);
      const model = new PIXI.spine.Spine(res[Modelkeys[0]].spineData);
      const loopAnimations = [];

      client.model.now.n = Object.keys(app.loader.resources)[0];
      client.model.now.sAni = Object.keys(res[Modelkeys[0]].data.animations);
      client.model.now.aAni = [];

      // set the position
      model.x = (app.screen.width / 2) //app.screen.width/2; //app.screen.width;
      model.y = app.screen.height; //app.screen.height;

      model.scale.set(client.scale);
      //model.scale.set(0.25);

      app.stage.addChild(model);
      console.log(model)
      console.log(res[Modelkeys[0]].data.animations);


      var bool = client.model.now.n == 'arona';
      console.log('model is arona? :', bool)
      if (bool) {
        //singleAnimations = singleAnimations.filter(a => !['Dummy', 'Dev'].includes(a));
        console.log(client.model.now.sAni)
        loopAnimations.push('Idle_00', 'Idle_02');
      }
      client.model.now.aAni = [].concat(client.model.now.sAni, loopAnimations);
      client.model.now.nAni.n = '';

      // Press the screen to play a random animation
      app.stage.on('pointerdown', () => {
        let animation = '';
        do {
          animation = client.model.now.aAni[Math.floor(Math.random() * client.model.now.aAni.length)];
        } while (animation === client.model.now.nAni.n);
        console.log(animation)
        model.state.setAnimation(0, animation, loopAnimations.includes(animation));

        client.model.now.nAni.n = animation;
      });
      window.addEventListener('orientationchange', () => autoResize(model), false);
      doc.querySelector('.cnvWrap button').innerText = 'reload';
      doc.querySelector('.cnvWrap button').onclick = ()=>location.reload();
    }
  }

  doc.querySelector('.cnvWrap').append(app.view, btnwarp);
  st = doc.createElement('button');
  st.innerText = 'start';
  st.onclick = () => { pOnclick() };
  btnwarp.append(st)
};