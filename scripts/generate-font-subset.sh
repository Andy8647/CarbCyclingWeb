#!/bin/bash
echo "🎨 生成 MapleMono 字体子集..."

# 创建输出目录
mkdir -p src/assets/fonts

pyftsubset "src/assets/MapleMono-NF-CN-Regular.ttf" --text="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:()[]{}"'-/\|@#$%^&*+=<>~`_→←↑↓⚡🔥🌿⚖️💪🏋🦵🙌🔺⬜🔻🏃🚴💻☀🌙📏🎯🍚🥜🥩📊📈📝💫🎨🔍📋📱🌐🚀✅❌碳循环饮食计算器基础信息年龄性别身高体重男女公制英营养素系数型内胚中外水蛋白质脂肪易增代谢较慢适合低选择后显示对应的建议根据训练强度调整活动参天用于每日总能量消耗不会影响分配若确定推荐久坐几乎运办室轻次周规律跃极职业员力劳方案复结果为热明细第拖拽卡片到此处请先填写完就绪这里即时展你划摘要项目已剪贴板失败胸部背腿肩臂腹全有氧休本仅供考具咨询专师切换当前主题浅色深统单位" --output-file="src/assets/fonts/MapleMono-subset.woff2" --flavor=woff2 --with-zopfli

pyftsubset "src/assets/MapleMono-NF-CN-Regular.ttf" --text="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:()[]{}"'-/\|@#$%^&*+=<>~`_→←↑↓⚡🔥🌿⚖️💪🏋🦵🙌🔺⬜🔻🏃🚴💻☀🌙📏🎯🍚🥜🥩📊📈📝💫🎨🔍📋📱🌐🚀✅❌碳循环饮食计算器基础信息年龄性别身高体重男女公制英营养素系数型内胚中外水蛋白质脂肪易增代谢较慢适合低选择后显示对应的建议根据训练强度调整活动参天用于每日总能量消耗不会影响分配若确定推荐久坐几乎运办室轻次周规律跃极职业员力劳方案复结果为热明细第拖拽卡片到此处请先填写完就绪这里即时展你划摘要项目已剪贴板失败胸部背腿肩臂腹全有氧休本仅供考具咨询专师切换当前主题浅色深统单位" --output-file="src/assets/fonts/MapleMono-subset.woff" --flavor=woff --with-zopfli

pyftsubset "src/assets/MapleMono-NF-CN-Regular.ttf" --text="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:()[]{}"'-/\|@#$%^&*+=<>~`_→←↑↓⚡🔥🌿⚖️💪🏋🦵🙌🔺⬜🔻🏃🚴💻☀🌙📏🎯🍚🥜🥩📊📈📝💫🎨🔍📋📱🌐🚀✅❌碳循环饮食计算器基础信息年龄性别身高体重男女公制英营养素系数型内胚中外水蛋白质脂肪易增代谢较慢适合低选择后显示对应的建议根据训练强度调整活动参天用于每日总能量消耗不会影响分配若确定推荐久坐几乎运办室轻次周规律跃极职业员力劳方案复结果为热明细第拖拽卡片到此处请先填写完就绪这里即时展你划摘要项目已剪贴板失败胸部背腿肩臂腹全有氧休本仅供考具咨询专师切换当前主题浅色深统单位" --output-file="src/assets/fonts/MapleMono-subset.ttf"

echo "✅ 字体子集生成完成!"
echo "📊 文件大小对比:"
ls -lh src/assets/MapleMono-NF-CN-Regular.ttf
ls -lh src/assets/fonts/MapleMono-subset.*
