#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 收集项目中使用的字符
function collectCharsFromProject() {
  const chars = new Set();

  // 基础字符集
  const basicChars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const punctuation = '.,!?;:()[]{}"\'-/\\|@#$%^&*+=<>~`_';
  const symbols =
    '→←↑↓⚡🔥🌿⚖️💪🏋️🦵🙌🔺⬜🔻🏃🚴💻☀️🌙📏⚖️🎯🍚🥜🥩📊📈📝💫🎨🔍📋📱🌐🚀✅❌📊🎯';

  // 添加基础字符
  for (const char of basicChars + punctuation + symbols) {
    chars.add(char);
  }

  // 中文字符 - 根据项目实际使用的中文
  const chineseChars = `
    碳循环饮食计算器基础信息年龄性别身高体重男女公制英制
    营养素系数体型内胚型中胚型外胚型碳水蛋白质脂肪
    易增重代谢较慢适合低高选择后显示对应的建议根据训练强度调整
    活动参数循环天数天系数用于每日总能量消耗不会影响分配
    若不确定推荐久坐几乎不运动办公室轻度次周规律高活跃极职业员力劳动
    营养方案复制结果为热量信息日型明细第拖拽卡片到此处
    请先填写完整就绪这里会即时展示你的计划周度摘要项目选择
    已到剪贴板失败胸部背腿肩臂腹全身有氧休息
    本仅供参考具饮食咨询专业师
    切换到当前主题浅色深系统单位
  `;

  for (const char of chineseChars.replace(/\s/g, '')) {
    chars.add(char);
  }

  return Array.from(chars).join('');
}

// 生成字体子集化命令
function generateSubsetCommand() {
  const chars = collectCharsFromProject();
  const inputFont = 'src/assets/MapleMono-NF-CN-Regular.ttf';
  const outputDir = 'src/assets/fonts';

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('字符集大小:', chars.length);
  console.log('包含的字符示例:', chars.substring(0, 100) + '...');

  // 生成多种格式的字体
  const commands = [
    // WOFF2 (最佳压缩)
    `pyftsubset "${inputFont}" --text="${chars}" --output-file="${outputDir}/MapleMono-subset.woff2" --flavor=woff2 --with-zopfli`,

    // WOFF (备选)
    `pyftsubset "${inputFont}" --text="${chars}" --output-file="${outputDir}/MapleMono-subset.woff" --flavor=woff --with-zopfli`,

    // TTF (备选)
    `pyftsubset "${inputFont}" --text="${chars}" --output-file="${outputDir}/MapleMono-subset.ttf"`,
  ];

  return commands;
}

// 主函数
function main() {
  console.log('🎨 正在生成 MapleMono 字体子集...\n');

  const commands = generateSubsetCommand();

  console.log('执行以下命令来生成字体子集:\n');
  commands.forEach((cmd, i) => {
    console.log(`${i + 1}. ${cmd}\n`);
  });

  // 写入到脚本文件
  const scriptContent = `#!/bin/bash
echo "🎨 生成 MapleMono 字体子集..."

# 创建输出目录
mkdir -p src/assets/fonts

${commands.join('\n\n')}

echo "✅ 字体子集生成完成!"
echo "📊 文件大小对比:"
ls -lh src/assets/MapleMono-NF-CN-Regular.ttf
ls -lh src/assets/fonts/MapleMono-subset.*
`;

  fs.writeFileSync('scripts/generate-font-subset.sh', scriptContent);
  fs.chmodSync('scripts/generate-font-subset.sh', '755');

  console.log('📝 已生成脚本: scripts/generate-font-subset.sh');
  console.log('🚀 运行: ./scripts/generate-font-subset.sh');
}

main();
