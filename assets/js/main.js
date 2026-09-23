/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var snowCanvas = document.getElementById('snow');

	if (snowCanvas) {
		var snowContext = snowCanvas.getContext('2d'),
			snowflakes = [],
			snowAnimationFrame,
			snowEnabled = true,
			snowPile = document.getElementById('snow-piles'),
			snowPileHeight = 0,
			snowPileTarget = 0,
			lastSnowTime = 0,
			reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function updateSnowPileTarget() {
			var toggleRect = document.getElementById('snow-toggle').getBoundingClientRect(),
				spaceBelowToggle = window.innerHeight - toggleRect.bottom,
				isMobile = window.matchMedia('(max-width: 480px)').matches,
				safetySpace = isMobile ? 40 : 90;

			snowPileTarget = isMobile
				? Math.min(100, Math.max(0, spaceBelowToggle - safetySpace))
				: Math.max(0, spaceBelowToggle - safetySpace);
			snowPileHeight = Math.min(snowPileHeight, snowPileTarget);
			snowPile.style.setProperty('--snow-height', snowPileHeight + 'px');
		}

		function updateSnowPile(time) {
			var elapsed = lastSnowTime ? Math.min(100, time - lastSnowTime) : 0,
				growthRate = window.matchMedia('(max-width: 480px)').matches ? 0.012 : 0.004;

			lastSnowTime = time;
			if (!reducedMotion && snowPileHeight < snowPileTarget)
				snowPileHeight = Math.min(snowPileTarget, snowPileHeight + elapsed * growthRate);
			else if (reducedMotion)
				snowPileHeight = snowPileTarget;

			snowPile.style.setProperty('--snow-height', snowPileHeight + 'px');
		}

		function resizeSnow() {
			var pixelRatio = Math.min(window.devicePixelRatio || 1, 2),
				width = window.innerWidth,
				height = window.innerHeight,
				flakeCount = Math.min(180, Math.max(45, Math.floor(width * height / 11000)));

			snowCanvas.width = width * pixelRatio;
			snowCanvas.height = height * pixelRatio;
			snowContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
			snowflakes = [];

			for (var index = 0; index < flakeCount; index++) {
				snowflakes.push({
					x: Math.random() * width,
					y: Math.random() * height,
					radius: Math.pow(Math.random(), 1.8) * 4.8 + 0.55,
					speed: Math.random() * 1.2 + 0.35,
					drift: Math.random() * 0.8 - 0.4,
					opacity: Math.random() * 0.55 + 0.3,
					phase: Math.random() * Math.PI * 2
				});
			}
		}

		function drawSnow(time) {
			var width = window.innerWidth,
				height = window.innerHeight;

			updateSnowPile(time);
			snowContext.clearRect(0, 0, width, height);
			snowContext.fillStyle = '#ffffff';

			snowflakes.forEach(function(flake) {
				var horizontalOffset = Math.sin(time * 0.0007 + flake.phase) * 12;

				snowContext.globalAlpha = flake.opacity;
				snowContext.beginPath();
				snowContext.arc(flake.x + horizontalOffset, flake.y, flake.radius, 0, Math.PI * 2);
				snowContext.fill();

				flake.y += flake.speed;
				flake.x += flake.drift;

				if (flake.y > height + flake.radius) {
					flake.y = -flake.radius;
					flake.x = Math.random() * width;
				}
				if (flake.x < -20)
					flake.x = width + 20;
				else if (flake.x > width + 20)
					flake.x = -20;
			});

			snowContext.globalAlpha = 1;
			if (!reducedMotion && snowEnabled)
				snowAnimationFrame = window.requestAnimationFrame(drawSnow);
		}

		function setSnowEnabled(enabled) {
			snowEnabled = enabled;
			if (!snowEnabled) {
				window.cancelAnimationFrame(snowAnimationFrame);
				snowContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
			} else if (!reducedMotion) {
				snowAnimationFrame = window.requestAnimationFrame(drawSnow);
			} else {
				drawSnow(0);
			}
		}

		function addSnowMark(event, className) {
			var containerRect = snowPile.getBoundingClientRect(),
				mark = document.createElement('span');

			mark.className = className;
			mark.style.left = event.clientX - containerRect.left + 'px';
			mark.style.top = event.clientY - containerRect.top + 'px';
			snowPile.appendChild(mark);
			window.setTimeout(function() {
				mark.remove();
			}, className === 'snow-mouse-print' ? 3400 : 3100);
		}

		function isOnSnow(event) {
			var pileRect = snowPile.getBoundingClientRect(),
				x = (event.clientX - pileRect.left) / pileRect.width,
				y = (event.clientY - pileRect.top) / pileRect.height,
				mounds = [
					{ center: 0.14, radius: 0.31 },
					{ center: 0.43, radius: 0.39 },
					{ center: 0.74, radius: 0.35 },
					{ center: 0.96, radius: 0.3 }
				];

			return mounds.some(function(mound) {
				var horizontalDistance = (x - mound.center) / mound.radius,
					topEdge;

				if (Math.abs(horizontalDistance) > 1)
					return false;

				topEdge = 1 - 0.58 * Math.sqrt(1 - horizontalDistance * horizontalDistance);
				return y >= topEdge;
			});
		}

		resizeSnow();
		updateSnowPileTarget();
		window.addEventListener('resize', resizeSnow);
		window.addEventListener('resize', updateSnowPileTarget);
		window.addEventListener('load', function() {
			window.setTimeout(updateSnowPileTarget, 1300);
		});
		if (window.ResizeObserver)
			new ResizeObserver(updateSnowPileTarget).observe(document.getElementById('snow-toggle'));
		document.addEventListener('click', function(event) {
			if (!snowEnabled || !isOnSnow(event))
				return;

			addSnowMark(event, 'snow-mouse-print');
		});
		if (reducedMotion) {
			drawSnow(0);
		} else {
			snowAnimationFrame = window.requestAnimationFrame(drawSnow);
		}
	}

	var snowToggle = document.getElementById('snow-toggle');
	if (snowToggle) {
		snowToggle.addEventListener('click', function() {
			var enabled = snowToggle.getAttribute('aria-pressed') !== 'true';

			snowToggle.setAttribute('aria-pressed', enabled);
			snowToggle.setAttribute('title', enabled ? '關閉下雪' : '開啟下雪');
		document.body.classList.toggle('snow-disabled', !enabled);
			setSnowEnabled(enabled);
		});
	}

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		var loadingScreen = document.getElementById('loading-screen'),
			loadingElapsedTime = window.performance && window.performance.now ? window.performance.now() : 0,
			loadingWarningTimeout = window.setTimeout(function() {
				loadingScreen.classList.add('is-slow');
			}, Math.max(0, 4000 - loadingElapsedTime));

		$window.on('load', function() {
			var loadingAvatar = loadingScreen.querySelector('img'),
				logo = document.querySelector('#header .logo'),
				logoRect = logo.getBoundingClientRect(),
				avatarRect = loadingAvatar.getBoundingClientRect(),
				deltaX = logoRect.left + logoRect.width / 2 - (avatarRect.left + avatarRect.width / 2),
				deltaY = logoRect.top + logoRect.height / 2 - (avatarRect.top + avatarRect.height / 2);

			window.clearTimeout(loadingWarningTimeout);

			loadingScreen.classList.add('is-moving');
			window.setTimeout(function() {
				loadingAvatar.style.transform = 'translate(calc(-50% + ' + deltaX + 'px), calc(-50% + ' + deltaY + 'px)) scale(1)';
			}, 50);

			window.setTimeout(function() {
				loadingScreen.classList.add('is-finished');
				$body.removeClass('is-preload');
			}, 1200);
		});

	// Fix: Flexbox min-height bug on IE.
		if (browser.name == 'ie') {

			var flexboxFixTimeoutId;

			$window.on('resize.flexbox-fix', function() {

				clearTimeout(flexboxFixTimeoutId);

				flexboxFixTimeoutId = setTimeout(function() {

					if ($wrapper.prop('scrollHeight') > $window.height())
						$wrapper.css('height', 'auto');
					else
						$wrapper.css('height', '100vh');

				}, 250);

			}).triggerHandler('resize.flexbox-fix');

		}

	// Nav.
		var $nav = $header.children('nav'),
			$nav_li = $nav.find('li');

	// Main.
		var	delay = 325,
			locked = false;

		// Methods.
			$main._show = function(id, initial) {

				var $article = $main_articles.filter('#' + id);

				// No such article? Bail.
					if ($article.length == 0)
						return;

				// Handle lock.

					// Already locked? Speed through "show" steps w/o delays.
						if (locked || (typeof initial != 'undefined' && initial === true)) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Mark as visible.
								$body.addClass('is-article-visible');

							// Deactivate all articles (just in case one's already active).
								$main_articles.removeClass('active');

							// Hide header, footer.
								$header.hide();
								$footer.hide();

							// Show main, article.
								$main.show();
								$article.show();

							// Activate article.
								$article.addClass('active');

							// Unlock.
								locked = false;

							// Unmark as switching.
								setTimeout(function() {
									$body.removeClass('is-switching');
								}, (initial ? 1000 : 0));

							return;

						}

					// Lock.
						locked = true;

				// Article already visible? Just swap articles.
					if ($body.hasClass('is-article-visible')) {

						// Deactivate current article.
							var $currentArticle = $main_articles.filter('.active');

							$currentArticle.removeClass('active');

						// Show article.
							setTimeout(function() {

								// Hide current article.
									$currentArticle.hide();

								// Show article.
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

				// Otherwise, handle as normal.
					else {

						// Mark as visible.
							$body
								.addClass('is-article-visible');

						// Show article.
							setTimeout(function() {

								// Hide header, footer.
									$header.hide();
									$footer.hide();

								// Show main, article.
									$main.show();
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

			};

			$main._hide = function(addState) {

				var $article = $main_articles.filter('.active');

				// Article not visible? Bail.
					if (!$body.hasClass('is-article-visible'))
						return;

				// Add state?
					if (typeof addState != 'undefined'
					&&	addState === true)
						history.pushState(null, null, '#');

				// Handle lock.

					// Already locked? Speed through "hide" steps w/o delays.
						if (locked) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Deactivate article.
								$article.removeClass('active');

							// Hide article, main.
								$article.hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								$body.removeClass('is-article-visible');

							// Unlock.
								locked = false;

							// Unmark as switching.
								$body.removeClass('is-switching');

							// Window stuff.
								$window
									.scrollTop(0)
									.triggerHandler('resize.flexbox-fix');

							return;

						}

					// Lock.
						locked = true;

				// Deactivate article.
					$article.removeClass('active');

				// Hide article.
					setTimeout(function() {

						// Hide article, main.
							$article.hide();
							$main.hide();

						// Show footer, header.
							$footer.show();
							$header.show();

						// Unmark as visible.
							setTimeout(function() {

								$body.removeClass('is-article-visible');

								// Window stuff.
									$window
										.scrollTop(0)
										.triggerHandler('resize.flexbox-fix');

								// Unlock.
									setTimeout(function() {
										locked = false;
									}, delay);

							}, 25);

					}, delay);


			};

		// Articles.
			$main_articles.each(function() {

				var $this = $(this);

				// Close.
					$('<div class="close">Close</div>')
						.appendTo($this)
						.on('click', function() {
							location.hash = '';
						});

				// Prevent clicks from inside article from bubbling.
					$this.on('click', function(event) {
						event.stopPropagation();
					});

			});

		// Events.
			$body.on('click', function(event) {

				// Article visible? Hide.
					if ($body.hasClass('is-article-visible'))
						$main._hide(true);

			});

			$window.on('keyup', function(event) {

				switch (event.keyCode) {

					case 27:

						// Article visible? Hide.
							if ($body.hasClass('is-article-visible'))
								$main._hide(true);

						break;

					default:
						break;

				}

			});

			$window.on('hashchange', function(event) {

				// Empty hash?
					if (location.hash == ''
					||	location.hash == '#') {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Hide.
							$main._hide();

					}

				// Otherwise, check for a matching article.
					else if ($main_articles.filter(location.hash).length > 0) {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Show article.
							$main._show(location.hash.substr(1));

					}

			});

		// Scroll restoration.
		// This prevents the page from scrolling back to the top on a hashchange.
			if ('scrollRestoration' in history)
				history.scrollRestoration = 'manual';
			else {

				var	oldScrollPos = 0,
					scrollPos = 0,
					$htmlbody = $('html,body');

				$window
					.on('scroll', function() {

						oldScrollPos = scrollPos;
						scrollPos = $htmlbody.scrollTop();

					})
					.on('hashchange', function() {
						$window.scrollTop(oldScrollPos);
					});

			}

		// Initialize.

			// Hide main, articles.
				$main.hide();
				$main_articles.hide();

			// Initial article.
				if (location.hash != ''
				&&	location.hash != '#')
					$window.on('load', function() {
						$main._show(location.hash.substr(1), true);
					});

})(jQuery);
