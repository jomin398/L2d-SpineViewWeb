(doc => {
    window.onload = () => {
        const app = new PIXI.Application();
        const btnwarp = document.createElement('div');
        btnwarp.className = 'btnwarp';

        function pOnclick(){
            app.view.parentElement.onclick = null;
            app.loader.pre((resource,next)=>{
                resource.crossOrigin = 'anonymous';
                resource.loadType = PIXI.loaders.Resource.LOAD_TYPE.XHR;
                next()
            })
            app.loader.add([
                {
                    name: "demon", url: "./data/Demon.json", metadata: {
                        spineAtlasSuffix: ".txt"
                    }
                }
            ])
                .load(onAssetsLoaded);
    
            app.stage.interactive = true;
            console.log(app)
            function onAssetsLoaded(loader, res) {
                // create a spine boy
                const Modelkeys = Object.keys(res);
                const demon = new PIXI.spine.Spine(res[Modelkeys[0]].spineData);
    
                // set the position
                demon.x = app.view.width/2;//app.screen.width;
                demon.y = app.view.height;//app.screen.height;
    
                demon.scale.set(0.5);
    
                app.stage.addChild(demon);
                console.log(res[Modelkeys[0]].data.animations);
                const singleAnimations = Object.keys(res[Modelkeys[0]].data.animations);
                const loopAnimations = [];
                const allAnimations = [].concat(singleAnimations, loopAnimations);
    
                let lastAnimation = '';
    
                // Press the screen to play a random animation
                app.stage.on('pointerdown', () => {
                    let animation = '';
                    do {
                        animation = allAnimations[Math.floor(Math.random() * allAnimations.length)];
                    } while (animation === lastAnimation);
    
                    demon.state.setAnimation(0, animation, loopAnimations.includes(animation));
    
                    lastAnimation = animation;
                });
            }
        }
        
        doc.querySelector('.cnvWrap').append(app.view,btnwarp);
app.view.parentElement.onclick = ()=>{pOnclick()};
        
    };

})(document)