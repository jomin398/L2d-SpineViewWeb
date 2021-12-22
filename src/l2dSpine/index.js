const l2dSpineModule = (function () {
    //constructor
    const scaleCalc = (aw, cw) => {
        let sclv = aw / cw;
        let offset = 0;
        console.log(sclv);
        if (sclv >= 2) {
            //mob vertical;
            console.log(1)
            offset = 0.05;
        } else if (sclv >= 0.8) {
            //mob hoz;
            console.log(2)
            offset = 0.15; //client.scale - 0.45;
        } else {
            console.log(3)
            offset = 0.25;
        }
        sclv = Number(((aw / cw) / 10).toFixed(2)) + offset;
        console.log(sclv);
        return sclv;
    };
    function l2dSpine() {
        this.doc = document;
        this.app = null;
        this.width = null;
        //default
        this.scale = 0.2;
        this.model = {
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
    };
    l2dSpine.prototype.autoResize = function (model) {
        this.scale = scaleCalc(this.app.screen.width, this.doc.body.clientWidth);
        if (model) {
            console.log('orientation is changed')
            model.scale.set(this.scale);
        }
    };
    l2dSpine.prototype.onAssetsLoaded = function (loader,res) {
        console.log('init')
        // create a spine boy
        const Modelkeys = Object.keys(res);
        const model = new PIXI.spine.Spine(res[Modelkeys[0]].spineData);
        const loopAnimations = [];
        console.log(this)
        this.model.now.n = Object.keys(this.app.loader.resources)[0];
        this.model.now.sAni = Object.keys(res[Modelkeys[0]].data.animations);
        this.model.now.aAni = [];

        // set the position
        model.x = (this.app.screen.width / 2) // this.app.screen.width/2; // this.app.screen.width;
        model.y = this.app.screen.height; // this.app.screen.height;

        model.scale.set(this.scale);
        //model.scale.set(0.25);

        this.app.stage.addChild(model);
        //console.log(model)
        console.log(res[Modelkeys[0]].data.animations);


        var bool = this.model.now.n == 'arona';
        console.log('model is arona? :', bool)
        if (bool) {
            //singleAnimations = singleAnimations.filter(a => !['Dummy', 'Dev'].includes(a));
            //console.log( this.model.now.sAni)
            loopAnimations.push('Idle_00', 'Idle_02');
        }
        this.model.now.aAni = [].concat(this.model.now.sAni, loopAnimations);
        this.model.now.nAni.n = '';

        // Press the screen to play a random animation
        this.app.stage.on('pointerdown', () => {
            let animation = '';
            do {
                animation = self.model.now.aAni[Math.floor(Math.random() * self.model.now.aAni.length)];
            } while (animation === self.model.now.nAni.n);
            console.log(animation)
            model.state.setAnimation(0, animation, loopAnimations.includes(animation));

            self.model.now.nAni.n = animation;
        });
        window.addEventListener('orientationchange', () => autoResize(model), false);
        this.doc.querySelector('.cnvWrap button').innerText = 'reload';
        this.doc.querySelector('.cnvWrap button').onclick = () => location.reload();
    }
    l2dSpine.prototype.init = function () {
        const self = this;
        this.width = Number(this.doc.body.clientWidth);
        this.app = new PIXI.Application({
            resizeTo: this.doc.querySelector('.cnvWrap')
        });

        const btnwarp = document.createElement('div');
        btnwarp.className = 'btnwarp';

        this.doc.querySelector('.cnvWrap').append(this.app.view, btnwarp);
        let st = this.doc.createElement('button');
        st.innerText = 'start';
        const pOnclick = function (modeldata) {
            console.log('onclick');
            self.app.view.parentElement.onclick = null;
            self.app.loader.add(modeldata).load(self.onAssetsLoaded);
            self.app.stage.interactive = true;
            //console.log(self.app)
            self.autoResize();
        };
        st.addEventListener('click',() => pOnclick(setups.tempChrModelData));
        btnwarp.append(st);
    }
    return l2dSpine;
})();