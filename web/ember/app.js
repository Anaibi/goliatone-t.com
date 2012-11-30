(function() {
	
	/* parameters: ************************************/
	/* number of posts to display in index.html page */
	var numIndexPosts = 6;
	
	/* pagination variables */
	var paginate = true;		/* true paginate, false don't paginate */
	var numArchivePosts = 5;	/* number of posts for each page */	
	var page;
	var postsIn = false; 		/* posts loaded on archive page */				 	
	
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
	
	
	// format the date passed by post data
	function getDate(string) { 
	  	var array = string.split(" "); 
	  	array [1] = parseInt(array[1]); 
	  	string = array.join(" ");
	  	var date = new Date(string);
	  	var result = new Object;
	  	result.year = date.getFullYear(); 
	  	result.month = date.getMonth() + 1; 
	  	result.day = date.getDate(); 
	  	if (result.month < 10) {
	  		result.month = "0" + result.month;
	  	}
	  	if (result.day < 10) {
	  		result.day = "0" + result.day;
	  	}
	  	return result;	  	
	};
	
	//call prettyprint on doPost available
	function tPrettify() {					
		setTimeout(function() {
			
			/* 
			 code for catching post html and converting to json string, added to html propriety of post object
			
			//grab html from post text and stringify?
			var text = $('#article-body').html();
			console.log(JSON.stringify(text)); 
			
			*/
			
			// Handler for .ready() called.
			$('pre').addClass('prettyprint');
			prettyPrint();
			$("pre .prettyprint").wrapInner("<span></span>");
	
			$("pre").hover(function() {
				var contentwidth = $(this).contents().width();
				var blockwidth = $(this).width();
				if(contentwidth > blockwidth) {
					$(this).animate({
						width : "830px"
					}, 250);
				}
			}, function() {
				$(this).animate({
					width : "720px"
				}, 250);
			});
		}, 30);					
	};
	
	// Create the application
	window.App = Ember.Application.create({ 
		
		init: function() { 
			this._super(); 
		},				
		
		// Define the main application controller. This is automatically picked up by
	  	// the application and initialized.
	  	ApplicationController: Ember.Controller.extend({
	  		
	  		init: function() { this._super() },
			
		    isHome: stateFlag('home'),
		    isPortfolio: stateFlag('portfolio'),
		    isAbout: stateFlag('about'),
		    isResume: stateFlag('resume'),
		    isArchive: stateFlag('archive')		   
		}),
		
	  	ApplicationView: Ember.View.extend({
	  		init: function() { this._super() },
	    	templateName: 'application'			
	  	}),
		
		/* CONTROLLERS AND VIEWS ******************************************************/ 
		
		//HOME
	  	HomeController: Ember.ArrayController.extend({
	  		init: function() { this._super() }
	  	}),
	  	HomeView: Ember.View.extend({
	  		init: function() { this._super() },
	    	templateName: 'home'
	  	}),
	  
	  	//PORTFOLIO
	  	PortfolioController: Ember.Controller.extend({
	  		init: function() { this._super() }
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
	  		init: function() { this._super() }
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
	  		templateName: 'archive'	,
	  		didInsertElement: function() {					
				//activate page1 link
				$('.page_navigation #page1').addClass('active_page');						  			
	  		}  		 				  			  		
	  	}),
	  
	  	//POSTS
	  	PostsController: Ember.ArrayController.extend(Ember.PaginationSupport, {
			content: [],
			fullContentBinding: 'App.Posts',
			rangeWindowSize: 5,
			totalBinding: 'fullContent.length',				
			
			init: function() { 
				var self = this; 
				self._super();				
						
				// TODO make sure posts are ordered by date last post first, 
				// then assign isFirst here -better then checking again later, id also
				
				if (paginate) { 
					self.set('hasPaginationSupport', true); 								
					self.didRequestRange(this.get('rangeStop'),this.get('rangeStop'));
				} else {
					self.set('content', App.Posts);
				}
				
			//	self.updatePageLinks();		
				self.get('updatePageLinks');
			},																																		
				
			//function that returns only first six posts for index page
			firstPosts: function() {
				return App.Posts.toArray().splice(0, numIndexPosts);	
			}.property('@each'),						
			
			//pagination TODO move proper pagination block
			//sets content for each page
			didRequestRange: function(rangeStart, rangeStop) { console.log('did request range');
    			var content = this.get('fullContent').slice(this.get('rangeStart'), this.get('rangeStop'));
    			this.replace(0, this.get('length'), content);  
    		//	this.updatePageLinks();	
    			this.get('updatePageLinks');	
  			},
			
			//returns totalPages as an ember array so as to iterate over it
			totalPagesArray: function() {
				var i = this.get('totalPages');	
				var array = Em.ArrayProxy.create({content: Em.A()});
				for (var j=0; j<i; j++) {
					page = Em.Object.create({ content: j+1, id: 'page'+(parseInt(j+1)) });
					array.pushObject(page);;
				}
				return array;
			}.property('@each'),
			
			//calls content for page
			setPage: function(context) { 			 
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
			
			updatePageLinks: function() { console.log('update called');
				//TODO remove setTimeout if possible. bind updatePageLinks in some way to page
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
					
				}, 200);
			}.property()															
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
	      		doHome: function(router, event) { 
	        		router.transitionTo('home');
	      		},
	      		doPortfolio: function(router) { 
	        		router.transitionTo('portfolio.index');
	      		},
	      		doAbout: function(router) { 
	       			router.transitionTo('about');
	      		},
	       		doResume: function(router) { 
	        		router.transitionTo('resume');
	      		},
	       		doArchive: function(router) { 
	        		router.transitionTo('archive');
	      		},
	      		//index page manager
	      		home: Ember.Route.extend({
	        		route: '/',
	        		connectOutlets: function(router) {  
	        			//HomeController uses PostsController								     			                              
                        router.get('homeController').connectControllers('posts');
	      				router.get('applicationController').connectOutlet('home');
	      			},
	      		}),
	      		//portfolio page manager
	      		//TODO add content to portfolioController
	      		portfolio: Ember.Route.extend({
	        		route: '/portfolio',
	        		connectOutlets: function(router) { 
	          			router.get('applicationController').connectOutlet('portfolio');
	        		},
	        		index: Ember.Route.extend({
	          			route: '/'
	        		})
	      		}),
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
	      					var date = getDate(post._data.attributes.date);
							var title = post._data.attributes.title;  					      					    					
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
	      		//TODO catch out of limits index
	      		prevPost: function(router, context) {  
	      			router.transitionTo('post', {post_id: parseInt(context.target.id) + 1})	      		
	      		},
	      		//navigate to next post
	      		//TODO catch out of limits index
	      		nextPost: function(router, context) { 
	      			router.transitionTo('post', {post_id: context.target.id - 1})	      		
	      		},
	      		
	      		doPage: function(router, context) {						
					page = context.target.id; 
					console.log(page);
					router.transitionTo('home');
					router.transitionTo('posts.index');			
				}			      		      
	    	})
	  	})  	
	});
	
	/* STORE ******************************************************/ 
	//MODELS
	App.Post = DS.Model.extend({
		isFirst: DS.attr('boolean'),
		title: DS.attr('string'),
		date: DS.attr('string'),
		summary: DS.attr('string'),
		html: DS.attr('string'),
		img: DS.attr('string')
	}).reopenClass({
    	url: 'ember/data/posts.json'
	});
	
	//TODO complete depending on final .json
	App.HtmlText = DS.Model.extend({
		content: [],
		post: DS.belongsTo('Post')
	});
	//TODO complete depending on final .json	
	App.Img = DS.Model.extend({
		src: DS.attr('string'),
		alt: DS.attr('string'),
		post: DS.belongsTo('Post')
	});	
	
	//ADAPTER
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
})();


