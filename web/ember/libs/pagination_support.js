var get = Ember.get;

/**
	@extends Ember.Mixin

	Implements common pagination management properties for controllers.
*/
Ember.PaginationSupport = Ember.Mixin.create({

	hasPaginationSupport: false,

	total: 0,

	rangeStart: 0,

	rangeWindowSize: 10,

	didRequestRange: Ember.K, 

	rangeStop: function() {  
		var rangeStop = get(this, 'rangeStart') + get(this, 'rangeWindowSize'); 
		total = get(this, 'total');
		if (rangeStop < total) {
			return rangeStop;
		}
		return total;
	}.property('total', 'rangeStart', 'rangeWindowSize').cacheable(),

	hasPrevious: function() {
		return get(this, 'rangeStart') > 0;
	}.property('rangeStart').cacheable(),

	hasNext: function() {
		return get(this, 'rangeStop') < get(this, 'total');
	}.property('rangeStop', 'total').cacheable(),

	nextPage: function() { 
		if (get(this, 'hasNext')) {
			this.incrementProperty('rangeStart', get(this, 'rangeWindowSize'));
		}
	},

	previousPage: function() {
		if (get(this, 'hasPrevious')) {
			this.decrementProperty('rangeStart', get(this, 'rangeWindowSize'));
		}
	},

	page: function() {
		return (get(this, 'rangeStart') / get(this, 'rangeWindowSize')) + 1;
	}.property('rangeStart', 'rangeWindowSize').cacheable(),

	totalPages: function() {
		return Math.ceil(get(this, 'total') / get(this, 'rangeWindowSize'));
	}.property('total', 'rangeWindowSize').cacheable(),

	pageDidChange: function() { 	
		this.didRequestRange(get(this, 'rangeStart'), get(this, 'rangeStop')); 
	}.observes('total', 'rangeStart', 'rangeStop')
});