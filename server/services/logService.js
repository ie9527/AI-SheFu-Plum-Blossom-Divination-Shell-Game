const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, '射覆日志.md');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getNextJuNumber() {
  ensureLogDir();
  if (!fs.existsSync(LOG_FILE)) {
    return 1;
  }
  const content = fs.readFileSync(LOG_FILE, 'utf-8');
  const matches = content.match(/## 局号 (\d+)/g);
  if (!matches || matches.length === 0) return 1;
  const lastMatch = matches[matches.length - 1];
  const lastNum = parseInt(lastMatch.match(/\d+/)[0]);
  return lastNum + 1;
}

function formatGuaSummary(gua) {
  return `${gua.ben}/${gua.hu}/${gua.bian}/${gua.fu}，体${gua.ti}用${gua.yong}，${gua.tiyong}`;
}

function formatReasoning(reasoning) {
  if (!reasoning || !Array.isArray(reasoning)) return '';
  return reasoning.map(r => `  - **${r.step}**：${r.content}`).join('\n');
}

function formatReasoningPath(rp) {
  if (!rp || typeof rp !== 'object') return '';
  const parts = [];
  if (rp.system1_intuition) parts.push(`  - **System 1 直觉**：${rp.system1_intuition}`);
  if (rp.key_insight) parts.push(`  - **关键洞察**：${rp.key_insight}`);
  if (rp.chosen_direction) parts.push(`  - **选择方向**：${rp.chosen_direction}`);
  if (rp.eliminated) parts.push(`  - **排除方向**：${rp.eliminated}`);
  if (rp.confidence_note) parts.push(`  - **把握评估**：${rp.confidence_note}`);
  return parts.join('\n');
}

function formatClues(clues) {
  if (!clues || !Array.isArray(clues)) return '';
  const DIM_NAMES = {
    'modern': '文明', 'edible': '食用', 'wrapping': '包裹', 'liquid': '液体',
    'movement': '运动', 'weight_size': '大小', 'hardness': '软硬'
  };
  return clues.map(c => {
    let resultStr;
    if (Array.isArray(c.result)) {
      resultStr = c.result.map(r => {
        const confTag = r.confidence === 'high' ? '◆' : (r.confidence === 'medium' ? '◇' : '◦');
        return confTag + r.value + (r.source ? `（${r.source}）` : '');
      }).join(' / ');
    } else {
      resultStr = c.result;
    }
    return `  - **${DIM_NAMES[c.dimension] || c.dimension}**：${resultStr}`;
  }).join('\n');
}

function formatCounterfactual(cf) {
  if (!cf || typeof cf !== 'object') return '';
  const parts = [];
  if (cf.most_likely_error) parts.push(`  - **最可能错误原因**：${cf.most_likely_error}`);
  if (cf.over_interpreted) parts.push(`  - **过度解读的象**：${cf.over_interpreted}`);
  if (cf.neglected) parts.push(`  - **被忽视的象**：${cf.neglected}`);
  return parts.join('\n');
}

function formatMetaCheck(mc) {
  if (!mc || typeof mc !== 'object') return '';
  const parts = [];
  if (mc.confidence) parts.push(`  - **客观置信度**：${mc.confidence}`);
  if (mc.confidence_reason) parts.push(`  - **理由**：${mc.confidence_reason}`);
  if (mc.passed_checks) parts.push(`  - **通过自检**：${mc.passed_checks.join(', ')}`);
  if (mc.failed_checks && mc.failed_checks.length > 0) parts.push(`  - **未通过自检**：${mc.failed_checks.join(', ')}`);
  return parts.join('\n');
}

function writeLog(record) {
  ensureLogDir();
  const juNumber = getNextJuNumber();

  let methodStr;
  if (record.method === 'time') {
    methodStr = '时间起卦（' + record.numbers.num1 + ':' + String(record.numbers.num2).padStart(2, '0') + ':' + String(record.numbers.num3).padStart(2, '0') + '）';
  } else if (record.method === 'random') {
    methodStr = '随机起卦（输入：' + record.rawInput + '）';
  } else {
    methodStr = '数字起卦（输入：' + record.rawInput + '）';
  }

  const reasoningText = formatReasoning(record.reasoning);
  const cluesText = formatClues(record.clues);
  const reasoningPathText = formatReasoningPath(record.reasoningPath);
  const counterfactualText = formatCounterfactual(record.counterfactual);
  const metaCheckText = formatMetaCheck(record.metaCheck);

  const parts = [
    '',
    `## 局号 ${juNumber}`,
    '',
    `- **时间**：${record.timestamp}`,
    `- **起卦方式**：${methodStr}`,
    `- **卦象**：${formatGuaSummary(record.gua)}`,
    '',
    `### AI推理过程`,
    reasoningText || '  （无推理数据）',
    '',
    cluesText ? `### 多维线索\n${cluesText}\n` : '',
    `### AI猜测`,
    `**${record.aiGuess}**`,
    '',
    `### 卦象对应`,
    record.correspondence || '',
    '',
    reasoningPathText ? `### 思路展示（十步侦探法）\n${reasoningPathText}\n` : '',
    counterfactualText ? `### 反事实自检\n${counterfactualText}\n` : '',
    metaCheckText ? `### 元认知自检\n${metaCheckText}\n` : '',
    `### 结果`,
    `- **真实谜底**：${record.realAnswer}`,
    `- **判定**：${record.match ? '✓ 命中' : '✗ 偏差'}`,
    record.error ? `- **错误**：${record.error}` : ''
  ].filter(Boolean).join('\n') + '\n';

  if (record.rawJson) {
    const jsonBlock = '\n### AI原始JSON输出\n```json\n' + JSON.stringify(JSON.parse(record.rawJson), null, 2) + '\n```\n';
    fs.appendFileSync(LOG_FILE, parts + jsonBlock, 'utf-8');
  } else {
    fs.appendFileSync(LOG_FILE, parts, 'utf-8');
  }

  return juNumber;
}

function readLogs(maxEntries) {
  ensureLogDir();
  if (!fs.existsSync(LOG_FILE)) return [];

  const content = fs.readFileSync(LOG_FILE, 'utf-8');
  const entries = content.split(/\n(?=## 局号 \d+)/).filter(e => e.trim());

  const parsed = entries.map(entry => {
    const result = {};
    const lines = entry.split('\n');

    let currentSection = '';
    for (const line of lines) {
      const sectionMatch = line.match(/^### (.+)$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        continue;
      }
      if (currentSection === 'AI猜测') {
        const boldMatch = line.match(/\*\*(.+)\*\*/);
        if (boldMatch) result['AI猜测'] = boldMatch[1];
      }
      if (currentSection === '结果') {
        const match = line.match(/\*\*(.*?)\*\*[：:]\s*(.*)/);
        if (match) result[match[1]] = match[2];
      }
      const match = line.match(/^\s*\*\*(.*?)\*\*[：:]\s*(.*)/);
      if (match) result[match[1]] = match[2];
    }
    const juMatch = entry.match(/## 局号 (\d+)/);
    if (juMatch) result.juNumber = parseInt(juMatch[1]);
    return result;
  });

  return maxEntries ? parsed.slice(-maxEntries) : parsed;
}

module.exports = { writeLog, readLogs, getNextJuNumber };