(doc => {
    const client = {
        width: null
    }
    window.onload = () => {
        client.width = Number(doc.body.clientWidth);
        console.log(client.width)
        const app = new PIXI.Application({
            width: 400, height: 400
        });
        const btnwarp = document.createElement('div');
        btnwarp.className = 'btnwarp';

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
            ])
                .load(onAssetsLoaded);

            app.stage.interactive = true;
            //console.log(app)
            function onAssetsLoaded(loader, res) {
                // create a spine boy
                const Modelkeys = Object.keys(res);
                const model = new PIXI.spine.Spine(res[Modelkeys[0]].spineData);
                
                // set the position
                model.x = app.screen.width/2; //app.screen.width;
                model.y = app.screen.height; //app.screen.height;

                model.scale.set(0.1);

                app.stage.addChild(model);
                console.log(model)
                console.log(res[Modelkeys[0]].data.animations);
                const singleAnimations = Object.keys(res[Modelkeys[0]].data.animations);
                const loopAnimations = [];
                var bool = Object.keys(app.loader.resources)[0] =='arona';
                console.log('model is arona? :',bool)
                if(bool){
                    loopAnimations.push('Idle_00');
                }
                const allAnimations = [].concat(singleAnimations, loopAnimations);

                let lastAnimation = '';

                // Press the screen to play a random animation
                app.stage.on('pointerdown', () => {
                    let animation = '';
                    do {
                        animation = allAnimations[Math.floor(Math.random() * allAnimations.length)];
                    } while (animation === lastAnimation);

                    model.state.setAnimation(0, animation, loopAnimations.includes(animation));

                    lastAnimation = animation;
                });
            }
        }

        doc.querySelector('.cnvWrap').append(app.view, btnwarp);
        st = doc.createElement('button');
        st.innerText = 'start';
        st.onclick = () => { pOnclick() };
        btnwarp.append(st)
    };

})(document)