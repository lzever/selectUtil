/*!
 *
 *  @author zhenhui
 *  @下拉框模糊搜索组件
 *  
 */
 
(function (name, definition, context) {
     /*
      兼容amd、cmd、node.js的封装方式
      */
    if (typeof module != 'undefined' && module.exports) {
         
        module.exports = definition;
    } else if (typeof context['define'] == 'function' && (context['define']['amd'] || context['define']['cmd'])  ) {

        define([], function () {
                context[name] = definition();
        });
        
    } else {
        
        context[name] = definition();
        
    }
})('selectSearch', function () {

	'use strict';
	 var _this;
	 var selectSearch = function(opt){
	 	_this = this;
	 	this.config = {
	 		"el" : "select",
	 		"callback" : null
	 	}
	 	this.selectedData = {};

	 	for(var key in opt){
	 		this.config[key] = opt[key]
	 	}
 		
 		//扩展事件方法
	 	this.arrayEvent();
	 	this.init();
	 }
	 selectSearch.prototype = {
	 	init : function(){
	 		
	 		var cEl = this.config["el"], el = this.element(cEl);
	 		 
	 		if(!el){
	 			 throw new TypeError();
	 			}

	 		/*获取下拉框数据列表创建DOM元素*/
	 		if(cEl[0]=="#"){
				this.creatHtml(this.getSelectData(el),el);
	 		}else{
	 			for(var i=0;i<el.length;i++){
					this.creatHtml(this.getSelectData(el[i]),el[i]);
		 		}	
	 		}
	 		  
	 	},
	 	creatHtml : function(arr,el){

     			var doc = document;
	 		var div = doc.createElement("div"),
	 		      ul = doc.createElement("ul"),
	 		      selectDiv = doc.createElement("div"),
	 		      searchInput = doc.createElement("input");

	 		div.setAttribute("class","selectDiv-box");
	 		searchInput.setAttribute("type", "text");
	 		selectDiv.setAttribute("class","selectDiv");
	 		selectDiv.innerHTML = "<span></span>-请选择-";
	 		div.appendChild(selectDiv);
	 		div.appendChild(searchInput);
	 		   
 			 
 			//循环下拉框数据并创建dom节点
 			var maxTextLength = 0;

	 		for(var i = 0;i<arr.length;i++){
	 			var li = doc.createElement("li");

	 			li.setAttribute("data-value",arr[i].value); 

	 			//火狐不兼容innerText
	 			var liText = window.navigator.userAgent.toLowerCase().indexOf("firefox")!=-1?arr[i].textContent : arr[i].innerText;

	 			li.innerText = liText;

	 			if(arr[i].selected){
	 				selectDiv.innerHTML = "<span></span>" + liText;
	 			}
 				
 				var textLength = liText.length;
 				if(textLength>maxTextLength){
 					maxTextLength= textLength;
 				}

 				//绑定选项点击事件
 				this.bindLiEvent(li);
	 			ul.appendChild(li);
 				
	 		}
	 		div.appendChild(ul);
	 		el.parentNode.insertBefore(div,el);
	 		el.parentNode.style.position = "relative";
	 		//根据文字长度设置模拟下拉框宽度
	 		div.style.width = (div.offsetWidth -20)/5 * maxTextLength + 50;
	 		(div.offsetWidth>300)&&(div.style.width=230);
	 		el.style.display = "none";
	 		//绑定模糊搜索事件
	 		this.bindSearchEvent(searchInput,div);
	 		//绑定模拟下拉框点击事件
	 		this.bindBoxEvent(div);
	 		
	 	},
	 	getSelectData : function(el){
	 		return el.getElementsByTagName("option");
	 	},

	 	bindBoxEvent : function(el){

	 		_this.addListener(el,"click",function(){
	 			//使用CSS控制层隐藏或显示
	 			if(this.className.indexOf("trigger")>-1){
	 				this.className = "selectDiv-box"
	 			}else{
	 				this.className = "selectDiv-box trigger"
	 			}
	 		},false);

	 	},
	 	bindLiEvent : function(el){
	 		 
	 		var callback = _this.config["callback"];

	 		_this.addListener(el,"click",function(event){
	 			   
	 			var rootEl = this.parentNode.parentNode;
	 			_this.selectedData = {
	 						"value" : this.getAttribute("data-value"),
	 						"text" :  this.innerText
	 						}
	 			rootEl.childNodes[0].innerHTML = "<span></span>" + this.innerText;

	 			if(typeof callback == "function"){
	 				callback.call(_this);
	 			} 
 				
	 			//过滤非dom元素
	 			var selectObj = [], selectChilds = rootEl.nextSibling.childNodes;
	 			 
	 			 for(var i=0;i<selectChilds.length;i++){
	 			 	selectChilds[i].nodeType==1&&selectObj.push(selectChilds[i]);
	 			 }
	 			  
	 			 //修改select选中值
	 			for (var i=0; i< selectObj.length; i++){
				     var curOpt = selectObj[i];
				    if(_this.selectedData.value==curOpt.value){
				        curOpt.selected=true;
				    }
				}
				 	
				//触发select change事件
				var selectFn = selectObj.onchange;
				if(typeof selectFn == "function"){
					selectFn.call(rootEl.nextSibling);
				}
				 

	 		},false);
	 	},
	 	bindSearchEvent : function(el,dom){
	 		 
	 		var inputTime = null;
	 		var fn = function(){
	 			 
	 				if(inputTime){
	 					clearTimeout(inputTime);
	 				}

	 				inputTime = setTimeout(function(){
	 					
	 					var selectData = [];
	 					 
	 					//selectData内包含对象, 导致无法使用数组相关方法, 循环处理新数组
	 					var childrenNodes = _this.getSelectData(dom.nextSibling);
	 					for(var i=0;i<childrenNodes.length;i++){
	 						selectData[i] = childrenNodes[i].innerText;
	 					}
	 					
						//筛选出所有包含关键字的数组索引
	 			 		var data = selectData.filterIndex(function(element){
	 			 			return (element.indexOf(el.value)>-1);
	 			 		});
 						 
 						 //显示或隐藏对应dom
 						 var li = dom.childNodes[2].childNodes;
 						 
 						 for(var j=0;j<li.length;j++){
 						 	li[j].style.display = data.indexOf(j)>-1?"block":"none";
 						 }
 						 
	 				}, 200);
	 			};

	 		

	 		//监听文本输入事件
	 		if('oninput' in el){  
			    el.addEventListener("input",fn,false);  
			}else{  
			   //兼容IE8等不支持oninput的浏览器
			    el.onpropertychange = fn;  
			}  
			//阻止冒泡
			this.stopPropagationEvent(el);
 
 
	 	},
	 	//写个选择器
	 	element : function(el){
 
	 		var el2 = el.slice(1);
 			//根据el选择器获取对象
 			var firstString = el[0];
	 		switch(firstString){
	 			case "#" :
	 				el = document.getElementById(el2);
	 			 break;

	 			 case "." :
	 			 	el = (function(){
	 			 		if(document.getElementsByClassName){
 	 			 			return document.getElementsByClassName(el2)
	 			 		}else{
	 			 			//兼容IE8的class选择器
	 			 			var elArr = [], selectArr = document.getElementsByTagName("select");
	 			 			for(var i=0;i<selectArr.length;i++){
	 			 				 
	 			 				if(selectArr[i].className.split(" ").indexOf(el2)>-1){
	 			 					elArr.push(selectArr[i])
	 			 				}
	 			 			}
	 			 			return elArr;
	 			 		}
	 			 	})();
	 			 break;

	 			 default:
	 			 	el = document.getElementsByTagName(el)
	 		}
	 		return el;
	 	},

	 	stopPropagationEvent : function(el){
	 		
	 		this.addListener(el,"click",function(event){
				var e = window.event || event; 

				if ( e.stopPropagation ){
					e.stopPropagation(); 
				}else{ 
					 //兼容IE8的阻止事件冒泡 
					window.event.cancelBubble = true; 
				} 
			},false);
 
	 	},
	 	arrayEvent : function(){
	 		 	  //扩展数组filterIndex方法, 因为本组件需要符合要求元素的索引值
				  Array.prototype.filterIndex = function(fun /*, thisArg */)
				  {
				    "use strict";

				    if (this === void 0 || this === null)
				      throw new TypeError();

				    var t = Object(this);
				    var len = t.length >>> 0;
				    if (typeof fun !== "function")
				      throw new TypeError();

				    var res = [];
				    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
				    for (var i = 0; i < len; i++)
				    {
				      if (i in t)
				      {
				        var val = t[i];
 
				        if (fun.call(thisArg, val, i, t))
				          res.push(i);
				      }
				    }

				    return res;
				  };

				  //兼容IE8 indexOf功能
				  if (!Array.prototype.indexOf) {
					  Array.prototype.indexOf = function(elt /*, from*/)
					  {
					    var len = this.length >>> 0;
					    var from = Number(arguments[1]) || 0;
					    from = (from < 0)
					         ? Math.ceil(from)
					         : Math.floor(from);
					    if (from < 0)
					      from += len;
					    for (; from < len; from++)
					    {
					      if (from in this &&
					          this[from] === elt)
					        return from;
					    }
					    return -1;
					  };
					}

	 	},
		addListener : function(element, type, handle, useCapture){
				 
			 	    if(!element){return false}
			 	    if(document.addEventListener){  
				        	element.addEventListener(type,handle,useCapture);  
				    }else{  
				     	//兼容IE8绑定事件功能
				            element.attachEvent('on' + type,function(){
				            	handle.call(element)
				            });  
				    }  
		} 
	 }
	 		  
	return selectSearch;

}, this);