/**
 * Created by renminghe on 2017/6/14.
 */
declare const $;

export class Snow {
    // 初始化创建实例
    private left : any;
    private endBottom : any;
    private width : any;
    private spanItem : any;
    private speed : Number = 5000;
    constructor(dom) {
        let count = Math.ceil(Math.random() * 10) + 1;
        for (let i = 0; i < count; i ++) {
            this.left = Math.random() * 100;
            this.endBottom = Math.random() * 100 + 80;
            // let speed = Math.random() * 5000 + 1000;
            this.width = Math.random() * 5 + 1;
            this.spanItem = document.createElement("span");
            dom.append(this.spanItem);
            $(this.spanItem).css({
                "position": "absolute",
                "left":this.left + "%",
                "top": "-5px",
                "backgroundColor": "#FFF",
                "width": this.width + "px",
                "height": this.width + "px",
                "borderRadius": "50%",
                "boxShadow": "0 0 6px #FFF",
            }).animate({"top": this.endBottom + "px"}, this.speed);
        }
    }

    // 清除多余的实例
    clearRam(dom) {
        let spans = $(dom).children('span');
        if (spans.length > 30) {
            for (let i = 0; i < 10; i ++) {
                $(dom).children('span').eq(0).remove();
            }
        }
    }

    // 动画
    public static snowAnmiate(dom) {
    let snows = new Snow(dom);
    setInterval(() => {
        snows = new Snow(dom);
        snows.clearRam(dom);
    }, 2000);
}


}