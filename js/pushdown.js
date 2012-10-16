/**
 * @author michael.spencer@washingtonpost.com (Mike Spencer)
 * @fileoverview washingtonpost.com pushdown template for DFP use. Accepts flash/images.
 *    Requires jQuery and will use CSS3 transition for animation when possible
 *    with JavaScript animation fallback. This template will try to play a flash
 *    creative first (if flash can be played, and a .swf file is the creative)
 *    and will fall back on the image creatives (if available). Backup image will
 *    be served as the final fallback. Can combine flash/image creatives (eg:
 *    .swf for the expanded part and an image for the collapsed part). 
 *    Compatible inside and outside of a friendly iframe.    
 */
(function(w, d, $){

  'use strict';
  
  //jQuery is required
  if(!$){return false;}
  
  //add bind method if browser does not natively support it:
  if(!Function.prototype.bind)Function.prototype.bind=function(oThis){if(typeof this!=="function")throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var aArgs=Array.prototype.slice.call(arguments,1),fToBind=this,FNOP=function(){},fBound=function(){return fToBind.apply(this instanceof FNOP&&oThis?this:oThis,aArgs.concat(Array.prototype.slice.call(arguments)));};FNOP.prototype=this.prototype;fBound.prototype=new FNOP();return fBound;};

  //Pushdown Constructor:
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
        },
        backup: ''
      },
      size: {
        width: {
          col: 970,
          exp: 970
        },
        height: {
          col: 66,
          exp: 418
        }
      },
      closeBtnCSS: {top: '0', left: '870px', width: '100px', height: '30px'},
      expBtnCSS: {top: '0', left: '870px', width: '100px', height: '30px'},
      clickTrack: '',
      clickTags: [''],
      clientExpPix: '',
      clientColPix: '',
      clientImpPix: '',
      backgroundColor: '#ffffff',
      customFlashVars: {},
      autoTimeOpen: 7000,
      autoExpDelay: 500,
      animationTime: 500,
      targetElement: '#slug_pushdown'
    }, atts);

    //set other settings:
    this.settings.id = parseInt(this.settings.id, 10) || Math.floor(Math.random()*1E4);
    this.state = 'col';
    this.flashver = this.getFlashVer();
    this.type = {}; //populated via getPushdownSource
    this.creativeCode = {};
    this.css3 = {};    
    this.css3.transitions = this.css3test('transition');

    this.source = {
      col: this.getPushdownSource('col'),
      exp: this.getPushdownSource('exp')
    };
    
    this.buildWrapper();
    
    if(this.css3.transitions){
      this.addCSS3();
    }
    
    if(this.settings.clientImpPix){
      this.addPixel(this.settings.clientImpPix);
    }
    
    if(this.source.col && this.source.exp){
      if(this.type.col === 'flash' || this.type.exp === 'flash'){
        this.flashvarstring = this.clickTagFlashVars().customFlashVars().stringifyFlashVars();
      }
      
      this.buildColCreative();
      
      if(this.settings.autoTimeOpen){
        $(function(){
          setTimeout(function(){
            this.expand();
            this.autoCloseTimerStart();
          }.bind(this), this.settings.autoExpDelay);
        }.bind(this));
      }
    } else{
      $(this.wrap).append('<a href="' + this.settings.clickTrack + this.settings.clickTags[0] + '" target="_blank">' +
        '<img src="' + this.settings.source.backup + '" width="' + this.settings.size.width.col + '" height="' + this.settings.size.height.col + '" alt="click here for more information" style="border:0;" />'+
      '</a>');
    }
    return this;
  }
  
  //determines what type of pushdown to use (flash/image):
  Pushdown.prototype.getPushdownSource = function(state){
    if(this.flashver && this.settings.source.flash[state]){
      this.type[state] = 'flash';
      return this.settings.source.flash[state];
    } else if(this.settings.source.image[state]){
      this.type[state] = 'image';
      return this.settings.source.image[state];
    } else{
      return false;
    }
  };
  
  //expand the pushdown
  Pushdown.prototype.expand = function(){
    if(arguments[0]){
      if(arguments[0].preventDefault){
        arguments[0].preventDefault();
      }
      if(this.settings.clientExpPix){
        this.addPixel(this.settings.clientExpPix);
      }
    }
    
    this.state = 'exp';
    if(!this.creativeCode.exp){
      this.buildExpCreative();
    }
    this.animateOpen();
    return this;
  };
  
  //collapse the pushdown
  Pushdown.prototype.collapse = function(){
    if(arguments[0]){
      if(arguments[0].preventDefault){
        arguments[0].preventDefault();
      }
      if(this.settings.clientColPix){
        this.addPixel(this.settings.clientColPix);
      }
    }
    this.autoCloseTimerStop();
    this.state = 'col';
    this.animateClosed();
    return this;
  };
  
  //animate open
  Pushdown.prototype.animateOpen = function(){
    $(this.creativeCode.exp_wrap).appendTo(this.wrap);
    $(this.creativeCode.col_wrap).detach();
    this.animating = setTimeout(function(){
      if(this.css3.transitions){
        $(this.creativeCode.exp_wrap).css({height: this.settings.size.height.exp + 'px'});
      } else{
        $(this.creativeCode.exp_wrap).stop(true, false).animate({height: this.settings.size.height.exp + 'px'}, this.settings.animationTime);
      }
    }.bind(this), 100);
  };

  //animate closed
  Pushdown.prototype.animateClosed = function(){
    if(this.css3.transitions){
      $(this.creativeCode.exp_wrap).css({height: this.settings.size.height.col + 'px'});
      this.animating = setTimeout(function(){
        $(this.creativeCode.col_wrap).appendTo(this.wrap);
        $(this.creativeCode.exp_wrap).detach();
      }.bind(this), this.settings.animationTime);
    } else{
      $(this.creativeCode.exp_wrap).stop(true,false).animate({height: this.settings.size.height.col + 'px'}, this.settings.animationTime, function(){
        $(this.creativeCode.col_wrap).appendTo(this.wrap);
        $(this.creativeCode.exp_wrap).detach();
      }.bind(this));
    }
  };
  
  //start the auto close timer
  Pushdown.prototype.autoCloseTimerStart = function(){
    this.timer = setTimeout(this.collapse.bind(this), this.settings.autoTimeOpen);
  };
  
  //stop the auto close timer
  Pushdown.prototype.autoCloseTimerStop = function(){
    try{clearTimeout(this.timer);}catch(e){}
  };
  
  //build the main container for the pushdown:
  Pushdown.prototype.buildWrapper = function(){
    this.wrap = $('<div id="push_' + this.settings.id + '_wrap" style="overflow:hidden;width:' + this.settings.size.width.col + 'px;position:relative;margin:0 auto;"></div>').appendTo(this.settings.targetElement)[0];
    return this;
  };
  
  //returns the flash object in its current state (expanded/collapsed)
  Pushdown.prototype.flashCode = function(){
    var s = this.settings;
    return $('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="'+ s.size.width[this.state] +'" height="'+ s.size.height[this.state] +'" id="pushie_' + this.settings.id + '_' + this.state + '" style="outline:none;">' +
      '<param name="movie" value="' + this.source[this.state] + '" />' +
      '<param name="quality" value="high" />' +
      '<param name="bgcolor" value="' + s.backgroundColor + '" />' +
      '<param name="play" value="true" />' +
      '<param name="wmode" value="opaque" />' +
      '<param name="allowScriptAccess" value="always" />' +
      '<param name="flashvars" value="' + this.flashvarstring + '" />' + 
      '<!--[if !IE]>-->' +
        '<object type="application/x-shockwave-flash" data="' + this.source[this.state] + '" width="'+ s.size.width[this.state] +'" height="'+ s.size.height[this.state] +'" id="push_' + this.settings.id + '_' + this.state + '" style="outline:none;">' +
          '<param name="movie" value="' + this.source[this.state] + '" />' +
          '<param name="quality" value="high" />' +
          '<param name="bgcolor" value="' + s.backgroundColor + '" />' +
          '<param name="play" value="true" />' +
          '<param name="wmode" value="opaque" />' +
          '<param name="allowScriptAccess" value="always" />' +
          '<param name="flashvars" value="' + this.flashvarstring + '" />' +
        '</object>' +
      '<!--<![endif]-->' +
    '</object>')[0];
  };
  
  //returns the image object in its current state (expanded/collapsed)
  Pushdown.prototype.imageCode = function(){   
    return $($(d.createElement('a')).attr({
      href: this.settings.clickTrack + this.settings.clickTags[0],
      target: '_blank'
    })[0]).append($(d.createElement('img')).attr({
      src: this.source[this.state],
      width: this.settings.size.width[this.state],
      height: this.settings.size.height[this.state],
      alt: 'Click here for more information'
    }).css({'border': '0'})[0])[0];
  };
  
  //build the wrapping collapsed creative code
  Pushdown.prototype.buildColCreative = function(){
    this.creativeCode.col = this.type.col === 'flash' ? this.flashCode() : this.imageCode();
    this.creativeCode.col_wrap = $(d.createElement('div'))
      .attr('id', 'push_col_wrap_' + this.settings.id)
      .css({ height: this.settings.size.height.col + 'px' })
      .addClass('transition-height')
      .append(this.creativeCode.col)
      .append(this.buildExpBtn())
      .appendTo(this.wrap)[0];
  };
  
  //build the wrapping expanded creative code
  Pushdown.prototype.buildExpCreative = function(){
    this.creativeCode.exp = this.type.exp === 'flash' ? this.flashCode() : this.imageCode();
    this.creativeCode.exp_wrap = $(d.createElement('div'))
      .attr('id', 'push_exp_wrap_' + this.settings.id)
      .css({ display: 'block', height: this.settings.size.height.col + 'px' })
      .addClass('transition-height')
      .append(this.creativeCode.exp)
      .append(this.buildCloseBtn())
      .appendTo(this.wrap)[0];  
  };
  
  //build the expand button:
  Pushdown.prototype.buildExpBtn = function(){
    return this.type.col === 'image' ? $(d.createElement('a'))
      .css($.extend({
        backgroundColor: '#fff',
        opacity: '0',
        cursor: 'pointer',
        display: 'block',
        position: 'absolute',
        zIndex: '999'    
      }, this.settings.expBtnCSS))
      .attr({
        title: 'Click here to expand',
        target: '_blank'
      })
      .live('click', this.expand.bind(this))[0] : '';
  };
  
  //build the close button:
  Pushdown.prototype.buildCloseBtn = function(){
    return this.type.exp === 'image' ? $(d.createElement('a'))
      .css($.extend({
        backgroundColor: '#fff',
        opacity: '0',
        cursor: 'pointer',
        display: 'block',
        position: 'absolute',
        zIndex: '999'    
      }, this.settings.closeBtnCSS))
      .attr({
        title: 'Click here to close',
        target: '_blank'
      })
      .live('click', this.collapse.bind(this))[0] : '';
  };
  
  //return clicktag code for flash as array
  Pushdown.prototype.clickTagFlashVars = function(){
    var ct = this.settings.clickTags,
      l = ct.length,
      i = 0;
    this.flashvars = this.flashvars || {};
    for(i;i<l;i++){
      if(ct[i]){
        this.flashvars['clickTag' + (i ? i + 1 : '')] = encodeURIComponent(ct[i]);
      }
    }
    return this;
  };
  
  //add custom flashvars
  Pushdown.prototype.customFlashVars = function(){
    if(this.settings.customFlashVars){
      this.flashvars = $.extend(true, (this.flashvars || {}), this.settings.customFlashVars);
    }
    return this;
  };

  //returns formatted flashvars as String
  Pushdown.prototype.stringifyFlashVars = function(){
    var rv = [], key;
    for(key in this.flashvars){
      if(this.flashvars.hasOwnProperty(key)){
        rv.push(key + '=' + this.flashvars[key]);
      }
    }
    return rv.join('&');
  };
  
  //add CSS for animation:
  Pushdown.prototype.addCSS3 = function(){
    var val = 'height ' + (this.settings.animationTime/1000) + 's ease;';
    $(this.wrap).append('<style type="text/css">' +
        this.settings.targetElement + ' .transition-height{' +
        /* IOS enable hardware-acceleration */
        'transform: translate3d(0,0,0);' +
        (this.css3.prefix ? this.css3.prefix + 'transform: translate3d(0,0,0);' : '') +
        'transition: ' + val +
        (this.css3.prefix ? this.css3.prefix + 'transition: ' + val : '') +
        'overflow:hidden;' +
      '}' +
    '</style>');
  };
  
  //css3 check:
  Pushdown.prototype.css3test = function(prop){
    var b = document.body || document.documentElement, s = b.style, p = prop, v;
    if(typeof s[p] === 'string') {return true;}
    v = ['Moz', 'Webkit', 'O', 'ms'],
    p = p.charAt(0).toUpperCase() + p.substr(1);
    for(var i=0; i<v.length; i++) {
      if(typeof s[v[i] + p] === 'string') {
        this.css3.prefix = this.css3.prefix || '-' + v[i].toLowerCase() + '-';
        return true;
      }
    }
    return false;
  };
  
  //returns the flash player version, or 0 for no flash support
  Pushdown.prototype.getFlashVer = function(){
    var i,a,o,p,s="Shockwave",f="Flash",t=" 2.0",u=s+" "+f,v=s+f+".",rSW=new RegExp("^"+u+" (\\d+)");
    if((o=navigator.plugins)&&(p=o[u]||o[u+t])&&(a=p.description.match(rSW)))return a[1];
    else if(!!(w.ActiveXObject))for(i=10;i>0;i--)try{if(!!(new w.ActiveXObject(v+v+i)))return i;}catch(e){}
    return 0;
  };
  
  //adds a pixel:
  Pushdown.prototype.addPixel = function(arg){
    $(d.createElement('img')).attr({
      'width': '1',
      'height': '1',
      'src': arg.replace(/\[timestamp\]|\[random\]|\%n/gi, Math.floor(Math.random()*1E9)),
      'alt': arguments[1] || 'pixel'
    }).css({
      'border': '0',
      'display': 'none'
    }).appendTo(this.wrap);
  };
  
  w.wpAd = w.wpAd || {};
  w.wpAd.Pushdown = Pushdown;
  
})(window, document, window.jQuery);

wpAd.push = new wpAd.Pushdown(wpAd.pushdown_vars);

//compatibility with old Flash creatives:
var opa_slider = {
  doSlideOpen: wpAd.Pushdown.prototype.expand.bind(wpAd.push),
  doSlideClose: wpAd.Pushdown.prototype.collapse.bind(wpAd.push)
};
wpAd.flashPushdown = {
  open: wpAd.Pushdown.prototype.expand.bind(wpAd.push),
  close: wpAd.Pushdown.prototype.collapse.bind(wpAd.push)
};