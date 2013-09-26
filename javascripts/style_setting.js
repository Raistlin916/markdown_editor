"use strict";

app.run(function(require){
  var res = require('res')
  , sp = require('promise');
  var displayContent = res.elem.displayContent
  , sandboxDocument = document.getElementById('sandbox').contentWindow.document;

  // 火狐下要重写才能使引用生效(在另一次tick中)
  // 有够怪异, 直接报错不好吗
  sandboxDocument.open();
  sandboxDocument.close();



  // setting control
  !function(){
    var settingBtn = document.getElementById('setting-btn')
    , exitBtn = document.querySelector('.setting-area .icon-checkmark')
    , container = document.querySelector('.container')
    , settingArea = document.querySelector('.setting-area')
    , isInSetting = false;

    function toggleSetting(){
      if(isInSetting){
        container.style.marginTop = '-50px';
        settingArea.style.top = '60px';
        initSandbox();
      } else {
        container.style.marginTop = '0'; 
        settingArea.style.top = '100%';
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
    , lastStyle;

    styleSelect.max = res.styleSheets.length-1;
    styleSelect.onchange = function(){
      styleSelectDisplay.innerHTML = res.styleSheets[this.value].name;
    }
    styleSelect.onmouseup = function(){
      var src = res.styleSheets[this.value].src;
      styleSheetManager.download(src)
        .then(function(style){
          if(lastStyle){
            lastStyle.parentNode.removeChild(lastStyle);
          }
          sandboxDocument.head.appendChild(style);
          lastStyle = style;
        }, function(reason){
          console.log(reason);
        });
    }
  }();

  function wrapTemplate(content){
    var before = '<!doctype html><html><head><meta charset="utf-8"></head><body>'
    , after = '</body></html>';
    return before + content + after;
  }


  function initSandbox(){
    var sampleLength, fragment, p, wrap, base;

    sampleLength = res.config.sampleLength;
    fragment = sliceDom(displayContent, sampleLength);
    if(displayContent.children.length > sampleLength){
      p = document.createElement('p');
      p.innerHTML = res.text.andSoOn;
      fragment.appendChild(p);
    }

    wrap = document.createElement('div');
    wrap.appendChild(fragment);

    base = wrapTemplate(wrap.innerHTML);
    sandboxDocument.open();
    sandboxDocument.write(base);
    sandboxDocument.close();
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

});
