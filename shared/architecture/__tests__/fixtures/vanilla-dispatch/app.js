function save() {
  localStorage.setItem('ok', '1');
}
function handleAct(act) {
  switch (act) {
    case 'save': return save();
    case 'explode': return missingHandler();
  }
}
document.addEventListener('click', function (e) {
  var t = e.target.getAttribute('data-act');
  if (t) handleAct(t);
});
