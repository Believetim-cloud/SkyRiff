/**
 * 模拟iOS风格的移动端输入键盘
 * 纯装饰性UI组件，不与输入框联动
 */

import { Delete, Globe, Mic, Smile } from 'lucide-react';

export function MobileKeyboard() {
  // 候选词建议
  const suggestions = ['我', '你', '中文', '很', '好', '说', '继续', '再', '扩'];

  // 键盘按键布局
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'delete'],
  ];

  const handleKeyPress = (key: string) => {
    // 这里可以添加实际的输入处理逻辑
    console.log(key);
  };

  return (
    <div className="h-[40vh] bg-[#d1d5db]/95 backdrop-blur-lg border-t border-gray-300 w-full mx-auto flex flex-col animate-slideInFromBottom">
      {/* 候选词区域 */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-300 bg-white/40 overflow-x-auto scrollbar-hide flex-shrink-0">
        {suggestions.map((word, index) => (
          <button
            key={index}
            onClick={() => handleKeyPress(word)}
            className="px-2 py-0.5 text-white text-xs whitespace-nowrap hover:bg-white/10 rounded transition-colors"
          >
            {word}
          </button>
        ))}
        <button className="ml-auto px-1.5 text-white/50 hover:text-white">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12l-4-4h8l-4 4z" />
          </svg>
        </button>
      </div>

      {/* 键盘主体 */}
      <div className="px-1 pt-1.5 space-y-1.5">
        {/* 第一行 */}
        <div className="flex gap-1 px-0.5">
          {keyboardRows[0].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="flex-1 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md text-base transition-colors active:scale-95"
            >
              {key}
            </button>
          ))}
        </div>

        {/* 第二行 */}
        <div className="flex gap-1 px-2">
          {keyboardRows[1].map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="flex-1 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md text-base transition-colors active:scale-95"
            >
              {key}
            </button>
          ))}
        </div>

        {/* 第三行 */}
        <div className="flex gap-1 px-0.5">
          {/* Shift 键 */}
          <button
            onClick={() => handleKeyPress('shift')}
            className="w-10 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md flex items-center justify-center transition-colors active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 4l6 6h-4v6h-4v-6H4l6-6z" />
            </svg>
          </button>

          {/* 字母键 */}
          {keyboardRows[2].slice(1, -1).map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="flex-1 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md text-base transition-colors active:scale-95"
            >
              {key}
            </button>
          ))}

          {/* Delete 键 */}
          <button
            onClick={() => handleKeyPress('delete')}
            className="w-10 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md flex items-center justify-center transition-colors active:scale-95"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* 第四行 - 功能键 */}
        <div className="flex gap-1 px-0.5">
          {/* 123 键 */}
          <button
            onClick={() => handleKeyPress('123')}
            className="w-12 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md text-xs transition-colors active:scale-95"
          >
            123
          </button>

          {/* 表情键 */}
          <button
            onClick={() => handleKeyPress('emoji')}
            className="w-10 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md flex items-center justify-center transition-colors active:scale-95"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* 空格键 */}
          <button
            onClick={() => handleKeyPress(' ')}
            className="flex-1 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md text-xs transition-colors active:scale-95"
          >
            空格
          </button>

          {/* 换行键 */}
          <button
            onClick={() => handleKeyPress('\n')}
            className="w-14 h-8 bg-[#5c5c60] hover:bg-[#6c6c70] text-white rounded-md text-xs transition-colors active:scale-95"
          >
            换行
          </button>
        </div>

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between px-2 pt-0.5 pb-1.5">
          {/* 切换语言 */}
          <button
            onClick={() => handleKeyPress('language')}
            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors active:scale-95"
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* 语音输入 */}
          <button
            onClick={() => handleKeyPress('voice')}
            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors active:scale-95"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center pb-0.5">
          <div className="w-28 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}