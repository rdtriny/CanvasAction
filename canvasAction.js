/**********************************************************
 Description:
    This framework helps to deal with event occurs in canvas element, since we can't adjust a particular part
 or object of canvas to deal with events happen to them. with this framework you can do that.
 Theory: 
    The framework treat every rectangle area of the canvas as an object. you can define the object by assign four
 parameters: coordinate of the upper left corner of the rectangle object, and also its width and height.
 Function:
    I completed several event types: onclick, ontouchstart, ontouchmove, ontouchend, onlongtap, onwipe, ondbclick,
 onorientationchange, onresize, ondrag.
 How to use:
    Include this javascript file, init the object like this:
		var ca = new canvasAction(0, 200, 300, 120, canvas);
	ca is an rectangle object, you can add event listeners to it like this:
		ca.onclick = function(){console.log("click");}
	or even with an argument event:
		ca.onclick = function(e){console.log(e.pageX + "       "+e.pageY);};
	By doing this, you dispatch the event with handlers you want.
 License:
    MIT license.

 ********************************************************/
var canvasAction = (function(window, undefined){
	var CA = function(coorX, coorY, rectWidth, rectHeight, canvas){
		var that = this;
		canvas.ontouchstart = function(e){
			var pageX,pageY;
			that.startX = pageX = e.touches[0].pageX;
			that.startY = pageY = e.touches[0].pageY;
			if(that.isInArea(pageX, pageY, coorX, coorY, rectWidth, rectHeight)){
				that.inAreaStatus = true;
				//touchstart event
				that.fire(that.ontouchstart, e);
				//longtap event
				that.longtapStart = new Date;
				that.longtapTimeout = setTimeout(function(){
					that.fire(that.onlongtap, e);
				}, that.longtapTime);
			}
		};
		canvas.ontouchmove = function(e){
			that.isMoved = true;
			if(!that.inAreaStatus)
				return false;
			that.fire(that.ontouchmove, e);
			//for longtap action
			clearTimeout(that.longtapTimeout);
			//for wipe action
			var pageX = e.touches[0].pageX;
			var pageY = e.touches[0].pageY;
			var dx = pageX-that.startX;
			var dy = pageY-that.startY;
			if(Math.abs(dy)>Math.abs(dx)){
				if(dy>0)
					that.wipeDirection = "down";
				else
					that.wipeDirection = "up";
			}
			else{
				if(dx>0)
					that.wipeDirection = "right";
				else
					that.wipeDirection = "left";
			}
		};
		canvas.ontouchend = function(e){
			if(!that.inAreaStatus){
				return false;
			}
			that.fire(that.ontouchend, e);
			//decide to trigger longtap or not.				
			if((new Date)-that.longtapStart<750)
				clearTimeout(that.longtapTimeout);
			//for wipe action
			if(that.wipeDirection){
				e.direction = that.wipeDirection;
				that.fire(that.onwipe, e);
				that.wipeDirection = null;
			}
			//dbclick action
			if(!that.isMoved){
				if((new Date) - that.lastTapTime < 200){
					that.fire(that.ondbclick, e);
				}
				that.lastTapTime = new Date;
			}
			
			that.isMoved = false;
			that.inAreaStatus = false;
		};
		canvas.onclick = function(e){
			var pageX = e.pageX;
			var pageY = e.pageY;
			if(that.isInArea(pageX, pageY, coorX, coorY, rectWidth, rectHeight)){	
				that.fire(that.onclick, e);
			}
		}
		window.addEventListener("orientationchange", function(e){
			e.orientation = window.orientation;
			that.fire(that.onorientationchange, e);
		}, false);
		window.addEventListener("resize", function(e){
			that.fire(that.onresize, e);
		}, false);
		
	};
	CA.prototype = {
		startX: 0,
		startY: 0,
		lastTapTime: 0,
		isMoved: false,
		wipeDirection: null,
		longtapTime: 750,
		inAreaStatus: false,
		onclick: null,
		ontouchstart: null,
		ontouchmove: null,
		ontouchend: null,
		onlongtap: null,
		onwipe: null,
		ondbclick: null,
		onresize: null,
		onorientationchange: null,
		ondrag: null,
		isInArea: function(pageX, pageY, coorX, coorY, rectWidth, rectHeight){
			if(pageX>=coorX && pageX<= (coorX+rectWidth) && pageY >= coorY && pageY<=(coorY+rectHeight)){
				return true;
			}
			return false;
		},
		fire: function(func, e){
			if(func && typeof func == "function"){
				func(e);
			}
		}
	};
	return CA;
})(window);