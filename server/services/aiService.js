const fs = require('fs');
const path = require('path');

function loadPromptConfig() {
  const promptPath = path.join(__dirname, '..', '..', 'prompt.json');
  return JSON.parse(fs.readFileSync(promptPath, 'utf-8'));
}

function buildSystemPrompt(config) {
  const {
    role, dual_process_thinking, working_memory, metacognitive_checklist,
    counterfactual_reasoning, common_mistakes, inference_dimensions, inference_framework,
    iron_rules, output_structure, wanwu_leixiang_shuogua, wanwu_leixiang_modern,
    gua64_insight, tiyong_relation_detailed, dongYao_position_detailed,
    hugua_internal_structure, fugua_orientation, gua_combination_quick_ref,
    item_category_reverse_index, confidence_calibration_rules
  } = config;

  const parts = [];

  parts.push(`【身份】${role.identity}，${role.expertise}。`);
  parts.push(`【原则】${role.principle}`);

  parts.push(`\n【双系统思维模式（强制启用）】`);
  parts.push(`System 1（直觉）：${dual_process_thinking.system_1_intuition.constraint}`);
  parts.push(`System 2（分析）：${dual_process_thinking.system_2_analytics.process}`);
  parts.push(dual_process_thinking.system_2_analytics.special_rule);

  parts.push(`\n【工作记忆槽位（防信息过载）】`);
  parts.push(`${working_memory.rule}`);
  parts.push(`槽位分配：slot_1=${working_memory.slot_allocation.slot_1}、slot_2=${working_memory.slot_allocation.slot_2}、slot_3=${working_memory.slot_allocation.slot_3}、slot_4=${working_memory.slot_allocation.slot_4}`);

  if (common_mistakes) {
    parts.push(`\n【高频误判预警（每局必检！推理开始前逐条过）】`);
    common_mistakes.mistakes.forEach(m => {
      parts.push(`⚠ ${m.gua}常见错误：${m.common_error} → 正确：${m.correct_approach}`);
    });
  }

  parts.push(`\n【核心方法论：${inference_dimensions.title}】`);
  parts.push(inference_dimensions.core_method);
  parts.push(inference_dimensions.notes);
  parts.push(`\n射覆15维线索扫描清单：`);
  inference_dimensions.dimensions.forEach(d => {
    parts.push(`  ◆ ${d.name}：${d.question}`);
  });
  parts.push(``);

  parts.push(`\n【万物类象·说卦传（古典）】`);
  for (const [name, data] of Object.entries(wanwu_leixiang_shuogua.eight_gua)) {
    parts.push(`${name}（${data.essence}）：${data.xiang}`);
  }

  parts.push(`\n【万物类象·现代物品映射（必须参考）】`);
  parts.push(wanwu_leixiang_modern.note);
  parts.push(wanwu_leixiang_modern.critical_rule);
  for (const [name, data] of Object.entries(wanwu_leixiang_modern.eight_gua_modern)) {
    parts.push(`${name}（${data.essence}）→ ${data.modern_xiang}`);
  }

  parts.push(`\n【体用生克→物品状态详细映射】`);
  for (const [key, val] of Object.entries(tiyong_relation_detailed)) {
    if (typeof val === 'object' && val.name) {
      parts.push(`${val.name}：${val.meaning}。模式：${val.patterns ? val.patterns.join('、') : ''}。提示：${val['射覆提示'] || ''}`);
    }
  }

  parts.push(`\n【动爻位置→物品部位特征详细映射】`);
  for (const [pos, info] of Object.entries(dongYao_position_detailed.positions)) {
    parts.push(`${pos}→${info.location}：${info.feature}`);
  }
  parts.push(dongYao_position_detailed.usage_rule);

  parts.push(`\n【互卦→内部结构类型映射】`);
  for (const [gua, info] of Object.entries(hugua_internal_structure.structures)) {
    parts.push(`${gua}：${info.structure}`);
  }
  parts.push(hugua_internal_structure.combination_rule);

  parts.push(`\n【覆卦→物品朝向解读】`);
  parts.push(fugua_orientation.principle);
  parts.push(fugua_orientation.usage_rule);

  parts.push(`\n【卦象组合速查表（启发参考）】`);
  parts.push(gua_combination_quick_ref.usage_rule);
  gua_combination_quick_ref.combinations.forEach(c => {
    parts.push(`${c.combo}（${c.meaning}）→ ${c.direction}`);
  });

  parts.push(`\n【物品大类反向验证索引】`);
  parts.push(item_category_reverse_index.usage_rule);
  for (const [cat, info] of Object.entries(item_category_reverse_index.categories)) {
    parts.push(`${cat}：需要${info.required.join('+')}。${info.note}`);
  }

  parts.push(`\n【置信度校准规则】`);
  confidence_calibration_rules.rules.forEach(r => {
    parts.push(`· ${r.condition} → confidence: ${r.confidence}（${r.reason}）`);
  });
  parts.push(confidence_calibration_rules.output_rule);

  parts.push(`\n【推理框架：${inference_framework.name}】`);
  parts.push(inference_framework.core_principle);
  const tp = inference_framework.thinking_process;

  parts.push(`第零步「${tp.step_0_anchor.name}」：${tp.step_0_anchor.description}`);
  parts.push(`第一步「${tp.step_1_guanxiang.name}」：`);
  parts.push(`  防固化前置检查：`);
  tp.step_1_guanxiang.forced_checks_before_start.forEach(c => parts.push(`    · ${c}`));
  parts.push(`  全卦象形直觉：${tp.step_1_guanxiang.whole_gua_shape.description}`);
  parts.push(`  逐象过筛：${tp.step_1_guanxiang.description}`);
  parts.push(`第二步「${tp.step_2_wuxing.name}」：${tp.step_2_wuxing.description}`);
  parts.push(`第三步「${tp.step_3_changjing.name}」：${tp.step_3_changjing.description}`);
  parts.push(`  场景概率权重：高=${(tp.step_3_changjing.scene_probability.high||[]).join('、')}；中=${(tp.step_3_changjing.scene_probability.medium||[]).join('、')}；低=${(tp.step_3_changjing.scene_probability.low||[]).join('、')}`);
  parts.push(`  ${tp.step_3_changjing.scene_probability.rule}`);
  parts.push(`第四步「${tp.step_4_guaming.name}」：${tp.step_4_guaming.description}`);
  parts.push(`第五步「${tp.step_5_leixiang.name}」：${tp.step_5_leixiang.description}`);
  parts.push(`  组合推理规则：`);
  tp.step_5_leixiang.combination_reasoning.rules.forEach(r => parts.push(`    · ${r}`));
  parts.push(`  ${tp.step_5_leixiang.combination_reasoning.note}`);
  parts.push(`第六步「${tp.step_6_clues.name}」：${tp.step_6_clues.description}`);
  parts.push(`第七步「${tp.step_7_fangxiang.name}」：${tp.step_7_fangxiang.description}`);
  parts.push(`第八步「${tp.step_8_yanyan.name}」：${tp.step_8_yanyan.description}`);
  parts.push(`  三级权重否决：强象=${tp.step_8_yanyan.veto_weight_system.strong_evidence.join('+')}；中象=${tp.step_8_yanyan.veto_weight_system.medium_evidence.join('+')}；弱象=${tp.step_8_yanyan.veto_weight_system.weak_evidence.join('+')}`);
  parts.push(`  规则：${tp.step_8_yanyan.veto_weight_system.rule}`);
  parts.push(`第九步「${tp.step_9_meta_checks.name}」：${tp.step_9_meta_checks.description}`);
  parts.push(`第十步「${tp.step_10_waiying.name}」：${tp.step_10_waiying.description}`);

  parts.push(`\n【铁律】必守：`);
  iron_rules.forEach(r => {
    parts.push(`${r.id}. ${r.rule}`);
  });

  parts.push(`\n【元认知自检清单（推理结束前强制检查）】`);
  metacognitive_checklist.checks.forEach(c => {
    parts.push(`${c.id}. ${c.name}：${c.question}`);
  });

  parts.push(`\n【反事实自检】`);
  counterfactual_reasoning.questions.forEach(q => parts.push(`· ${q}`));

  parts.push(`\n【六十四卦要义参考】`);
  gua64_insight.key_guas.forEach(g => {
    if (Array.isArray(g.insights)) {
      parts.push(`${g.name}：${g.insights.join(' | ')}`);
    } else {
      parts.push(`${g.name}：${g.insight || g.insights}`);
    }
  });

  parts.push(`\n【输出格式 - 必须严格遵守】`);
  parts.push(output_structure.description);
  parts.push(`\n特别注意：`);
  parts.push(`- clues字段必须覆盖15个维度（形状/颜色/材质/功能/手持/开口/中空/发声/文明/食用/包裹/液体/运动/大小/软硬），每维度一条。`);
  parts.push(`- clues每条result为数组[{value, source, confidence}]格式，含value（解读）、source（卦象依据）、confidence（high/medium/low）。`);
  parts.push(`- reasoning不超过9条且每条不超150字，每条必须包含三段式：依据→推断→理由。`);
  parts.push(`- reasoning_path必须包含system1_intuition（System 1直觉）、key_insight、chosen_direction、eliminated、confidence_note。`);
  parts.push(`- counterfactual字段输出反事实自检结果。meta_check字段输出元认知自检+置信度。`);
  parts.push(`JSON Schema如下：`);
  parts.push(JSON.stringify(output_structure.json_schema, null, 2));
  parts.push(`\n【最后提醒——以上所有规则必须逐一执行，不可跳过任何步骤】`);
  parts.push(`1. 第零步卦名锚定必须先做！不锚定功能方向就发散联想=方向漂移`);
  parts.push(`2. 十步推理逐一执行，不可跳步`);
  parts.push(`3. 第一步防固化检查必须在思维起点就激活——坎水≠液体、离火≠电子、兑口≠口腔`);
  parts.push(`4. 第五步组合推理不可跳过——本卦+互卦、本卦+变卦、体卦+变卦、互卦+变卦各推一条`);
  parts.push(`5. 先发散（15维度各给2-3种带置信度的解读）再构建异质方向（3+方向，覆盖≥2大类）`);
  parts.push(`6. 第八步三级权重否决：强象不可否、中象需2条、弱象不可单独否`);
  parts.push(`7. 第九步元认知自检+反事实推理不可跳过`);
  parts.push(`8. 输出必须是纯JSON，必须包含reasoning_path、counterfactual、meta_check三个新字段`);

  return parts.join('\n');
}

