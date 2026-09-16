var CACHE = 'fx-v1';
var ASSETS = ['./app.js', './missing-file.js'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
});
