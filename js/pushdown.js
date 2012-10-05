(function(w, d, $){

	'use strict';
	
	if(!$){return false;}
	
	function Pushdown(atts){

		//merge arg with default settings:
		this.settings = $.extend(true, {
			source: {
				flash: {
					col: '',
					exp: ''
				},
				image: {
					col: '',
					exp: ''
				}
			},
			size: {
				width: {
					col: 900, 
					exp: 900
				},
				height: {
					col: 60,
					exp: 418
				}
			},
			clickTrack: '',
			clickTags: [],
			autoTimeOpen: 0
		}, atts);

		//set other settings:
		this.settings.id = parseInt(this.settings.id, 10) || Math.floor(Math.random()*1E4);
		this.state = 'col';
		this.flashver = this.getFlashVer();
		this.type = this.getPushdownType();
		return this;
	}
	
	//determines what type of pushdown to use. Returns 'flash' or 'image':
	Pushdown.prototype.getPushdownType = function(){
		return this.flashver && this.settings.source.flash.col && this.settings.source.flash.exp ? 
		'flash' : 'image';
	};
	
	//expand the pushdown
	Pushdown.prototype.expand = function(){
		this.state = 'exp';
		
		return this;
	};
	
	//collapse the pushdown
	Pushdown.prototype.collapse = function(){
		this.state = 'col';
		
		return this;
	};
	
	//returns the flash object in its current state (expanded/collapsed)
	Pushdown.prototype.flashCode = function(){
		//var source = this.settings.source[this.type][this.state]
	};
	
	//returns the image object in its current state (expanded/collapsed)
	Pushdown.prototype.imageCode = function(){
		
	};
	
	//return clicktag code for flash in array form
	Pushdown.prototype.clickTagFlashVars = function(){
		var ct = this.settings.clickTags,
			l = this.settings.clickTags.length,
			i = 0;
		this.flashvars = this.flashvars || {};
		for(i;i<l;i++){
			if(ct[i]){
				this.flashvars['clickTag' + (i ? i + 1 : '')] = encodeURIComponent(ct[i]);
			}
		}
		return this;
	};
	
	//returns formatted flashvars as String
	Pushdown.prototype.stringifyFlashVars = function(){
		var rv = [], key;
		for(key in this.flashvars){
			if(this.flashvars.hasOwnProperty(key)){
				rv.push((rv.length ? '&' : '?') + key + '=' + this.flashvars[key])
			}
		}
		return rv.join('');
	};
	
	//return the version of Flashplayer, or 0 for no Flash support:
	Pushdown.prototype.getFlashVer = function(){
		var i,a,o,p,s="Shockwave",f="Flash",t=" 2.0",u=s+" "+f,v=s+f+".",rSW=new RegExp("^"+u+" (\\d+)");
		if((o=navigator.plugins)&&(p=o[u]||o[u+t])&&(a=p.description.match(rSW)))return a[1];
		else if(!!(w.ActiveXObject))for(i=10;i>0;i--)try{if(!!(new w.ActiveXObject(v+v+i)))return i}catch(e){}
		return 0;
	};
	
	w.wpAd = w.wpAd || {};
	w.wpAd.Pushdown = Pushdown;
	
})(window, document, window.jQuery);