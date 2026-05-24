function getGuaName(shang, xia) {
  return GUA_NAMES[String(xia) + String(shang)] || TRIGRAMS[shang].name + TRIGRAMS[xia].name;
}

function yaoName(pos, isYang) {
  return YAO_POS_NAMES[pos] + (isYang ? '九' : '六');
}

function calcGua(n1, n2, n3) {
  var shangGua = n1 % 8 === 0 ? 8 : n1 % 8;
  var xiaGua = n2 % 8 === 0 ? 8 : n2 % 8;
  var dongYao = n3 % 6 === 0 ? 6 : n3 % 6;

  var ya = GUA_YAO[xiaGua].concat(GUA_YAO[shangGua]);

  var hxNum = (ya[3] << 2) | (ya[2] << 1) | ya[1];
  var hsNum = (ya[4] << 2) | (ya[3] << 1) | ya[2];
  var hu = getGuaName(YAO_TO_GUA_NUM[hsNum], YAO_TO_GUA_NUM[hxNum]);

  var nya = ya.slice();
  nya[dongYao - 1] = 1 - nya[dongYao - 1];
  var bsNum = (nya[5] << 2) | (nya[4] << 1) | nya[3];
  var bxNum = (nya[2] << 2) | (nya[1] << 1) | nya[0];
  var bian = getGuaName(YAO_TO_GUA_NUM[bsNum], YAO_TO_GUA_NUM[bxNum]);

  var fu = getGuaName(xiaGua, shangGua);

  var tiNum = dongYao <= 3 ? shangGua : xiaGua;
  var yongNum = dongYao <= 3 ? xiaGua : shangGua;
  var tiyongKey = String(tiNum) + String(yongNum);

  return {
    ben: getGuaName(shangGua, xiaGua),
    hu: hu, bian: bian, fu: fu,
    shangGua: shangGua, xiaGua: xiaGua, dongYao: dongYao,
    tiNum: tiNum, yongNum: yongNum,
    ti: TRIGRAMS[tiNum].name, yong: TRIGRAMS[yongNum].name,
    tiyong: TIYONG_RELATIONS[tiyongKey] || TRIGRAMS[tiNum].name + '\u2192' + TRIGRAMS[yongNum].name,
    huShangNum: YAO_TO_GUA_NUM[hsNum], huXiaNum: YAO_TO_GUA_NUM[hxNum],
    bianShangNum: YAO_TO_GUA_NUM[bsNum], bianXiaNum: YAO_TO_GUA_NUM[bxNum]
  };
}