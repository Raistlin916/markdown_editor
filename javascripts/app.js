"use strict";
app.run(function(require){
	var res = require('res')
	, IframeDoc = require('IframeDoc');

	var displayArea = res.elem.displayArea
	, displayContentDoc = new IframeDoc(res.elem.displayContent, true)
	,	codeArea = res.elem.codeArea;
	
	var cm = CodeMirror(codeArea, {
		lineWrapping: true,
		height: '100%',
		cursorHeight: 1.1,
		autofocus: true,
	  value: (function(){
	  					var content = getContent();
			  			return hasIt(content)? content: res.text.placeholder;
			  		})()
	});

	cm.on('change', function(){
		statusManager.setStar(true);
		updateDisplay();
	});

	
	var statusManager = (function(){
		var smile = res.face.smile, evil = res.face.evil
		, favicon = document.getElementById('favicon');

		var status = {
			title: null,
			orgTitle:  document.title + ' - ',
			haveStar: false,
		}

		status.title = (function(){
			var savedTitle = localStorage.getItem('md_title');
			return hasIt(savedTitle)? savedTitle: res.text.untitle;
		})();

		var lastStar = null;
		function compositeTitle(){
			if(lastStar === null || (lastStar != status.haveStar)){
				favicon.href = status.haveStar? evil: smile;
			}
			document.title = status.orgTitle + (status.haveStar? '*':'') + status.title;
			lastStar = status.haveStar;
		}

		function setStar(b){
			status.haveStar = b;
			compositeTitle();
		}

		function setTitle(t){
			if(t == undefined){return;}
			status.title = t;
			localStorage.setItem('md_title', t);
			compositeTitle();
		}

		compositeTitle();

		return {
			setStar: setStar,
			setTitle: setTitle,
			status: status
		}
	})();

	// bind title
	!function(){
		var titleInput = document.getElementById('title');
		titleInput.value = statusManager.status.title;
		titleInput.addEventListener('keyup', function(){
			var t = this.value;
			t = t.trim();
			if(!t.length){
				t = res.text.untitle;
			}
			statusManager.setTitle(t);
		});
		titleInput.addEventListener('blur', function(){
			if(!this.value.length){
				this.value = res.text.untitle;
			}
		})
	}();


	// mode control
	!function(){
		var modeControlBtn = document.getElementById('mode-control');
		function controlMode(){
			if(hasTwoColumn){
				modeControlBtn.classList.add('icon-file');
				modeControlBtn.classList.remove('icon-copy');
				modeControlBtn.title = res.text.modeTitle[1];
				displayArea.style.right = '0';
				codeArea.style.left = '0';
				localStorage.setItem('has-two-column', 1);
			} else {
				modeControlBtn.classList.add('icon-copy');
				modeControlBtn.classList.remove('icon-file');
				modeControlBtn.title = res.text.modeTitle[0];
				displayArea.style.right = '-50%';
				codeArea.style.left = '25%';
				localStorage.setItem('has-two-column', 0);
			}
			hasTwoColumn = !hasTwoColumn;
		}
		var lsHasTwo = localStorage.getItem('has-two-column')
		, hasTwoColumn;
		if(hasIt(lsHasTwo)){
			hasTwoColumn = lsHasTwo == 1;
		} else {
			hasTwoColumn = lsHasTwo = 1;
		}
		 
		controlMode();

		// should't translate when page load
		setTimeout(function(){
			setPrefix(displayArea, 'transition', "1s all ease");
			setPrefix(codeArea, 'transition', "1s all ease");
		});
		

		modeControlBtn.onclick = controlMode;
	}();

	function capitaliseFirstLetter(s){
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
	
	function setPrefix(elem, key, value){
		key = key.toLowerCase().split('-')
					.map(function(item, i){
						return i? capitaliseFirstLetter(item): item;
					}).join('');
		var s;
		['webkit', 'ms', 'moz', ''].forEach(function(p){
			s = p.length? (p+ capitaliseFirstLetter(key)): key;
			elem.style[s] = value;
		});
	}

	function hasIt(s){
		return !(s == undefined || s.length === 0);
	}

	function updateDisplay(){
		displayContentDoc.setBody(markdown.toHTML(cm.getValue()));
	}

	function save(){
		var content = cm.getValue();
		statusManager.setStar(false);
		localStorage.setItem('md_content', content);
	}

	function getContent(){
		return localStorage.getItem('md_content');
	}

	function load(){
		var content = getContent();
		cm.setValue(content);
		statusManager.setStar(false);
	}

	function reset(){
		localStorage.clear();
		location.href = location.href;
	}

	
	
	/* hot keys */
	document.body.addEventListener('keydown', function(e){
		if(!e.ctrlKey) return;
		var key = String.fromCharCode(e.keyCode).toLowerCase();
		if(key == 's'){
			e.preventDefault();
			save();
			return false;
		}
		if(key == 'y' || key == 'z'){
			if(localStorage.getItem('md_content') == cm.getValue()){
				statusManager.setStar(false);
			}
		}

		if(e.altKey && key == 'd'){
			downloadMD();
		}

		if(e.altKey && key == 'h'){
			downloadHTML();
		}

	});


	cm.on('scroll', function(e){
		displayContentDoc.doc.body.scrollTop = cm.getScrollInfo().top;
	});

	displayContentDoc.doc.addEventListener('scroll', function(){
		cm.scrollTo(null, this.body.scrollTop);
	});

	

	function download(filename, text, mimeType) {
		mimeType = mimeType || 'text/plain';
		var a = document.createElement('a');
		a.setAttribute('href', 'data:'+ mimeType +';charset=utf-8,' + encodeURIComponent(text));
		a.setAttribute('download', filename);
		// in firfox should append to document
		document.body.appendChild(a);
		a.style.display = "none";
		a.onclick = function(){document.body.removeChild(a);};
		a.click();
	}

	function getDoctype(doc){
    var doctype = 
	    '<!DOCTYPE ' + 
	    doc.doctype.name +
	    (doc.doctype.publicId?' PUBLIC "' +  doc.doctype.publicId + '"':'') +
	    (doc.doctype.systemId?' "' + doc.doctype.systemId + '"':'') + '>';
    return doctype;
	}

	function downloadHTML(){
		var doc = displayContentDoc.doc;
		download(statusManager.status.title+'.html', getDoctype(doc) + doc.documentElement.outerHTML, 'text/html');
	}

	function snapshot(){
		html2canvas(displayContentDoc.doc.body, {
		  onrendered: function(canvas) {
				var dataUrl = canvas.toDataURL();
				window.open(dataUrl, res.text.snapshot);
		  }
		});
	}

	function downloadMD(){
		download(statusManager.status.title+'.md', cm.getValue(), 'text/x-markdown');
	}

	window.downloadHTML = downloadHTML;
	window.downloadMD = downloadMD;
	window.snapshot = snapshot;
	window.reset = reset;

	updateDisplay();
});
