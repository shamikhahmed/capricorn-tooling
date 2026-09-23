const TABS = ['today', 'garage'];
const MORE = [{ id: 'settings' }, { id: 'import' }];
const Nav = {
  _sidebarTabs: [{ id: 'stable' }, { id: 'map' }],
  go: function (tab) {}
};
const Navigation = {
  go: function (screenId) {}
};
function go(tab) { Navigation.go(tab); }
function boot() {
  go('today');
  Navigation.go('garage');
  Nav.go('stable');
  document.body.innerHTML += '<button data-go="settings">S</button>';
}
