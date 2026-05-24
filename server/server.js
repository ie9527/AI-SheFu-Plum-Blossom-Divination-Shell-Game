require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
const { calcGua } = require('./services/meihuaService');
const { guess } = require('./services/aiService');
const { writeLog, readLogs } = require('./services/logService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/MHYS', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'info.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = readLogs(limit);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/guess', async (req, res) => {
  try {
    const { num1, num2, num3 } = req.body;

    if (num1 == null || num2 == null || num3 == null) {
      return res.status(400).json({ error: '缺少数字参数，需要 num1, num2, num3' });
    }

    const n1 = parseInt(num1), n2 = parseInt(num2), n3 = parseInt(num3);
    if (isNaN(n1) || isNaN(n2) || isNaN(n3) || n1 < 0 || n2 < 0 || n3 < 0) {
      return res.status(400).json({ error: '数字参数必须为非负整数' });
    }

    const gua = calcGua(n1, n2, n3);

    const result = await guess({ num1: n1, num2: n2, num3: n3 }, gua);

    res.json(result);
  } catch (err) {
    console.error('[射覆错误]', err.message);
    res.status(500).json({ error: err.message || '服务器内部错误，请稍后重试' });
  }
});

app.post('/api/log', async (req, res) => {
  try {
    const { timestamp, method, rawInput, numbers, gua, aiGuess, realAnswer, match, correspondence, reasoning, clues, rawJson, reasoningPath, counterfactual, metaCheck, error } = req.body;

    if (!numbers || !gua || !aiGuess) {
      return res.status(400).json({ error: '缺少必要日志字段' });
    }

    const juNumber = writeLog({
      timestamp: timestamp || new Date().toLocaleString(),
      method: method || 'number',
      rawInput: rawInput || '',
      numbers,
      gua,
      aiGuess,
      realAnswer: realAnswer || '未填写',
      match: match || false,
      correspondence: correspondence || '',
      reasoning: reasoning || null,
      clues: clues || null,
      rawJson: rawJson || null,
      reasoningPath: reasoningPath || null,
      counterfactual: counterfactual || null,
      metaCheck: metaCheck || null,
      error: error || null
    });

    res.json({ success: true, juNumber });
  } catch (err) {
    console.error('[日志错误]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  ◆ 射覆服务已启动`);
  console.log(`  ◆ 游戏入口: http://127.0.0.1:${PORT}/`);
  console.log(`  ◆ 日志页面: http://127.0.0.1:${PORT}/MHYS`);
  console.log(`  ◆ 健康检查: http://127.0.0.1:${PORT}/api/health\n`);
});