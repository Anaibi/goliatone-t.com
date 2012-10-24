(function() {
	
	/* parameters: */
	var numIndexPosts = 6;

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
	  		
	  		init: function() { 
			this._super();
			},
			
		    isHome: stateFlag('home'),
		    isPortfolio: stateFlag('portfolio'),
		    isAbout: stateFlag('about'),
		    isResume: stateFlag('resume'),
		    isPosts: stateFlag('posts')		   
		}),
	  	ApplicationView: Ember.View.extend({
	  		init: function() { 
			this._super();
			},
	    	templateName: 'application'
			
	  	}),
	
	  	HomeController: Ember.ArrayController.extend({
	  		init: function() { 
			this._super();
			}
	  	}),
	  	HomeView: Ember.View.extend({
	  		init: function() { 
			this._super();
			},
	    	templateName: 'home'
	  	}),
	  
	  	PortfolioController: Ember.Controller.extend({
	  		init: function() { 
			this._super();
			}
	  	}),
	  	PortfolioView: Ember.View.extend({
	  		init: function() { 
			this._super();
			},
	    	templateName: 'portfolio'
	  	}),
	  
	  	AboutController: Ember.Controller.extend({
	  		init: function() { 
			this._super();
			}
	  	}),
	  	AboutView: Ember.View.extend({
	  		init: function() { 
			this._super();
			},
	    	templateName: 'about'
	  	}),
	  
	  	ResumeController: Ember.Controller.extend({
	  		init: function() { 
			this._super();
			}
	  	}),
	  	ResumeView: Ember.View.extend({
	  		init: function() { 
			this._super();
			},
	    	templateName: 'resume'
	  	}),
	  
	  	PostsController: Ember.ArrayController.extend({
			init: function() {  
				this._super();						
		
				// TODO make sure posts are ordered by date last post first, 
				// then assign isFirst here -better then checking again later, id also
														
				this.set('content', App.Posts);
			},
			//function that returns only first six posts for index page
			firstPosts: function() {
				return this.toArray().splice(0,numIndexPosts);			
			}.property('@each')	
	  	}),	  	
	  	PostsView: Ember.View.extend({
	  		init: function() { 
			this._super();
			},
	    	templateName: 'posts',	    	
	  	}),
	  	
	  	PostController: Ember.ObjectController.extend({
	  		init: function() { 
			this._super();
			}
	  	}),
  		PostView: Ember.View.extend({
  			init: function() { 
			this._super();
			},
    		templateName: 'post',   		
  		}),
	    
	  
	  	Router: Ember.Router.extend({
	  		init: function() { 
			this._super();
			},
	    	root: Ember.Route.extend({
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
	       		doPosts: function(router) { 
	        		router.transitionTo('posts.index');
	      		},
	      		home: Ember.Route.extend({
	        		route: '/',
	        		connectOutlets: function(router) {  								     			                              
                        router.get('homeController').connectControllers('posts');
	      				router.get('applicationController').connectOutlet('home');
	      			},
	      		}),
	      		portfolio: Ember.Route.extend({
	        		route: '/portfolio',
	        		connectOutlets: function(router) { 
	          			router.get('applicationController').connectOutlet('portfolio');
	        		},
	        		index: Ember.Route.extend({
	          			route: '/'
	        		})
	      		}),
	      		about: Ember.Route.extend({
	        		route: '/about',
	        		connectOutlets: function(router) { 
	          			router.get('applicationController').connectOutlet('about');
	        		}
	      		}),
	      		resume: Ember.Route.extend({
	        		route: '/resume',
	        		connectOutlets: function(router) {
	          			router.get('applicationController').connectOutlet('resume');
	        		}
	      		}),
	      		posts: Ember.Route.extend({
	      			route: '/archive',
	      			index: Ember.Route.extend({
	      				route: '/',
	      				connectOutlets: function(router) { 								
	      					router.get('applicationController').connectOutlet('posts');
	      				}
	      			})		
	      		}),
	      		post: Ember.Route.extend({
	      				route: '/posts/:post_id',
	      				connectOutlets: function(router, context) {  
	      					var post = router.get('postsController.content').objectAt(context.post_id);	    					
	      					router.get('postController').set('content', post);
	      					router.get('applicationController').connectOutlet('post');
	      				},	      						      				
	      		}),	      			
	      		doPost: function(router, context) { 	 				
	      				router.transitionTo('post', {post_id: context.target.id});
	      		},
	      		prevPost: function(router, context) {  
	      			router.transitionTo('post', {post_id: parseInt(context.target.id) + 1})	      		
	      		},
	      		nextPost: function(router, context) { 
	      			router.transitionTo('post', {post_id: context.target.id - 1})	      		
	      		}		      		      
	    	})
	  	})  	
	});
	
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
	
	App.HtmlText = DS.Model.extend({
		content: [],
		post: DS.belongsTo('Post')
	});
		
	App.Img = DS.Model.extend({
		src: DS.attr('string'),
		alt: DS.attr('string'),
		post: DS.belongsTo('Post')
	});	
		
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

