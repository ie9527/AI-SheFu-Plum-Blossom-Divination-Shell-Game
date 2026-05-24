var el = {
  stage: {
    input: $('stageInput'), gua: $('stageGua'), reason: $('stageReason'),
    clues: $('stageClues'), guess: $('stageGuess'), reveal: $('stageReveal'),
    reasoningPath: $('stageReasoningPath'), history: $('stageHistory')
  },
  inpShang: $('inpShang'), inpXia: $('inpXia'), inpDong: $('inpDong'),
  btnRandom: $('btnRandom'), btnTime: $('btnTime'), btnStart: $('btnStart'),
  methodTag: $('methodTag'),
  numsDisplay: $('numsDisplay'), guaGrid: $('guaGrid'),
  tiSymbol: $('tiSymbol'), tiName: $('tiName'),
  yongSymbol: $('yongSymbol'), yongName: $('yongName'), tiyongRelation: $('tiyongRelation'),
  guaBreakdown: $('guaBreakdown'),
  reasoningSteps: $('reasoningSteps'), loadingArea: $('loadingArea'),
  jsonRaw: $('jsonRaw'), toggleJson: $('toggleJson'), errorBox: $('errorBox'),
  clueBoard: $('clueBoard'), clueLoading: $('clueLoading'),
  guessText: $('guessText'), guessCorr: $('guessCorr'),
  realAnswer: $('realAnswer'), btnHit: $('btnHit'), btnMiss: $('btnMiss'), revealResult: $('revealResult'),
  historyList: $('historyList'),
  phaseDots: document.querySelectorAll('.phase-dot')
};

function setPhase(phase) {
  var order = ['input','gua','reason','clues','guess','path','reveal'];
  el.phaseDots.forEach(function(d) {
    var p = d.dataset.phase;
    d.classList.toggle('active', p === phase);
    d.classList.toggle('done', order.indexOf(p) < order.indexOf(phase));
  });
}

function showCard(card) { card.classList.add('visible'); }

