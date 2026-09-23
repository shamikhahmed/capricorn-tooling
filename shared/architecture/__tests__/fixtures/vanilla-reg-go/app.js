const MODULE_SRC = {};
const WORKOUT_CHAIN = ['data.js', 'plan.js'];
const MODULE_CHAIN = {
  'lazy-plan': ['plan.js'],
  workout: WORKOUT_CHAIN
};
Object.keys(MODULE_CHAIN).forEach(function(id) {
  MODULE_SRC[id] = MODULE_CHAIN[id][MODULE_CHAIN[id].length - 1];
});
function openHome() {
  go('home');
}
function openLazy() {
  go('lazy-plan');
}
function reg(id, fn) { _screens[id] = fn; }
function go(id) { _screens[id](); }
