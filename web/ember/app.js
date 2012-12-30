(function() { 
  
	/* parameters: ************************************/
  
	/* number of posts to display in index.html page */
	var numIndexPosts = 6;

	/* pagination variables */
	var paginate = true;        /* true paginate, false don't */
	var numArchivePosts = 5;    /* number of posts for each page */        
    
	/* post tips variables */
	var tooltipLength = 250;     /* potst tooltip aproximate lenght -will adjust to resolve unclosed links */                 
    
	/* portfolio project show variables */
	var slideTime = 1000; /* time between project images in slide -can be actually more if getting src lags */
    
	/* helper and plugin functions: ************************************/
    
	// A helper function to define a property used to render the navigation. Returns
	// true if a state with the specified name is somewhere along the current route.
	function stateFlag(name) {
		return Ember.computed(function() {
			var state = App.router.currentState;
          
			while(state) {
				if(state.name === name) return true;
				state = state.get('parentState');
			}
			return false;
		}).property('App.router.currentState');
	};
    
	// format the date passed by post data from posts.json for use in url
	// receives string type "March 1st 2012"
	// returnes {dd, mm, yy}
	function formatDate(string) { 
		var date = string.split(" "); 	
		var result = new Object; 
      
		date[1] = parseInt(date[1]);
		date = date.join(" "); 
		var newDate = new Date(date);
		
		result.year = newDate.getFullYear(); 
		result.month = newDate.getMonth() + 1;  
		result.day = newDate.getDate();       
		if (result.month < 10) {
			result.month = "0" + result.month;
		}
		if (result.day < 10) {
			result.day = "0" + result.day;
		}
		return result;          
	};
        
	// create summary for tooltip from complete post text
	function tCut(html) {
		var resume = html.slice(0, tooltipLength);
		//check for unclossed links
		var open = resume.lastIndexOf('<a');
		if (open !== -1) {  //there is link at the end of the resume
			var close = resume.lastIndexOf('/a>');
			if (close < open) {  //either there is no closing tag or it is from another link
				var part = html.slice(tooltipLength);  //add the closing tag to the resume
				close = part.indexOf('/a>');
				part = part.slice(0, close+3);
				resume = resume + part;
			}
		}
		//add preventive closing tags and ...
		resume = resume + '... <\/code><\/pre><\/p>';
		return resume;
	};    
    
	// create tip and display
	function createTip(element) {
		var $this = $(element);
		var $postTip = $this.parent().parent().next();        
		var $postTipBox = $this.parent().parent().next().find('.postTip-box');
		var canvas = $postTip.find('canvas')[0]; 
      
		if (canvas.getContext) {
			//add canvas element to postTip box
			var context = canvas.getContext('2d');                     
			//draw triangle pointer to post tip box
			context.beginPath();
			context.moveTo(0,canvas.height / 2);
			context.lineTo(canvas.width,0);
			context.lineTo(canvas.width,canvas.height);
			context.fillStyle = $postTip.css('background-color');
			context.fill();
			//position pointer relative to height of tip-box                    
			$postTipBox.css('top', $postTip.height() / 2 - 3);
		}
          
		//get tip position
		var offset = $this.offset();
		var top = offset.top - ($postTip.height() / 2) + ($this.height() / 2);
		var left = offset.left + $this.width() + 20;
		// show tip, slide up if first show, otherwise fade in
		if (parseFloat($postTip.css('top')) !== top) {
			$postTip.css({'top': offset.top, 'left': left});
			$postTip.animate({'top': top, 'left': left}).addClass('visible');
		} else {
			$postTip.fadeIn('slow').addClass('visible');
		}
	};
    
	//add tips
	function callTips() {
		$('.postTip-link').hover(
			function() { createTip(this) },
			function() { $(this).parent().parent().next().removeClass('visible').fadeOut('fast') }
		);    
	};
    
	// call prettyprint plugin
	function tPrettify() {                    
		setTimeout(function() {
			$('pre').addClass('prettyprint');
			prettyPrint();
			$("pre .prettyprint").wrapInner("<span></span>");
		}, 30);                    
	};        
    
	// load projects in portfolio, includes navigation
	function loadProject(project) {
		var $project = $("#project-wrap");
		var $portfolio = $('#portfolio-wrap');
		var $wrapper = $('.container');
		var $mainNav = $('#main-nav');
		var $header = $('header');
		var $footer = $('footer');
		var $close = $('#project-wrap span.close');
		var $next = $('#project-wrap span.next');
		var $prev = $('#project-wrap span.prev');
		var offset = window.pageYOffset;
        
		showLoader();
		$('html').animate({'scrollTop' : 0}, 400, function(){
			$project.slideUp(500, function(){
				hideLoader();
				//get all images in the project ember object
				images = project.get('images');
				index = 0;    
				//add first imaget to project-wrap div            
				$project.append('<div class="project-nav"><span class="circle close"><a href="#close">Close</a></span><span class="circle next"><a href="#next">Next</a></span><span class="circle prev"><a href="#prev">Prev</a></span></div>');
				$project.append('<img src="'+images[0]+'" alt="" id="preview" class="fp_preview"/>');
                
				$header.fadeOut(200);
				$mainNav.fadeOut(200);
				$footer.hide();
				$portfolio.fadeOut(200,function(){
					$project.slideDown(500);
					showProject();
				});
				return false;        
			});
			return false;
		});
        
		function showLoader(){
			$wrapper.append('<span id="load" class="project-loader">LOADING...</span>');  
			$('#load').fadeIn('normal');
		};
        
		function hideLoader(){
			$('#load').fadeOut('fast',function(){$('#load').remove();});
		};
        
		function showProject(){
			$('.project-nav').animate({'right':'0px'},200);
		};
        
		function hideProject(){
			$('.project-nav').animate({'right':'-181px'},200);
		};
        
		//project navigation
		$next.live('click',function() {
			// if last image, return to first
			if (++index > images.length - 1) index = 0;
			showLoader();
			var url = images[index];
			$('<img class="fp_preview"/>').load(function(){
				var $newimg = $(this);  
				var $currImage  = $project.children('img:first');
				hideLoader();
				$newimg.insertBefore($currImage);
				$currImage.fadeOut(slideTime,function(){$(this).remove();});
			}).attr('src',url);
		});
                
		$prev.live('click',function(){
			// if first image, go to last
			if (--index < 0) index = images.length - 1;                   
			showLoader();
			var url = images[index];
			$('<img class="fp_preview"/>').load(function(){
				var $newimg = $(this);
				var $currImage = $project.children('img:first');
				$newimg.data('origWidth', $newimg.width()).data('origHeight', $newimg.height());                
				hideLoader();
				$newimg.insertBefore($currImage);
				$currImage.fadeOut(slideTime,function(){$(this).remove();});
			}).attr('src',url);
		});        
        
		$close.live('click',function(){
			hideProject();
			hideLoader();
			$project.slideUp(200,function(){
				$header.fadeIn(200);    
				$mainNav.fadeIn(200);                    
				$portfolio.fadeIn(200, function(){
					if(offset && offset > 0 ) $('body, html').animate({'scrollTop' : offset}, 400 );
					$project.empty();
					$footer.show();
					$footer.fadeIn(200);
				});
			});
			return false;
		});                        
	};
    
	//back to top button
	function topButton() {
		var $topcontrol = $('#topcontrol');
		//show button on scroll
		$(window).scroll(function() {
			if ($(window).scrollTop() === 0) {
				$topcontrol.fadeOut('slow');
			} else {
				$topcontrol.fadeIn('slow');                
			}              
		});    
		$topcontrol.click(function() {
			$('html, body').animate({scrollTop: 0}, 800);
		});   
	};
    
	// ember application
	window.App = Ember.Application.create({
		init: function() { this._super(); },                

		/* CONTROLLERS AND VIEWS ******************************************************/                 
		// MAIN application controller. Automatically picked up by
		// the application and initialized.
		ApplicationController: Ember.Controller.extend({
			init: function() { this._super() },
            
			isHome: stateFlag('home'),
			isPortfolio: stateFlag('portfolio'),
			isAbout: stateFlag('about'),
			isResume: stateFlag('resume'),
			isArchive: stateFlag('archive')           
		}),        
		// Main view.
		ApplicationView: Ember.View.extend({
			init: function() { this._super() },
			templateName: 'application',
			didInsertElement: function() {  
				//add scroll back to top button on every page        
				topButton();                        
			}        
		}),    
        
		//HOME
		HomeController: Ember.ArrayController.extend({
			init: function() { this._super() }
		}),
		HomeView: Ember.View.extend({
			init: function() { this._super() },
			templateName: 'home',
			didInsertElement: function() {
				//add post tips
				callTips();
				//format <pre> code
				tPrettify();
			},
			isHome: function() {
				return this.get('parentView').get('isHome');
			}
		}),
    
		//PORTFOLIO
		PortfolioController: Ember.Controller.extend({
			init: function() {
				this._super();
				this.loadContent();
			},
			loadContent: function() {
				var self = this;
				var url = "ember/data/portfolio.json";
				$.getJSON(url,function(data){             
					var content = [];
					$(data).each(function(index,project){ 
						//create project as ember object and add to array content                        
						content.pushObject(App.Project.create(project));
					});
					self.set('content', content);
				});
			}                             
		}),
		PortfolioView: Ember.View.extend({
			init: function() {  this._super() },
			templateName: 'portfolio'
		}),
              
		//ABOUT
		AboutController: Ember.Controller.extend({
			init: function() { this._super() }
		}),
		AboutView: Ember.View.extend({
			init: function() { this._super() },
			templateName: 'about'
		}),  
            
		//RESUME
		ResumeController: Ember.Controller.extend({
			init: function() {
				this._super();
				this.loadContent();
			},
			loadContent: function() {
				var self = this;
				var url = "ember/data/resume.json";
				$.getJSON(url,function(data){             
					var content = [];
					$(data).each(function(index,resumeBlock){
						//create resumeBlock as ember object and add to array content                        
						content.pushObject(App.ResumeBlock.create(resumeBlock));                        
					});
					self.set('content', content);
				});              
			}              
		}),
		ResumeView: Ember.View.extend({
			init: function() { this._super() },
			templateName: 'resume'
		}),
		//ARCHIVE
		ArchiveController: Ember.ArrayController.extend({
			init: function() { this._super() }
		}),
		ArchiveView: Em.View.extend({
			init: function() { this._super();},
			templateName: 'archive'    ,
			didInsertElement: function() {                    
				// activate page1 link
				$('.page_navigation #page1').addClass('active_page');    
				// add post tips
				callTips();                                          
			}                                                   
		}),
      
		//POSTS
		//posts controller used by archive and home page
		PostsController: Ember.ArrayController.extend(Ember.PaginationSupport, {
			content: [],
			fullContentSorted: true,		//set to false to activate sorting function	when new content added
			//pagination variables
			fullContentBinding: 'App.Posts',
			rangeWindowSize: numArchivePosts,
			totalBinding: 'fullContent.length', 
			sortdeContent: [],               
            
			init: function() {
				var self = this;
				self._super();                
                   
                //sort by date if not sorted
                //not called by default as content is already sorted
                if (!self.get('fullContentSorted')) { 
                	self.set('fullContent', self.get('sortedContent')); 
                	self.set('fullContentSorted', true);
                }  
				
				//set isFirst propriety for first post in fullContent   
                var firstPost = self.get('fullContent').get('firstObject');
                firstPost.set('isFirst', true);  	
                		
				//pagination
				if (paginate) {  
					self.set('hasPaginationSupport', true);                                 
					self.didRequestRange(this.get('rangeStop'),this.get('rangeStop'));
				} else {
					self.set('hasPaginationSupport', false);  
					self.set('content', App.Posts);
				}
                
				self.updatePageLinks();        
			},  
			
			sortedContent: function() {
				var sorted = this.get('fullContent').toArray().sort(function(a, b) {
					var date1 = getDate(a.get('formatDate'));
					var date2 = getDate(b.get('formatDate'));
					return date1>date2?-1:date1<date2?1:0;
				});
				function getDate(date) {
					return date = new Date(date.year + "," + date.month + "," + date.day)
				}
				return sorted;
			}.property('@each'),                                                                                                                                      
                
			//function that returns only first numIndexPosts posts for index page
			firstPosts: function() {
				return App.Posts.toArray().splice(0, numIndexPosts);    
 			}.property('@each'),                        
            
			//pagination
			//gets content for each page called
			didRequestRange: function(rangeStart, rangeStop) { 
				var content = this.get('fullContent').slice(this.get('rangeStart'), this.get('rangeStop'));
				this.replace(0, this.get('length'), content);  
				this.updatePageLinks();    
			},
            
			//returns totalPages as an ember array so as to iterate over it
			totalPagesArray: function() {
				var totalPages = this.get('totalPages');    
				var array = Em.ArrayProxy.create({content: Em.A()});
				for (var j=0; j<totalPages; j++) {
					page = Em.Object.create({ content: j+1, id: 'page'+(parseInt(j+1)) });
					array.pushObject(page);;
				}
				return array;
			}.property('@each'),
            
			//get corresponding page posts
			getPage: function(context) {      
				var rangeStart = (context.target.text-1) * this.get('rangeWindowSize');
				this.set('rangeStart', rangeStart);
				this.didRequestRange(this.get('rangeStart'),this.get('rangeStop'));                                                        
			},
            
			//page navigation actions
			firstPage: function(context) {
				this.set('rangeStart', 0);
				this.didRequestRange(0, this.get('rangeStop'));
			},
            
			lastPage: function(context) {
				var rangeStart = (this.get('totalPages') -1) * this.get('rangeWindowSize');
				this.set('rangeStart', rangeStart);
				this.didRequestRange(this.get('rangeStart'), this.get('rangeStop'));
			},
            
			updatePageLinks: function() {
				var page = this.get('page');
                var total = this.get('totalPages');             
                setTimeout(function() {                     
					//active page link
                    $('.page_navigation #page'+page).addClass('active_page');
                    //first and prev links
                    if (page == 1) {
                        if ($('.page_navigation .back').not('.no_more')) $('.page_navigation .back').addClass('no_more');
                    }
                    if (page > 1) {
                        $('.page_navigation .back').removeClass('no_more');
                    }
                    //next and last links
                    if (page < total) {
                        $('.page_navigation .forward').removeClass('no_more');
                    }
                    if (page == total) {
                        if ($('.page_navigation .forward').not('.no_more')) $('.page_navigation .forward').addClass('no_more');
                    }
                    
                    //recall tips
                    callTips();                
                }, 0);
			}                                                            
		}),          
                
		//POST
		PostController: Ember.ObjectController.extend({
			init: function() { this._super(); }
		}),
		PostView: Ember.View.extend({
			init: function() { this._super() },
			templateName: 'post',           
		}),
        
		/* ROUTER ******************************************************/
		Router: Ember.Router.extend({
			init: function() { this._super() },
            root: Ember.Route.extend({
				
				//transition -navigation- methods
				doHome: function(router, event) { router.transitionTo('home'); },
				doPortfolio: function(router) { router.transitionTo('portfolio.index'); },
				doAbout: function(router) { router.transitionTo('about'); },
				doResume: function(router) { router.transitionTo('resume'); },
				doArchive: function(router) { router.transitionTo('archive'); },
				
				//index / home page manager
				home: Ember.Route.extend({
					route: '/',
					connectOutlets: function(router) {  
						//HomeController uses PostsController                                                                               
						router.get('homeController').connectControllers('posts');
						router.get('applicationController').connectOutlet('home');
					},
				}),
				//portfolio page manager
				portfolio: Ember.Route.extend({
					route: '/portfolio',
					connectOutlets: function(router) {
						router.get('applicationController').connectOutlet('portfolio');
					},
					index: Ember.Route.extend({
						route: '/'
					})
				}),
				//open project clicked from portfolio
                doProject: function(router, context) {
					var portfolio = router.get('portfolioController').content;    
					//this project as an ember object                  
					var project = $.grep(portfolio, function(e){ return e.id == context.target.id; });
					loadProject(project[0]);
				}, 
				//about page manager
				about: Ember.Route.extend({
					route: '/about',
					connectOutlets: function(router) {
						router.get('applicationController').connectOutlet('about');
					}
				}),
				//resume page manager
				resume: Ember.Route.extend({
					route: '/resume',
					connectOutlets: function(router) {
						router.get('applicationController').connectOutlet('resume');
					}
				}),
				//archive page manager
				archive: Ember.Route.extend({
					route: '/archive',
					connectOutlets: function(router) {  
						//ArchiveController uses PostsController                                                                               
						router.get('archiveController').connectControllers('posts');
 						router.get('applicationController').connectOutlet('archive');
					},
				}),
				//post page manager
				post: Ember.Route.extend({
					route: '/:post_id/:year/:month/:day/:title',
					connectOutlets: function(router, context) {                                       
						var post = router.get('postsController.fullContent').objectAt(context.post_id);                                  
						router.get('postController').set('content', post);
						router.get('applicationController').connectOutlet('post');                              
						tPrettify();                                  
					},    
					serialize: function(router, post_id) {     
						var post = router.get('postsController.fullContent').objectAt(post_id.post_id);   
						var date = post.get('formatDate'); 
						var title = post.get('title');                                                                        
						return { "post_id": post.id, "year": date.year, "month": date.month, "day": date.day, "title": title}
					},
					deserialize: function(router, params) {  
						return params;                              
					}                                                    
				}),    
				//navigate to post                  
				doPost: function(router, context) {                      
					router.transitionTo('post', {post_id: context.target.id});
				},
				//navigate to previous post
				prevPost: function(router, context) {  
					var id = parseInt(context.target.id) + 1;
					var totalPosts = router.get('postsController.fullContent').toArray().length;
					if (id === totalPosts) id = 0;                       
					router.transitionTo('post', {post_id: id});                                        
				},
				//navigate to next post
				nextPost: function(router, context) {
					router.transitionTo('post', {post_id: context.target.id - 1})                  
				}			                               
			})
		})      
	});
    
	/* STORE ******************************************************/
	//MODELS
	App.Post = DS.Model.extend({
        title: DS.attr('string'),
        date: DS.attr('string'),
        html: DS.attr('string'),
        img: DS.attr('string'),
        resume: function() {
            if (this.get('html')) {;
                var html = tCut(this.get('html'));
            } else  var html = '<p> No text in post.<\/p>';             
            return html;
        }.property('html'),
        formatDate: function() {
        	if (this.get('date')) { 
        		var date = formatDate(this.get('date'));  
        	}
        	return date;
         }.property('date'),
    }).reopenClass({
        url: 'ember/data/posts.json'
    });
    
    //ADAPTER *only for posts
    App.adapter = DS.Adapter.create({
		findAll: function(store, type) {
			var url = type.url;
			$.getJSON(url, function(data) {
				store.loadMany(type, data);
			});                      
		}
    });    
    
    App.store = DS.Store.create({
          revision: 6,
          adapter: App.adapter
    });    
                
    App.Posts = App.store.findAll(App.Post);
    
    //resume model
    App.ResumeBlock = Em.Object.extend({
        init: function() { 
        	this._super();
        	var id = this.get('id');
        	var title = this.get('title');
        	var items = this.get('items');
        	var skills = this.get('skills');
        	var clients = this.get('clients');
        }      
    });    
    
    //portfolio model
    App.Project = Em.Object.extend({
        init: function() { 
        	this._super();
        	var id = this.get('id');
        	var title = this.get('title');
        	var description = this.get('description');
        	var images = this.get('images');
  		}       
    });    

})();