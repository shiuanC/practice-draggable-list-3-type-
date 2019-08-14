var draging = null,
    dragingClone = null,
    finTarget = null;
var DragList = function(opts){
    var me = this;
    this.opts = this.extend({
        ID:'',
        data:[],
        type:'simple'
    },opts);
    Object.defineProperty(this, 'data',{
        configurable:true,
        enumerable:true,
        set:function(newval){
            me.opts.data = newval;
        },
        //let data synchronize every time been get
        get:function(){
            me.opts.data = me.sync(document.querySelector(me.opts.el));
            return me.opts.data;
        }
    })
    //this.data = this.opts.data;
    this.type = this.opts.type;
    this.init(this.opts.el);
}
DragList.prototype={
    extend: function (obj, obj2) {
        var length = arguments.length;
        var target = arguments[0] || {};
        if (typeof target!="object" && typeof target != "function") {
            target = {};
        }
        if (length == 1) {
            target = this;
            i--;
        }
        for (var i = 1; i < length; i++) { 
            var source = arguments[i]; 
            for (var key in source) { 
                // 使用for in会遍历数组所有的可枚举属性，包括原型。
                if (Object.prototype.hasOwnProperty.call(source, key)) { 
                    if(key === 'style'){
                        this.extend(target[key],source[key]);
                    }else{
                        target[key] = source[key]; 
                    }
                } 
            } 
        }
        //console.log(target);
        return target; 
    },
    init:function(el){
        var DOM = document.querySelector(el);
        //create the list
        DOM.appendChild(this.buildList());

        //define basic drag
        this.setDrag(DOM);
        
        //set style
        this.style(DOM);
    },
    buildList:function(){
        var me = this,
            fragment = document.createDocumentFragment(),
            ul = document.createElement('ul');

        [].forEach.call(me.opts.data, function(theData){
            let theLi = document.createElement('li');
            theLi.draggable = true;
            theLi.textContent = theData.name;
            theLi.dataset.key=theData.id;
            ul.appendChild(theLi);
        });
        if(this.type =='shared'){
            ul.dataset['type'] = 'shared';
        }else if(this.type == 'simple'){
            ul.dataset['type'] = 'simple';
        }else if(this.type =='clone'){
            ul.dataset['type'] = 'clone';
        }
        fragment.appendChild(ul);
        return fragment;
    },
    setDrag:function(dom){
        var me = this;
        dom.ondragstart = function(event) {
            //can't use 'text' because will open a new tab
            event.dataTransfer.setData("te", event.target.innerText);
            draging = event.target;
            if(draging.parentNode.dataset.type == 'clone'){
                dragingClone = event.target.cloneNode(true);
            }//bug inside still copy
        }
        dom.ondragover = function(event) {
            event.preventDefault();
            var target = event.target;
            finTarget = target;
        //need to judge if its happened on li cause this may trigger on <ul> 
            if (target.nodeName === "LI"&&target !== draging) {
                //_index是实现的获取index     
                if(me.isInside(target,draging)){
                    me.Switch(target,draging);
                }else{
                    if(me.isShared(target,draging)){
                        me.Switch(target,draging);   
                    }
                    console.log(me.isClone(target,draging));
                    if(me.isClone(target,draging)){
                        me.Switch(target,dragingClone);   
                    }
                }
            }
        }
        
    },
    isInside:function(node1,node2){
        if(node1.parentNode === node2.parentNode){
            return true;
        }else{
            return false;
        }
    },
    isShared:function(node1,node2){
        if(node1.parentNode.dataset['type'] == 'shared' && node2.parentNode.dataset['type']=='shared'){
            return true;
        }
        return false;
    },
    isClone:function(node1, node2){
        if(node1.parentNode.dataset['type'] == 'clone' && node2.parentNode.dataset['type']=='clone'){
            return true;
        }
        return false;
    },
    Switch:function(target,draging){
        var idxDra = _index(draging),
            idxTar = _index(target);
        if (idxDra < idxTar) {
            target.parentNode.insertBefore(draging, target.nextSibling);
        }else {
            target.parentNode.insertBefore(draging, target);
        }
    },
    clone:function(target,draging){
        var idxDra = _index(draging),
            idxTar = _index(target);

        if(idxDra < idxTar){
            target.parentNode.insertBefore(draging.cloneNode(true), target.nextSibling);
        }else{
            target.parentNode.insertBefore(draging.cloneNode(true), target);
        }
    },
    sync:function(dom){
        var data = [],
            children = dom.getElementsByTagName('li');
        for(var i=0; i<children.length; i++){
            var obj = {};
            obj.name = children[i].textContent;
            obj.id=children[i].dataset.key;
            data.push(obj);
        }
        return data;
    },
    style:function(dom){
        var ul = dom.getElementsByTagName('ul')[0],
            List = dom.getElementsByTagName('li');
        ul.style.listStyle = 'none';
        ul.style.float = 'left';
        
        [].forEach.call(List, function(theLI){

            theLI.style.cssText='font-size: 16px;\
                width: 100px;\
                height: 40px;\
                border: 1px solid #999;\
                background: #EA6E59;\
                margin: 2px 0;\
                border-radius: 10px;\
                padding-left: 10px;\
                color: white;\
                cursor: move;';
        });
    }
}
function _index(el) {
    var index = 0;
    if (!el || !el.parentNode) {
        return -1;
    }
    while (el) {
        index++;
        el = el.previousElementSibling
    }
    return index-1;
}