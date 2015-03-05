Package.describe({
  name: 'zocky:frames-context',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Nested reactive contexts, used by zocky:frames',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.2');
  api.export('FramesContext');
  api.use('meteor','client');
  api.use('underscore','client');
  api.use('raix:eventemitter','client');
  api.addFiles('utils.js','client');
  api.addFiles('frames-context.js','client');
  api.addFiles('frames-context-api.js','client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('zocky:frames-context');
  api.addFiles('frames-context-tests.js');
});
