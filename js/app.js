function startGameFromInput() {
  if (state.inProgress) return;
  var n1 = parseInt(el.inpShang.value) || 0;
  var n2 = parseInt(el.inpXia.value) || 0;
  var n3 = parseInt(el.inpDong.value) || 0;
  if (el.inpShang.value.trim() === '' || el.inpXia.value.trim() === '' || el.inpDong.value.trim() === '') {
    [el.inpShang, el.inpXia, el.inpDong].forEach(function(inp) {
      if (!inp.value.trim()) {
        inp.classList.add('error');
        setTimeout(function() { inp.classList.remove('error'); }, 600);
      }
    });
    return;
  }

  var rawInput = n1 + '-' + n2 + '-' + n3;
  startGuaOnly(n1, n2, n3, 'number', rawInput);
}

function startGuaOnly(n1, n2, n3, rawInput) {
  state.inProgress = true;
  state.numbers = { num1: n1, num2: n2, num3: n3 };

  showGuaStage(n1, n2, n3, 'number', rawInput);

  $('aiInferBtnRow').style.display = 'flex';
  scrollToCard(el.stage.gua);

  hideAIStages();

  state.inProgress = false;
  validateInputs();
}

async function startAIInference() {
  if (state.inProgress || !state.gua) return;
  state.inProgress = true;

  $('aiInferBtnRow').style.display = 'none';

  showCard(el.stage.reason);
  el.stage.reason.style.display = '';
  scrollToCard(el.stage.reason);
  setPhase('reason');

  el.loadingArea.style.display = 'block';
  el.reasoningSteps.innerHTML = '';
  el.errorBox.style.display = 'none';
  el.toggleJson.style.display = 'none';
  el.jsonRaw.classList.remove('show');
  el.jsonRaw.textContent = '';

  try {
    var n1 = state.numbers.num1, n2 = state.numbers.num2, n3 = state.numbers.num3;
    var response = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num1: n1, num2: n2, num3: n3 })
    });

    if (!response.ok) {
      var errData;
      try { errData = await response.json(); } catch(e) { errData = {}; }
      throw new Error(errData.error || '服务器返回错误 (' + response.status + ')');
    }

    var jsonData = await response.json();
    state.aiData = jsonData;

    el.loadingArea.style.display = 'none';
    el.toggleJson.style.display = 'block';
    el.jsonRaw.textContent = JSON.stringify(jsonData, null, 2);

    for (var i = 0; i < jsonData.reasoning.length; i++) {
      var step = document.createElement('div');
      step.className = 'reason-step';
      step.innerHTML = '<div class="step-label">\u25C6 ' + jsonData.reasoning[i].step + '</div><div class="step-content typewriter" id="typeStep' + i + '"><span class="cursor"></span></div>';
      el.reasoningSteps.appendChild(step);
      await sleep(80);
      step.classList.add('visible');
      var contentEl = step.querySelector('.typewriter');
      contentEl.innerHTML = '';
      for (var j = 0; j < jsonData.reasoning[i].content.length; j++) {
        contentEl.textContent += jsonData.reasoning[i].content[j];
        await sleep(20);
      }
      await sleep(300);
    }

    await sleep(500);

    if (jsonData.clues && jsonData.clues.length > 0) {
      showCard(el.stage.clues);
      el.stage.clues.style.display = '';
      scrollToCard(el.stage.clues);
      setPhase('clues');
      el.clueBoard.innerHTML = '';

      var dimensionNames = {
        'shape': '\u5F62\u72B6', 'color': '\u989C\u8272', 'material': '\u6750\u8D28', 'function': '\u529F\u80FD',
        'hand_related': '\u624B\u6301', 'opening': '\u5F00\u53E3', 'hollow': '\u4E2D\u7A7A', 'sound': '\u53D1\u58F0',
        'modern': '\u6587\u660E', 'edible': '\u98DF\u7528', 'wrapping': '\u5305\u88F9', 'liquid': '\u6DB2\u4F53',
        'movement': '\u8FD0\u52A8', 'weight_size': '\u5927\u5C0F', 'hardness': '\u8F6F\u786C'
      };

      for (var ci = 0; ci < jsonData.clues.length; ci++) {
        var clue = jsonData.clues[ci];
        var tag = document.createElement('div');
        var dimClass = 'dim-' + clue.dimension;

        var resultText = '';
        var isExcluded = false;
        if (Array.isArray(clue.result)) {
          var parts = [];
          for (var ri = 0; ri < clue.result.length; ri++) {
            var r = clue.result[ri];
            var confStr = r.confidence === 'high' ? '\u25C6' : (r.confidence === 'medium' ? '\u25C7' : '\u25E6');
            parts.push(confStr + r.value + (r.source ? '\uFF08' + r.source + '\uFF09' : ''));
          }
          resultText = parts.join(' / ');
          var lowOnly = clue.result.every(function(r) { return r.confidence === 'low'; });
          isExcluded = lowOnly;
        } else {
          resultText = clue.result;
          isExcluded = clue.result.indexOf('\u6392\u9664') >= 0 || clue.result.indexOf('\u4E0D\u662F') >= 0 || clue.result.indexOf('\u5426') === 0;
        }
        tag.className = 'clue-tag ' + dimClass + (isExcluded ? ' excluded' : '');
        tag.innerHTML = '<span class="clue-dim">' + (dimensionNames[clue.dimension] || clue.dimension) + '</span><span class="clue-result">' + resultText + '</span>';
        el.clueBoard.appendChild(tag);
        await sleep(100);
        tag.classList.add('visible');
      }
      await sleep(800);
    }

    await sleep(500);

    showCard(el.stage.guess);
    el.stage.guess.style.display = '';
    scrollToCard(el.stage.guess);
    setPhase('guess');

    el.guessText.textContent = '';
    el.guessCorr.textContent = '';
    for (var k = 0; k < jsonData.guess.length; k++) {
      el.guessText.textContent += jsonData.guess[k];
      await sleep(30);
    }
    await sleep(200);
    for (var l = 0; l < jsonData.correspondence.length; l++) {
      el.guessCorr.textContent += jsonData.correspondence[l];
      await sleep(12);
    }

    await sleep(600);

    showCard(el.stage.reveal);
    el.stage.reveal.style.display = '';
    scrollToCard(el.stage.reveal);
    setPhase('reveal');

    await sleep(300);

    if (jsonData.reasoning_path) {
      showCard(el.stage.reasoningPath);
      el.stage.reasoningPath.style.display = '';
      scrollToCard(el.stage.reasoningPath);
      setPhase('path');
      var rp = jsonData.reasoning_path;
      var rpHTML = '';
      if (rp.system1_intuition) rpHTML += '<div class="rp-row"><span class="rp-label">\u76F4\u89C9\u951A\u70B9</span><span class="rp-content" style="color:var(--blue-accent)">' + rp.system1_intuition + '</span></div>';
      if (rp.key_insight) rpHTML += '<div class="rp-divider"></div><div class="rp-row"><span class="rp-label">\u5173\u952E\u6D1E\u5BDF</span><span class="rp-content">' + rp.key_insight + '</span></div>';
      if (rp.chosen_direction) rpHTML += '<div class="rp-divider"></div><div class="rp-row"><span class="rp-label">\u9009\u62E9\u65B9\u5411</span><span class="rp-content">' + rp.chosen_direction + '</span></div>';
      if (rp.eliminated) rpHTML += '<div class="rp-divider"></div><div class="rp-row"><span class="rp-label">\u6392\u9664\u65B9\u5411</span><span class="rp-content elim">' + rp.eliminated + '</span></div>';
      if (rp.confidence_note) rpHTML += '<div class="rp-divider"></div><div class="rp-row"><span class="rp-label">\u628A\u63E1\u8BC4\u4F30</span><span class="rp-content">' + rp.confidence_note + '</span></div>';
      if (jsonData.counterfactual && jsonData.counterfactual.most_likely_error) {
        rpHTML += '<div class="rp-divider"></div><div class="rp-row"><span class="rp-label">\u5982\u679C\u731C\u9519</span><span class="rp-content" style="color:var(--vermillion);opacity:0.8;">' + jsonData.counterfactual.most_likely_error + '</span></div>';
      }
      if (jsonData.meta_check && jsonData.meta_check.confidence) {
        var confEmoji = jsonData.meta_check.confidence === 'high' ? '\u25C6' : (jsonData.meta_check.confidence === 'medium' ? '\u25C7' : '\u25E6');
        rpHTML += '<div class="rp-divider"></div><div class="rp-row"><span class="rp-label">\u7F6E\u4FE1\u5EA6</span><span class="rp-content">' + confEmoji + ' ' + jsonData.meta_check.confidence + (jsonData.meta_check.confidence_reason ? ' \u2014 ' + jsonData.meta_check.confidence_reason : '') + '</span></div>';
      }
      var rpEl = document.getElementById('reasoningPathContent');
      rpEl.innerHTML = rpHTML;
      var rows = rpEl.querySelectorAll('.rp-row');
      for (var ri = 0; ri < rows.length; ri++) {
        await sleep(150);
        rows[ri].classList.add('visible');
      }
    }

    el.realAnswer.value = '';
    el.btnHit.disabled = false;
    el.btnMiss.disabled = false;
    el.revealResult.textContent = '';

  } catch (err) {
    el.loadingArea.style.display = 'none';
    el.errorBox.style.display = 'block';
    el.errorBox.textContent = '\u51FA\u9519\uFF1A' + (err.message || '\u672A\u77E5\u9519\u8BEF');
    console.error('\u5C04\u8986\u8BF7\u6C42\u5931\u8D25:', err);

    el.guessText.textContent = '\u8C03\u7528\u5931\u8D25';
    el.guessCorr.textContent = '';

    sendLog('AI\u9519\u8BEF', false, err.message || '');
  }

  state.inProgress = false;
  el.btnStart.disabled = false;
  validateInputs();
}

