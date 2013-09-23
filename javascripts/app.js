(function(exports){
	var displayArea = document.querySelector('.display-area')
	, displayContent = document.querySelector('.display-content')
	,	codeArea = document.querySelector('.code-area');
	
	var placeholder = '# hello world \n\n come to the darkside, we have cookies \n\n'
		, UNTITLE = 'untitled'
		, modeControlTitle = ['to overview', 'to single'];

	var cm = CodeMirror(codeArea, {
		lineWrapping: true,
		height: '100%',
		cursorHeight: 1.1,
		autofocus: true,
	  value: (function(){
	  					var content = getContent();
			  			return hasIt(content)? content: placeholder;
			  		})()
	});

	cm.on('change', function(){
		statusManager.setStar(true);
		updateDisplay();
	});

	
	var statusManager = (function(){
		var smile = face.smile, evil = face.evil
		, favicon = document.getElementById('favicon');

		var status = {
			title: null,
			orgTitle:  document.title + ' - ',
			haveStar: false,
		}

		status.title = (function(){
			var savedTitle = localStorage.getItem('md_title');
			return hasIt(savedTitle)? savedTitle: UNTITLE;
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
				t = UNTITLE;
			}
			statusManager.setTitle(t);
		});
		titleInput.addEventListener('blur', function(){
			if(!this.value.length){
				this.value = UNTITLE;
			}
		})
	}();

	// setting
	!function(){
		/*var settingBtn = document.getElementById('setting-btn')
		, container = document.querySelector('.container')
		, settingArea = document.querySelector('.setting-area')
		, isInSetting = false;


		settingBtn.onclick = function(){
			isInSetting = !isInSetting;
			if(isInSetting){
				container.style.top = '-200px';
				settingArea.style.top = '60px';
			} else {
				container.style.top = '60px'; 
				settingArea.style.top = '100%';
			}
		}*/

	}();


	// mdoe control
	!function(){
		var modeControlBtn = document.getElementById('mode-control');
		function controlMode(){
			if(hasTwoColumn){
				modeControlBtn.classList.add('icon-file');
				modeControlBtn.classList.remove('icon-copy');
				modeControlBtn.title = modeControlTitle[1];
				displayArea.style.right = '0';
				codeArea.style.left = '0';
				localStorage.setItem('has-two-column', 1);
			} else {
				modeControlBtn.classList.add('icon-copy');
				modeControlBtn.classList.remove('icon-file');
				modeControlBtn.title = modeControlTitle[0];
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
		displayContent.innerHTML = markdown.toHTML(cm.getValue());
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
		displayArea.scrollTop = cm.getScrollInfo().top;
	});

	displayArea.addEventListener('scroll', function(){
		cm.scrollTo(null, this.scrollTop);
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

	function downloadHTML(){
		download(statusManager.status.title+'.html', displayContent.innerHTML, 'text/html');
	}

	function downloadMD(){
		download(statusManager.status.title+'.md', cm.getValue(), 'text/x-markdown');
	}

	exports.downloadHTML = downloadHTML;
	exports.downloadMD = downloadMD;
	exports.reset = reset;

	updateDisplay();


	/*var easeScrollTo = (function(){
		var hook = function(){};
		document.body.addEventListener('webkitTransitionEnd', function(e){
	    hook(e);
	  });
		return function(target, scrollTop){
			var targetParent = target.parentNode || window, caculTop;
			target.style.webkitTransition = '.5s ease-out margin-top';
			caculTop = targetParent.scrollTop - scrollTop;
			console.log(caculTop, targetParent.scrollHeight, targetParent.clientHeight);
			if(-caculTop > targetParent.scrollHeight){
				caculTop = -targetParent.scrollHeight;
			}
			target.style.marginTop = caculTop + 'px';
			hook = function(e){
				if(e.target == target){
		    	target.style.webkitTransition = null;
		    	targetParent.scrollTop = scrollTop;
		    	target.style.marginTop = 0;
		    }
			}
		}
	})();

	setTimeout(function(){
		easeScrollTo(displayContent, 80);
	}, 1000);*/
	
	


	
})(window);


