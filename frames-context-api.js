_.extend(FramesContext,{
  contexts: {},
  counts: {},
  get: function(id,parentId,options) {
    if (parentId) {
      var parent = this.contexts[parentId];
      assert(parent,'no such parent');
      options.parent = parent;
    }
    if (!this.contexts[id]) {
      options.id = id;
      this.contexts[id] = new FramesContext(options);
    }
    return this.contexts[id];
  },
  load: function(id,parentId,options) {
    this.counts[id] = (this.counts[id] | 0) + 1;
    return this.get(id,parentId,options);
  },
  unload: function(id) {
    this.counts[id]--;
    if (this.counts[id] === 0) {
      this.contexts[id].destroy();
    }
  }
})
