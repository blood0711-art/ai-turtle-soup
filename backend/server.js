require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// 请求ID中间件
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// 日志格式
morgan.token('id', req => req.id);
app.use(morgan(':id :method :url :status :response-time ms'));

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/', (req, res) => {
  res.json({ message: '海龟汤 AI 服务已启动' });
});

// 测试接口
app.get('/api/test', (req, res) => {
  res.json({ message: '后端服务运行正常', timestamp: new Date().toISOString() });
});

class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// AI 对话接口（支持普通模式和线索模式）
app.post('/api/chat', async (req, res) => {
  const { question, story, history, mode } = req.body;

  if (!story || !story.bottom) {
    throw new APIError('缺少必要参数：story.bottom', 400);
  }
  if (mode !== 'clue' && !question) {
    throw new APIError('缺少必要参数：question', 400);
  }

  let systemPrompt = '';
  let temperature = 0.0;
  let maxTokens = 5;

  if (mode === 'clue') {
    // 线索模式（保持不变）
    systemPrompt = `你是一个海龟汤游戏的主持人。玩家已经连续三次猜错，请你根据以下“真相”给出一个简短的提示，帮助玩家继续推理。提示必须非常含蓄，不能直接说出任何具体事实、人名、物品或事件。你可以使用比喻、反问或暗示，让玩家自己去联想。输出一句话，不要使用标点符号。

真相：${story.bottom}

示例：如果真相是“病人其实是遗体被家属从窗户运走”，你的提示可以是“某些东西并不是表面看到的那样”或“真相藏在为什么没有人进出里”。`;
    temperature = 0.5;
    maxTokens = 60;
  } else {
    // 通用版普通模式提示词（无故事特例）
    systemPrompt = `你是一个海龟汤游戏的主持人。你必须严格按照以下“真相”回答玩家的提问。回答只能是“是”、“不是”或“与此无关”中的一个词，不要添加任何其他文字、解释或标点符号。

真相：${story.bottom}

判断规则：
- 如果玩家的问题与真相中明确描述的任何事实一致（包括同义表述、合理推断），回答“是”。
- 如果玩家的问题与真相中明确描述的事实相反或矛盾，回答“不是”。
- 如果玩家的问题与真相中的任何事实都不相关，回答“与此无关”。

注意：真相中可能包含专业术语或特定概念，玩家的问题可能使用日常语言。请将玩家的问题与真相中的事实进行合理关联，但不要超出真相范围。`;
    temperature = 0.0;
    maxTokens = 10; // 稍微增加，避免标点导致截断
  }

  // 构造消息列表
  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []),
  ];
  if (mode !== 'clue') {
    messages.push({ role: 'user', content: question });
  }

  try {
    const response = await fetch(process.env.DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      console.error(`[${req.id}] DeepSeek API error: ${response.status}`);
      throw new APIError('AI 服务暂时不可用', 500);
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content?.trim() || '与此无关';
    console.log(`[${req.id}] DeepSeek raw reply: ${reply}`);

    if (mode === 'clue') {
      reply = reply.replace(/[。？！，.?!,]/g, '');
      res.json({ answer: reply });
    } else {
      reply = reply.replace(/[。？！，.?!,]/g, '').trim();
      let finalAnswer = '与此无关';
      if (reply === '不是') finalAnswer = '不是';
      else if (reply === '是') finalAnswer = '是';
      else if (reply.includes('否') || reply === '不') finalAnswer = '不是';
      else if (reply.includes('是') && reply !== '不是') finalAnswer = '是';
      else finalAnswer = '与此无关';
      res.json({ answer: finalAnswer });
    }
  } catch (error) {
    console.error(`[${req.id}] AI 请求失败:`, error);
    if (error instanceof APIError) throw error;
    throw new APIError('服务器内部错误，请稍后重试', 500);
  }
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(`[${req.id}] Global error:`, err);
  const status = err.status || 500;
  const message = err.message || '服务器内部错误，请稍后重试';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});