[el.inpShang, el.inpXia, el.inpDong].forEach(function(inp) {
  inp.addEventListener('input', function() {
    filterNumeric(inp);
    updateInputStyles();
    validateInputs();
  });

  inp.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!el.btnStart.disabled && !state.inProgress) {
        startGameFromInput();
      } else {
        var inputs = [el.inpShang, el.inpXia, el.inpDong];
        var idx = inputs.indexOf(inp);
        if (idx < 2) inputs[idx + 1].focus();
      }
    }
  });

  inp.addEventListener('paste', function(e) {
    e.preventDefault();
    var pasted = (e.clipboardData || window.clipboardData).getData('text');
    var cleaned = pasted.replace(/[^0-9]/g, '').slice(0, 3);
    inp.value = cleaned;
    updateInputStyles();
    validateInputs();
  });
});

el.btnRandom.addEventListener('click', function() {
  if (state.inProgress) return;
  el.inpShang.value = String(Math.floor(Math.random() * 1000));
  el.inpXia.value = String(Math.floor(Math.random() * 1000));
  el.inpDong.value = String(Math.floor(Math.random() * 1000));
  updateInputStyles();
  validateInputs();
});

el.btnTime.addEventListener('click', function() {
  if (state.inProgress) return;
  var now = new Date();
  el.inpShang.value = String(now.getHours());
  el.inpXia.value = String(now.getMinutes());
  el.inpDong.value = String(now.getSeconds());
  updateInputStyles();
  validateInputs();
});

el.btnStart.addEventListener('click', startGameFromInput);

$('btnAIInfer').addEventListener('click', startAIInference);

var jsonVisible = false;
el.toggleJson.addEventListener('click', function() {
  jsonVisible = !jsonVisible;
  el.jsonRaw.classList.toggle('show', jsonVisible);
  el.toggleJson.textContent = jsonVisible ? '[ \u9690\u85CF\u539F\u59CBJSON ]' : '[ \u67E5\u770B\u539F\u59CBJSON ]';
});