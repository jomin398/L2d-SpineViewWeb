class resizeMgr {
  constructor() {
    this.scale = 0;
    this.app = null;
    this.ismob = false;
  }
  init(app) {
    this.app = app;
  }
  scaleCalc(arSetList) {
    let aw = this.app.screen.width, cw = document.body.clientWidth;
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
      this.ismob = true;
    } else if (sclv >= 0.8) {
      //mob hoz;
      console.log(2);
      offset = arSetList[1];
      this.ismob = true;
      //this.scale - 0.45;
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
  autoResize(model, arSetList) {
    console.log(this.app.view.width / this.app.view.clientWidth)
    this.scale = this.scaleCalc(arSetList);
    console.log(this.scale);
    if (model) {
      console.log('orientation is changed');
      model.scale.set(this.scale);
    }
  }
}