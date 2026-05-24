var $ = function(id) { return document.getElementById(id); };

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

function setCookie(name, value, days) {
  var d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/';
}

function getCookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

var state = {
  numbers: null,
  gua: null,
  aiData: null,
  inProgress: false,
  method: 'number',
  rawInput: '',
  timestamp: ''
};

function filterNumeric(input) {
  var val = input.value.replace(/[^0-9]/g, '');
  input.value = val;
  if (val.length > 3) input.value = val.slice(0, 3);
}

function validateInputs() {
  var allFilled = el.inpShang.value.trim() !== '' &&
                  el.inpXia.value.trim() !== '' &&
                  el.inpDong.value.trim() !== '';
  el.btnStart.disabled = !allFilled || state.inProgress;
}

function updateInputStyles() {
  [el.inpShang, el.inpXia, el.inpDong].forEach(function(inp) {
    if (inp.value.trim()) {
      inp.classList.add('filled');
    } else {
      inp.classList.remove('filled');
    }
  });
}