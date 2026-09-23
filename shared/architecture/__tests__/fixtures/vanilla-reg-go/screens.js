reg('home', function() {
  return 'home';
});
reg('settings', function() {
  go('home');
  return 'settings';
});
