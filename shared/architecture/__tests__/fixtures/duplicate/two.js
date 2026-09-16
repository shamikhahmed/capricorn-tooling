function calcTotalB(rows) {
  var sum = 0;
  var i = 0;
  var n = rows.length;
  var tax = 0.1;
  var fee = 2;
  for (i = 0; i < n; i++) {
    sum = sum + rows[i].price;
  }
  sum = sum + sum * tax;
  sum = sum + fee;
  return sum;
}