function scrollToCard(card) {
  setTimeout(function() { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
}

function hideAIStages() {
  el.stage.reason.style.display = 'none';
  el.stage.clues.style.display = 'none';
  el.stage.guess.style.display = 'none';
  el.stage.reveal.style.display = 'none';
  el.stage.reasoningPath.style.display = 'none';
  el.loadingArea.style.display = 'block';
  el.reasoningSteps.innerHTML = '';
  el.errorBox.style.display = 'none';
  el.toggleJson.style.display = 'none';
  el.jsonRaw.classList.remove('show');
  el.jsonRaw.textContent = '';
  el.clueBoard.innerHTML = '';
  el.guessText.textContent = '\u22EF';
  el.guessCorr.textContent = '';
  el.revealResult.textContent = '';
  el.realAnswer.value = '';
}

function showGuaStage(n1, n2, n3, method, rawInput) {
  var gua = calcGua(n1, n2, n3);
  state.gua = gua;
  state.method = method;
  state.rawInput = rawInput;
  state.timestamp = new Date().toLocaleString();

  showCard(el.stage.gua);
  scrollToCard(el.stage.gua);
  setPhase('gua');

  if (method === 'time') {
    el.methodTag.style.display = 'inline-block';
    el.methodTag.textContent = '\u23F1 ' + rawInput;
  } else {
    el.methodTag.style.display = 'inline-block';
    el.methodTag.textContent = '\uD83D\uDD22 ' + rawInput;
  }

  el.numsDisplay.innerHTML =
    '<div class="num-box"><div class="num">' + n1 + '</div><div class="label">上卦数</div><div class="arrow-label">\u00F78\u2192' + gua.shangGua + '\uFF08' + TRIGRAMS[gua.shangGua].name + '\uFF09</div></div>' +
    '<div class="num-box"><div class="num">' + n2 + '</div><div class="label">下卦数</div><div class="arrow-label">\u00F78\u2192' + gua.xiaGua + '\uFF08' + TRIGRAMS[gua.xiaGua].name + '\uFF09</div></div>' +
    '<div class="num-box"><div class="num">' + n3 + '</div><div class="label">动爻数</div><div class="arrow-label">\u00F76\u2192' + gua.dongYao + '爻动</div></div>';

  el.guaGrid.innerHTML = '';
  var items = [
    { label: '本卦', name: gua.ben, symUpper: TRIGRAMS[gua.shangGua].symbol, symLower: TRIGRAMS[gua.xiaGua].symbol },
    { label: '互卦', name: gua.hu, symUpper: TRIGRAMS[gua.huShangNum].symbol, symLower: TRIGRAMS[gua.huXiaNum].symbol },
    { label: '变卦', name: gua.bian, symUpper: TRIGRAMS[gua.bianShangNum].symbol, symLower: TRIGRAMS[gua.bianXiaNum].symbol },
    { label: '覆卦', name: gua.fu, symUpper: TRIGRAMS[gua.xiaGua].symbol, symLower: TRIGRAMS[gua.shangGua].symbol }
  ];
  items.forEach(function(item, i) {
    var d = document.createElement('div');
    d.className = 'gua-item';
    d.innerHTML = '<div class="symbol-stack"><span>' + item.symUpper + '</span><span>' + item.symLower + '</span></div><div class="gua-name">' + item.name + '</div><div class="gua-detail">' + item.label + '</div>';
    el.guaGrid.appendChild(d);
    setTimeout(function() { d.classList.add('visible'); }, 150 + i * 120);
  });

  el.tiSymbol.textContent = TRIGRAMS[gua.tiNum].symbol;
  el.tiName.textContent = TRIGRAMS[gua.tiNum].name;
  el.yongSymbol.textContent = TRIGRAMS[gua.yongNum].symbol;
  el.yongName.textContent = TRIGRAMS[gua.yongNum].name;
  el.tiyongRelation.textContent = gua.tiyong;

  var ya = GUA_YAO[gua.xiaGua].concat(GUA_YAO[gua.shangGua]);
  var nya = ya.slice();
  nya[gua.dongYao - 1] = 1 - nya[gua.dongYao - 1];

  var yaoTags = [];
  for (var yi = 0; yi < 6; yi++) {
    var cls = ya[yi] ? 'yang' : 'yin';
    yaoTags.push('<span class="br-yao ' + cls + '">' + yaoName(yi, ya[yi]) + '</span>');
  }

  var hxYao = '<span class="br-yao ' + (ya[1]?'yang':'yin') + '">' + yaoName(1, ya[1]) + '</span> '
    + '<span class="br-yao ' + (ya[2]?'yang':'yin') + '">' + yaoName(2, ya[2]) + '</span> '
    + '<span class="br-yao ' + (ya[3]?'yang':'yin') + '">' + yaoName(3, ya[3]) + '</span>';

  var hsYao = '<span class="br-yao ' + (ya[2]?'yang':'yin') + '">' + yaoName(2, ya[2]) + '</span> '
    + '<span class="br-yao ' + (ya[3]?'yang':'yin') + '">' + yaoName(3, ya[3]) + '</span> '
    + '<span class="br-yao ' + (ya[4]?'yang':'yin') + '">' + yaoName(4, ya[4]) + '</span>';

  var bianTags = [];
  for (var bi = 0; bi < 6; bi++) {
    var bcls = 'yin';
    if (bi === gua.dongYao - 1) bcls = 'flipped';
    else if (nya[bi]) bcls = 'yang';
    bianTags.push('<span class="br-yao ' + bcls + '">' + yaoName(bi, nya[bi]) + '</span>');
  }

  var dongLineStr = yaoName(gua.dongYao - 1, ya[gua.dongYao - 1]) + (ya[gua.dongYao - 1] ? '阳' : '阴')
    + ' <span class="br-arrow">\u2192</span> ' + yaoName(gua.dongYao - 1, nya[gua.dongYao - 1]) + (nya[gua.dongYao - 1] ? '阳' : '阴');

  el.guaBreakdown.innerHTML =
    '<div class="breakdown-title">\uD83D\uDCD0 卦 象 推 演</div>'
    + '<div class="breakdown-row"><span class="br-label">本卦构成</span><span class="br-content">'
    + '上卦 ' + n1 + '\u00F78=余' + gua.shangGua + '\uFF08' + TRIGRAMS[gua.shangGua].name + TRIGRAMS[gua.shangGua].symbol + '\uFF09'
    + ' \uFF0B 下卦 ' + n2 + '\u00F78=余' + gua.xiaGua + '\uFF08' + TRIGRAMS[gua.xiaGua].name + TRIGRAMS[gua.xiaGua].symbol + '\uFF09'
    + ' <span class="br-arrow">\u2192</span> <span class="br-result">' + gua.ben + '</span></span></div>'
    + '<div class="breakdown-row"><span class="br-label">六爻爻位</span><span class="br-content">' + yaoTags.join('') + '</span></div>'
    + '<div class="breakdown-divider"></div>'
    + '<div class="breakdown-row"><span class="br-label">互卦（取2-5爻）</span></div>'
    + '<div class="breakdown-row"><span class="br-label">下互（二三四爻）</span><span class="br-content">' + hxYao + ' <span class="br-arrow">=</span> ' + TRIGRAMS[gua.huXiaNum].name + TRIGRAMS[gua.huXiaNum].symbol + '</span></div>'
    + '<div class="breakdown-row"><span class="br-label">上互（三四五爻）</span><span class="br-content">' + hsYao + ' <span class="br-arrow">=</span> ' + TRIGRAMS[gua.huShangNum].name + TRIGRAMS[gua.huShangNum].symbol + '</span></div>'
    + '<div class="breakdown-row"><span class="br-label"></span><span class="br-content"><span class="br-arrow">\u2192</span> <span class="br-result">' + TRIGRAMS[gua.huShangNum].name + '上 ' + TRIGRAMS[gua.huXiaNum].name + '下 = ' + gua.hu + '</span></span></div>'
    + '<div class="breakdown-divider"></div>'
    + '<div class="breakdown-row"><span class="br-label">变卦（动第' + gua.dongYao + '爻）</span><span class="br-content">'
    + '动爻 ' + n3 + '\u00F76=余' + gua.dongYao + '\uFF1A' + dongLineStr + '</span></div>'
    + '<div class="breakdown-row"><span class="br-label">变后六爻</span><span class="br-content">' + bianTags.join('') + '</span></div>'
    + '<div class="breakdown-row"><span class="br-label">变后卦象</span><span class="br-content">'
    + '上卦 ' + TRIGRAMS[gua.bianShangNum].name + TRIGRAMS[gua.bianShangNum].symbol
    + ' \uFF0B 下卦 ' + TRIGRAMS[gua.bianXiaNum].name + TRIGRAMS[gua.bianXiaNum].symbol
    + ' <span class="br-arrow">\u2192</span> <span class="br-result">' + gua.bian + '</span></span></div>'
    + '<div class="breakdown-divider"></div>'
    + '<div class="breakdown-row"><span class="br-label">覆卦（上下互换）</span><span class="br-content">'
    + TRIGRAMS[gua.xiaGua].name + TRIGRAMS[gua.xiaGua].symbol + '上'
    + ' \uFF0B ' + TRIGRAMS[gua.shangGua].name + TRIGRAMS[gua.shangGua].symbol + '下'
    + ' <span class="br-arrow">\u2192</span> <span class="br-result">' + gua.fu + '</span></div>';
}