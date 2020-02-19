const names = {
  r : 'r',
  w : 'w',
  x : 'x',
  rw : 'rw',
  rx : 'rx',
  wx : 'wx',
}

const re = {
  r : /1[01]{2}/,
  w : /[01]1[01]/,
  x : /[01]{2}1/,
  rw : /11[01]/,
  rx : /1[01]1/,
  wx : /[01]11/,
}

module.exports = {
  names : names, 
  re : re,
}
