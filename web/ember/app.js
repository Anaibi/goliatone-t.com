(function() {
	
	/* parameters: ************************************/
	/* number of posts to display in index.html page */
	var numIndexPosts = 6;
	
	/* pagination variables */
	var paginate = true;		/* true paginate, false don't paginate */
	var numArchivePosts = 5;	/* number of posts for each page */	
	var page;				 	
	
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
	  		templateName: 'archive',	  				  			  		
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
				};
				
				console.log('before call');
				self.updatePageLinks();			
			},	
			
															
												
			//for first pagination give range
			//TODO move proper pagination block
			didRequestRange: function(rangeStart, rangeStop) { 
    			var content = this.get('fullContent').slice(this.get('rangeStart'), this.get('rangeStop'));
    			this.replace(0, this.get('length'), content);  
    			this.updatePageLinks();	
  			},
				
			//function that returns only first six posts for index page
			firstPosts: function() {
				return App.Posts.toArray().splice(0, numIndexPosts);	
			}.property('@each'),	
			
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
			
			//pagination
			setPage: function(context) { 			 
				var rangeStart = (context.target.text-1) * this.get('rangeWindowSize');
				this.set('rangeStart', rangeStart); 
				this.didRequestRange(this.get('rangeStart'),this.get('rangeStop'));														
			},
			
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
				var total = this.get('totalPages'); console.log(total); 			
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
					
				}, 10);
			}															
	  	}),	  	
  		  	
	  	//POST
	  	PostController: Ember.ObjectController.extend({
	  		init: function() { this._super() }
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
	      		//TODO modify to output url .com/YY/MM/DD/post_title
	      		post: Ember.Route.extend({
	      				route: '/:post_id',
	      				connectOutlets: function(router, context) {  
	      					var post = router.get('postsController.content').objectAt(context.post_id);	    					
	      					router.get('postController').set('content', post);
	      					router.get('applicationController').connectOutlet('post');
	      				},	
	      				serialize: function(router, post) {	      					
	      					return { "post_id": post.post_id }
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
