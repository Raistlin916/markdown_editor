"use strict";

app.add('IframeDoc', function(require, exports, module){

  function IframeDoc(iframe, wrapIt){
    var doc = this.doc = iframe.contentWindow.document;
    // 火狐下要重写才能使引用生效(在另一次tick中), 十分怪异
    doc.open();
    doc.write(wrapHtml());
    doc.close();
    this.wrapIt = wrapIt;
  }
  IframeDoc.prototype = {
    setHtml: function(content){
      this.doc.open();
      this.doc.write(this.wrapIt? wrapHtml(content): content);
      this.doc.close();
    },
    setBody: function(content){
      this.doc.body.innerHTML = content;
    }
  }

  function wrapHtml(content){
    var before = '<!doctype html><html><head><meta charset="utf-8"></head><body>'
    , after = '</body></html>';
    return before + (content || '') + after;
  }

  module.exports = IframeDoc;
});

app.run(function(require){
  var res = require('res')
  , sp = require('promise')
  , IframeDoc = require('IframeDoc');

  var displayContent = res.elem.displayContent
  , settingArea = document.querySelector('.setting-area')
  , displayContentDoc = new IframeDoc(res.elem.displayContent, true)
  , sandboxIframeDoc = new IframeDoc(document.getElementById('sandbox'), true)
  , styleSetting;

  var styleSheetManager = (function(){
    var cache = {};
    return {
      download: download
    };

    function download(src){
      var d = sp.defer();
      if(cache[src]){
        d.resolve(cache[src]);
      } else {
        var xhr = new XMLHttpRequest;
        xhr.onload = function(){
          var style = createStyle(xhr.responseText);
          cache[src] = style;
          d.resolve(style);
        };
        xhr.onerror = function(){
          d.reject(res.text.downloadFail);
        }
        xhr.open('get', src);
        xhr.send();
      }
      
      return d.promise;
    }

    function createStyle(content){
      var style = document.createElement('style');
      style.innerHTML = content;
      return style;
    }

  })();

  // add style to iframe, has style cache inside
  var styleCompose = (function(){
    var insList = [];

    return function (iframeDoc, setting){
      var ins, hasIns, src = setting.src, mode = setting.linkMode;

      hasIns = insList.some(function(item){
        if(item.iframeDoc == iframeDoc){
          ins = item;
          return true;
        }
      });
      if(!hasIns){
        ins = {iframeDoc: iframeDoc, style: null};
        insList.push(ins);
      }



      switch(mode){
        case 'outlink':
          outWay(ins, src);
        break;
        case 'inline':
          inlineWay(ins, src);
        break;
        case 'nolink':
          removeStyle(ins);
        break;
      }
     
    }

    function outWay(ins, src){
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = src;
      replaceStyle(ins, link);
    }

    function inlineWay(ins, src){
      styleSheetManager.download(src)
        .then(function(style){
          replaceStyle(ins, style.cloneNode(true));
        }, function(reason){
          console.log(reason);
        });
    }

    function removeStyle(ins){
      if(ins.style){
        ins.style.parentNode.removeChild(ins.style);
      }
      ins.style = null;
    }

    function replaceStyle(ins, style){
      if(ins.style){
        ins.style.parentNode.removeChild(ins.style);
      }
      ins.iframeDoc.head.appendChild(style);
      ins.style = style;
    }

  })();


  // setting control
  !function(){
    var settingBtn = document.getElementById('setting-btn')
    , exitBtn = document.querySelector('.setting-area .icon-checkmark')
    , container = document.querySelector('.container')
    , isInSetting = false;

    function toggleSetting(){
      if(isInSetting){
        container.style.marginTop = '-50px';
        settingArea.style.top = '60px';
        initSandbox();
      } else {
        container.style.marginTop = '0';
        settingArea.style.top = '100%';
        saveToDisplay();
      }
    }

    exitBtn.onclick = function(){
      isInSetting = false;
      toggleSetting();
    }

    settingBtn.onclick = function(){
      isInSetting = !isInSetting;
      toggleSetting();
    }
  }();

  // stylesheet select
  !function(){
    var styleSelect = document.getElementById('style-select')
    , styleSelectDisplay = document.getElementById('style-select-display')
    , styleLinkMode = document.getElementsByName('link-style');

    readStyleSetting();
    init();

    function readStyleSetting(){
      if(localStorage.styleSetting){
        styleSetting = JSON.parse(localStorage.styleSetting);
      } else {
        var defaultSrcIndex = 0;
        styleSetting = { srcIndex: defaultSrcIndex, src: res.styleSheets[defaultSrcIndex].src, linkMode: 'inline'};
        saveStyleSetting();
      }
      saveToDisplay();
    }

    function init(){
      styleSelect.max = res.styleSheets.length-1;
      styleSelect.value = styleSetting.srcIndex;
      var n = styleLinkMode.length;
      while(n--){
        if(styleLinkMode[n].value == styleSetting.linkMode){
          styleLinkMode[n].checked = true;
        }
      }
      styleSelectDisplay.innerHTML = res.styleSheets[styleSetting.srcIndex].name;
    }

    function saveStyleSetting(){
      localStorage.styleSetting = JSON.stringify(styleSetting);
    }

    styleSelect.onchange = function(){
      styleSelectDisplay.innerHTML = res.styleSheets[this.value].name;
    };
    styleSelect.onmouseup = function(){
      var src = res.styleSheets[this.value].src;
      styleSetting.src = src;
      styleSetting.srcIndex = this.value;
      saveStyleSetting();
      styleCompose(sandboxIframeDoc.doc, styleSetting);
    };

    // delegate
    settingArea.addEventListener('change', function(e){
      var n = styleLinkMode.length, target;
      while(n--){
        target = styleLinkMode[n];
        if(target == e.target){
          styleSetting.linkMode = target.value;
          saveStyleSetting();
          styleCompose(sandboxIframeDoc.doc, styleSetting);
        }
      }
    });
  }();


  

  function saveToDisplay(){
    styleCompose(displayContentDoc.doc, styleSetting);
  }


  function initSandbox(){
    var sampleLength, fragment, p, wrap, base
    , displayContentBody = displayContent.contentWindow.document.body;

    sampleLength = res.config.sampleLength;
    fragment = sliceDom(displayContentBody, sampleLength);
    if(displayContentBody.children.length > sampleLength){
      p = document.createElement('p');
      p.innerHTML = res.text.andSoOn;
      fragment.appendChild(p);
    }

    wrap = document.createElement('div');
    wrap.appendChild(fragment);

    sandboxIframeDoc.setHtml(wrap.innerHTML);

    styleCompose(sandboxIframeDoc.doc, styleSetting);
  }


  function sliceDom(target, n){
    var children = [].slice.call(target.children)
    , fragment = document.createDocumentFragment();
    children.some(function(el, i){
      if(!(el instanceof HTMLScriptElement)){
        if(i < n){
          fragment.appendChild(el.cloneNode(true));
        } else {
          return true;
        }
      }
    });
    return fragment;
  }

});
