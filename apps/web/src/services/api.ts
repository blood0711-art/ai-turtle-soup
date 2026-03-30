import { TStory } from '../data/stories';

/**
 * 询问 AI 海龟汤主持人（通过后端代理）
 * @param question 当前玩家问题
 * @param story 当前故事（包含汤底）
 * @param history 对话历史（可选）
 * @param options 可选配置，如 mode: 'clue'
 * @returns 回答：'是' / '不是' / '与此无关' 或线索文本
 */
export async function askAI(
  question: string,
  story: TStory,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  options?: { mode?: 'clue' }
): Promise<string> {
  // 预判断：过滤掉极短或无意义的提问（性能优化，仅对普通提问有效）
  if (!options?.mode) {
    const lowerQuestion = question.toLowerCase().trim();
    const meaninglessWords = ['新问题', '开始', '你好', '在吗', '指令', '测试'];
    if (meaninglessWords.some(word => lowerQuestion.includes(word)) || lowerQuestion.length < 2) {
      return '与此无关';
    }
  }

  // 从环境变量获取后端 API 地址，如果未设置则回退到相对路径（本地开发用）
  const API_BASE_URL = import.meta.env.VITE_AI_API_URL || '/api/chat';

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        story,
        history,
        mode: options?.mode,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.answer || '与此无关';
  } catch (error) {
    console.error('后端请求失败:', error);
    return '与此无关';
  }
}