function buildUserPrompt(numbers, gua) {
  return `【射覆请求】
请根据以下三组数字及其起卦结果进行射覆占断，推断所覆之物。

第一数：${numbers.num1} → 上卦（÷8余${numbers.num1 % 8 === 0 ? 8 : numbers.num1 % 8}）
第二数：${numbers.num2} → 下卦（÷8余${numbers.num2 % 8 === 0 ? 8 : numbers.num2 % 8}）
第三数：${numbers.num3} → 动爻（÷6余${numbers.num3 % 6 === 0 ? 6 : numbers.num3 % 6}）

【起卦结果】
本卦：${gua.ben}（${gua.shangGua}上${gua.xiaGua}下）
互卦：${gua.hu}
变卦：${gua.bian}
覆卦：${gua.fu}
体卦：${gua.ti}　用卦：${gua.yong}
体用关系：${gua.tiyong}
动爻：第${gua.dongYao}爻（动爻位置结合dongYao_position_detailed判断物品部位特征）
互卦揭示内部结构：结合hugua_internal_structure判断

请严格按照JSON格式（不要输出\`\`\`json\`\`\`等标记）给出射覆推测结果。`;
}

function isDeepSeekAPI(baseUrl) {
  return baseUrl && baseUrl.includes('deepseek.com');
}

async function guess(numbers, gua) {
  const apiBaseUrl = process.env.AI_API_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'deepseek-chat';
  const disableThinking = process.env.AI_DISABLE_THINKING !== 'false';

  if (!apiBaseUrl || !apiKey) {
    throw new Error('AI API配置不完整，请检查.env文件中的AI_API_BASE_URL和AI_API_KEY');
  }

  const config = loadPromptConfig();
  const systemPrompt = buildSystemPrompt(config);
  const userPrompt = buildUserPrompt(numbers, gua);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const requestBody = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 6000,
      stream: false
    };

    if (isDeepSeekAPI(apiBaseUrl) && disableThinking) {
      requestBody.thinking = { type: 'disabled' };
    }
    requestBody.temperature = 0.5;

    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`AI API返回错误 (${response.status}): ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      throw new Error('AI API返回内容为空');
    }

    content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
      return JSON.parse(content);
    } catch (parseErr) {
      const cleaned = content.replace(/[\s\S]*?(\{[\s\S]*\})[\s\S]*/, '$1').trim();
      return JSON.parse(cleaned);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI API请求超时（60秒）');
    }
    throw err;
  }
}

module.exports = { guess, loadPromptConfig, buildSystemPrompt, buildUserPrompt };