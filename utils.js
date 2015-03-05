assert = function (a,b,c,d) {
  if (!a) throw new Meteor.Error(a,b,c,d);
}

setupReactives = function(ctx,source,target) {
  //TODO: use reactive-dictionary, probably
  var reactives = {};
  _.each(source,function(value,key) {
    if (_.isFunction(value)) {
      var reactive = reactives[key] = new ReactiveVar(null,function(a,b){
        return false;
      });
      target.__defineGetter__(key,reactive.get.bind(reactive));
    } else {
      target[key]=value;
    }
  })
  _.each(reactives, function(reactive,key) {
    var fn = source[key];
    Tracker.autorun(function() {
      var value = fn.call(ctx);
      reactive.set(value);
    });
  })
}

createDelegate = function(ctx,obj) {
  return _.mapObject(obj,function(val) {
    if (_.isFunction(val)) return val.bind(ctx);
    return val;
  })
}

