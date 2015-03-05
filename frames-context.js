FramesContext = function(options) {
  /* temporary hack until event emitter is fixed upstream */
  var ctx = this;
  var on = ctx.on;
  ctx.on = function() {
    var args = _.toArray(arguments);
    args[1] = args[1].bind(ctx);
    on.apply(ctx,args);
  }
  /* end hack*/

  ctx.id = options.id;
  ctx._ready = new ReactiveVar(false,function(){ return false; });
  ctx._whenReady =[];
  ctx._waiting = 0;
  ctx._subscriptions = [];
  
  ctx.options = options || {};
  ctx.parent = options.parent || null;
  
  if (options.created) this.on('created',options.created);
  if (options.setup) this.on('setup',options.setup);
  if (options.ready) this.on('ready',options.ready);
  if (options.rendered) this.on('rendered',options.rendered);
  if (options.destroyed) this.on('destroyed',options.destroyed);

  this.emit('created');  
  
  if (ctx.parent) {
    ctx.wait('initial '+this.id);
    ctx.parent.whenReady(function() {
      ctx.data = Object.create(ctx.parent.data);    
      ctx.options.setup && ctx.options.setup.call(ctx);
      ctx.done('initial '+ctx.id);
    })
  } else {
    ctx.wait('initial '+this.id);
    Meteor.defer(function() {
      ctx.data = {};
      ctx.options.setup && ctx.options.setup.call(ctx);
      ctx.done('initial '+ctx.id);
    })
  } 
}

FramesContext.prototype = new EventEmitter();

_.extend(FramesContext.prototype, {
  whenReady: function() {
    var w = _.toArray(arguments);
    if (this.ready()) {
      Meteor.defer(function() {
        w[0].apply(w[1],w.slice(2));
      });
    } else {
      this._whenReady.push(w);
    }
  },
  constructor: FramesContext,
  ready:function () {
    return this._ready.get();
  },
  wait: function(what) {
    if (what) console.log('WAIT',what);
    assert(!this.ready(),'cannot wait when already ready');
    this._waiting ++;
  },
  destroy: function(){
    _.invoke(this._subscriptions,'stop');
    this.emit('destroyed');
  },
  done: function(what) {
    if (what) console.log('DONE',what);
    assert(!this.ready(),'cannot be done when already ready');
    assert(this._waiting > 0,'cannot be done when not waiting');
    this._waiting --;
    if (this._waiting) return;

    console.log('ready',this.id);

    setupReactives(this,this.options.data,this.data);
    setupReactives(this,this.options.meta,this);
    var ctx = this;
      //do it this way because callbacks can be added in callbacks
    while (this._whenReady.length) {
      var w = this._whenReady.shift();
      w[0].apply(w[1],w.slice(2));
    }
    this._ready.set(true);
    Tracker.afterFlush(this.emit.bind(this,'rendered'));
  },
  subscribe: function() {
    var ctx = this;
    var args = [].slice.call(arguments,0);
    if (!_.isString(args[0])) throw 'subscription name must be a string';
    ctx.wait('subscribe '+args[0]);
    Meteor.subscribe.apply(Meteor,args.concat({
      onError:function(err) {
        console.log(err);
        ctx.done('subscribe '+args[0]);
      },
      onReady:function() {
        ctx._subscriptions.push(this);
        ctx.done('subscribe '+args[0]);
      }
    }));
  }
});

