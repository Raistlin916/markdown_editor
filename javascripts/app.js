(function(exports){
	var displayArea = document.querySelector('.display-area')
	, displayContent = document.querySelector('.display-content')
	,	codeArea = document.querySelector('.code-area');


	var placeholder = '# hello world \n\n come to the darkside, we have cookies \n\n'
		, UNTITLE = 'untitled';

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
		var smile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC2klEQVRYR82WgXHUQAxFSQWECjAVECrgqICkAo4KCBVwVACpgEsFgQpwKiCpgKMDUgH8d7Pfo1O89iYkQzSjuT1bWn197Uree3QzOZT5a2kn3ZceFPcL/f6WbqRfpd9at91rMCTYBynBCdoigAHI+wKs6jMHYCXPdzcInAMB5LP0Yw1BDQCZfg8U2/9XyYzs2BzqEUqBDyyhT1NA7F6NsTEGgM0IHuk+13/Y6Ktc7r5YFPuX4TGAAWHQ21cZAEF/puDUERpvI8dy+pRAPItMRACZ9qtCZ2vWNYCwQckeFwMYeGHjCACKOe0W6PrX4N4LEJTVwqEk3lCCTusfUtc90o7zl+L5tgFUzT6Wg/OwLYUZWOvPmxKEA8cmlo0WPtWscZySKftejj6Yp1ovDQBErlGmPr7jGnYzAKbsScylwO4JALi3Z2XTsQA4rcv7pX7JYkrm7CNDRwBgc9N/ojW1uk/hStNdkRMAkJHrcpcnv5YEDLkM5wDgXj4v1tzPnU51D1TQablxyAUA/oQgc8PprvAMMR8EgP9ZgssHcQjXKuzcNexkQ+NAW4SWjm5GjK9dw9iIcIitlk24syspE+2oJXqx5WoTjMEThRhu7dtGhNRacQSHHSAYSDUmAMzgws8CaPyQhdQ9gHG/PzaMer2gIVlWWsQxTXAyw47B5Y3JmC4KCMswdsuDeOB3hpHr5YGUv4IyiBCjuszBAeevI7LvpMM4ZpccJLdlaCXz/MGZETDQloUhv1toMflBYsNIEVRTvz5FAAgBYM0zhFJgv5a63jE409aludT6wC9z682lwA7qmJK3kUg7/gP1NQA8Bx1Z+zzwjP/UlN8WWciIeg+ZluA8h+VBasMHJgjmKWmHjRZQjJKNNyMQgCkP2iWU0E5wyrQjc9NvJWtojGzkPab+A5KDyz6jMgcAJ9hgEzJrBUJgWAL8tawjkhYA0T5SDDCXCIoJREn6EryJqb+OXLX+8Ebn+wAAAABJRU5ErkJggg=='
		, evil = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAiCAYAAAA+stv/AAADNUlEQVRYR82Wi3HUQAyGLxUQKsBUAFSA6YBUgK8CoAJMBUAFOBVABzgVQCrAqYBQAfyfZ+VRdLv23g0DaEZ39lqPX4/V7tlut/subsR78SAu0bk+PBW34sdJBz1oSvxN/6P4Sny7YqvTt4/onOnnlxPMgcDJG/FzMSBqCOeD+EMC5nXM+bwWAbD2Wfw6KeK4r/G4IoP+WzGBvEuBLOIAmMQPMgZYR8nTTQIISKIk5RAlITtkCY72crbQuwHAIH6RAeCXqGkvHjfk7HOb5OmZNboEQCemIUpEOd5XOo5ir7RA2ku0BwA0iWPafmqNdI4nOje1Vg+U7F6wQzkbA4CjT0Hg2R9w7kF8CfYvAGYAGr0wD4x82r9qkQYjity2ignC1suUPRr1SRKI5Xio9XkOQIPYGpGGa51VOv2Re+/1zLbKUdy20dYoJWvMSz13ACC6H85aLvVsMxrRlHONCTAAQDgmYtumZp7ArBRk537cBXNjFKIDpE3CSc+k0JONdNZm4wU76FrDz7uAyKgZRI1BniOMWifngG59N5t3/AFgFFtq1zq/ldyQrHRJzwPd+m6yyFkZruJZQMfGuhUScvIy/cTOmikCsF1xsvVKxeUE/i8A+H3+t0twfUwTVmZ3U+ygCelsm4KlbdhIhm0G1xDzAp4ywgfb0B9EKPgBgxFmRC/mLOAAqSEONiLFWRzbfmBdWNf7IeJnQTwlAbFfyQSAuVugZzSfeukFUDYDOO7Pc4fRqA+AMCJ6m/GsAZbIkGPmQ3ZbZorauGad6NE3Yv8zB6DlMOLF6mWjNh42EYSzWXyMzgFntyOib8S3fvBEJ3Esk1Yiz11gPQrOiU48usVWz/5CsoCLk8/PBFJN/bwhbAIEB2TNzhBKgfwgtnqbf5zTlFaaaz1bGeZR7CmWgm+kju15CrGDyJrRknpbyM1+0I1if4nknbTxX0NETb2XSPWMc9bJ8kKlw4dM4MxfxVCaxKQYxqAZwxGAKQ/cBJSkHeeU6Q5tnX69pClBvFJHO6V3QFIC7GRpCwBKZAMjRFYLBMdkCfAHUXskNQC8vE8xwKxEpBhHlGRMzquydCyAKqPHCP1zAL8BhRnG/UTR67oAAAAASUVORK5CYII=';

		var favicon = document.getElementById('favicon');


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
	

	function hasIt(s){
		return !(s == undefined || s.length === 0);
	}


	function updateDisplay(){
		displayContent.innerHTML = markdown.toHTML( cm.getValue() );
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

	});


	cm.on('scroll', function(e){
		displayArea.scrollTop = cm.getScrollInfo().top;
	});

	displayArea.addEventListener('scroll', function(){
		cm.scrollTo(null, this.scrollTop);
	});

	function reset(){
		localStorage.clear();
		location.href = location.href;
	}

	function download(filename, text, mimeType) {
		mimeType = mimeType || 'text/plain';
		var a = document.createElement('a');
		a.setAttribute('href', 'data:'+ mimeType +';charset=utf-8,' + encodeURIComponent(text));
		a.setAttribute('download', filename);
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


