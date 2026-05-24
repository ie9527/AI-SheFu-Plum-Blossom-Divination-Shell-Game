function sendLog(realAnswer, isHit, errorMsg) {
  var logData = {
    timestamp: state.timestamp || new Date().toLocaleString(),
    method: state.method || 'number',
    rawInput: state.rawInput || '',
    numbers: state.numbers || { num1: 0, num2: 0, num3: 0 },
    gua: state.gua ? {
      ben: state.gua.ben, hu: state.gua.hu, bian: state.gua.bian, fu: state.gua.fu,
      ti: state.gua.ti, yong: state.gua.yong, tiyong: state.gua.tiyong
    } : null,
    aiGuess: el.guessText.textContent || '\u672A\u77E5',
    realAnswer: realAnswer,
    match: isHit,
    correspondence: el.guessCorr.textContent || '',
    reasoning: state.aiData ? state.aiData.reasoning : null,
    clues: state.aiData ? state.aiData.clues : null,
    reasoningPath: state.aiData ? state.aiData.reasoning_path : null,
    counterfactual: state.aiData ? state.aiData.counterfactual : null,
    metaCheck: state.aiData ? state.aiData.meta_check : null,
    rawJson: state.aiData ? JSON.stringify(state.aiData) : null
  };

  if (errorMsg) {
    logData.error = errorMsg;
  }

  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData)
  }).catch(function(e) {
    console.error('\u65E5\u5FD7\u5199\u5165\u5931\u8D25:', e);
  });
}

function saveToCookie(isHit) {
  var record = {
    id: Date.now(),
    timestamp: state.timestamp,
    numbers: state.numbers,
    gua: state.gua,
    aiGuess: el.guessText.textContent,
    realAnswer: el.realAnswer.value || '\u672A\u586B\u5199',
    match: isHit
  };
  setCookie('mhys_session', JSON.stringify(record), 365);
  renderHistory();
}

function recordGame(isHit) {
  var realAnswer = el.realAnswer.value || '\u672A\u586B\u5199';
  saveToCookie(isHit);
  sendLog(realAnswer, isHit);

  el.revealResult.innerHTML = isHit
    ? '<span style="color:var(--success)">\u2713 \u547D\u4E2D\uFF01AI\u731C\u5BF9\u4E86\u300C' + realAnswer + '\u300D</span><span class="log-note">\u5DF2\u8BB0\u5F55\u81F3\u65E5\u5FD7</span>'
    : '<span style="color:var(--vermillion)">\u2717 \u504F\u5DEE\uFF01\u7B54\u6848\u662F\u300C' + realAnswer + '\u300D</span><span class="log-note">\u5DF2\u8BB0\u5F55\u81F3\u65E5\u5FD7</span>';

  el.btnHit.disabled = true;
  el.btnMiss.disabled = true;
  setTimeout(function() { el.stage.history.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
}

el.btnHit.addEventListener('click', function() { if (el.realAnswer.value.trim()) recordGame(true); });
el.btnMiss.addEventListener('click', function() { recordGame(false); });
el.realAnswer.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && el.realAnswer.value.trim() && !el.btnHit.disabled) recordGame(true);
});

function renderHistory() {
  var cookieData = getCookie('mhys_session');
  if (!cookieData) {
    el.historyList.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:12px;padding:16px 0;">\u6682\u65E0\u5BF9\u5C40\u8BB0\u5F55</div>';
    return;
  }

  try {
    var record = JSON.parse(cookieData);
    el.historyList.innerHTML = '';
    var d = document.createElement('div');
    d.className = 'history-item';
    d.innerHTML =
      '<span class="h-nums">' + record.numbers.num1 + '\u00B7' + record.numbers.num2 + '\u00B7' + record.numbers.num3 + '</span>' +
      '<span class="h-guess">' + record.aiGuess + '</span>' +
      '<span class="h-result ' + (record.match ? 'hit' : 'miss') + '">' + (record.match ? '\u2713' : '\u2717') + '</span>';
    el.historyList.appendChild(d);
  } catch(e) {
    el.historyList.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:12px;padding:16px 0;">\u8BB0\u5F55\u8BFB\u53D6\u5931\u8D25</div>';
  }
}

renderHistory();
showCard(el.stage.history);