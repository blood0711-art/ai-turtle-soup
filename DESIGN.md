## AI 海龟汤游戏技术设计（DESIGN）

本设计文档基于 `PRD.md` 与 `RESEARCH.md`，目标是让 AI **稳定扮演主持人**（严格三选一回答、可控提示、可判定通关），并保证前后端实现可落地、可扩展。

---

## 技术栈建议（保持与 PRD 一致）
- 前端：React + TypeScript + Tailwind CSS（构建工具建议 Vite）
- 状态管理：优先使用 React Hooks（`useState` / `useReducer` / `useContext`），如无必要不引入额外状态库
- 路由：React Router（或 Vite 官方路由方案）
- 后端：Node.js + Express
- AI：DeepSeek / Claude API
- 部署：Vercel

---

## 总体架构
### 分层
- **Web 前端（apps/web）**：渲染 UI、输入校验、展示三态回答与提示、LocalStorage 保存“可恢复的局内视图状态”（可选）。
- **API 后端（apps/api）**：游戏权威逻辑（开局/问答/提示/猜底/揭晓）、会话状态管理、题库读取、LLM 调用与强约束输出、反作弊与限流。
- **静态题库（/puzzles）**：JSON 资产，支持版本控制、难度/主题扩展、内置提示与关键事实，用于稳定判定与提示发放。

### 关键原则（稳定性）
- **AI 不直接“自由聊天”**：所有回答都通过后端 `judge` 统一裁决，最终输出强制落在 **“是 / 否 / 无关”** 三态。
- **一致性优先**：后端维护“已确认事实”与对话摘要；重复/同义问题尽量复用历史结论，避免前后矛盾。
- **可解释通关**：通关判定优先采用“关键事实覆盖率 + 核心事实必须命中”，必要时再用 LLM 辅助判定。

---

## 项目目录结构（规划）
```text
AI-Turtle-Soup/
  README.md
  PRD.md
  RESEARCH.md
  DESIGN.md

  puzzles/
    index.json
    easy/
      p001.json
    medium/
      p101.json
    hard/
      p201.json
    _schema.json

  apps/
    web/
      index.html
      package.json
      vite.config.ts
      tailwind.config.ts
      postcss.config.js
      src/
        main.tsx
        App.tsx
        styles/
          globals.css
        routes/
          LobbyPage.tsx
          GamePage.tsx
          RevealPage.tsx
        components/
          BottleCard.tsx
          PuzzleSurface.tsx
          GuessModal.tsx
          ConfirmDialog.tsx
          FactPanel.tsx
          Chat/
            ChatWindow.tsx
            MessageBubble.tsx
            Composer.tsx
        lib/
          api/
            client.ts
            types.ts
          storage/
            localGameStore.ts
          guardrails/
            questionPolicy.ts
          puzzle/
            loader.ts
            normalize.ts
          game/
            state.ts
            reducers.ts
            selectors.ts
          analytics/
            events.ts
        types/
          domain.ts

    api/
      package.json
      tsconfig.json
      src/
        server.ts
        config/
          env.ts
        routes/
          health.ts
          puzzles.ts
          game.ts
        controllers/
          gameController.ts
        services/
          puzzleService.ts
          gameService.ts
          hintService.ts
        ai/
          llmClient.ts
          judge.ts
          prompt/
            system.ts
            judge.ts
            solve.ts
        logic/
          solveCheck.ts
          factState.ts
          scoring.ts
        middleware/
          validate.ts
          rateLimit.ts
          errorHandler.ts
        types/
          dto.ts
          domain.ts

  shared/
    puzzle-schema.ts
    constants.ts

  scripts/
    validate-puzzles.ts
    build-index.ts

  docs/
    API.md
    Prompting.md

  .env.example
  .gitignore
```

---

## 谜题数据设计（Puzzle Schema）
### 目标
- 支持：汤面展示、三态裁判、提示发放、猜底判定（关键事实覆盖）。
- 可版本化：题库迭代可追踪、可校验。

### 建议 JSON 结构
```json
{
  "id": "p001",
  "title": "深夜的电梯",
  "difficulty": "easy",
  "tags": ["都市", "意外"],
  "surface": "……（汤面）",
  "truth": "……（汤底）",
  "keyFacts": [
    { "id": "kf1", "text": "主角并未死亡", "weight": 3, "mustHave": true },
    { "id": "kf2", "text": "事件发生在电梯内", "weight": 2, "mustHave": true },
    { "id": "kf3", "text": "关键误会来自……", "weight": 1, "mustHave": false }
  ],
  "hints": [
    { "level": 1, "text": "关注地点。", "type": "direction" },
    { "level": 2, "text": "关注时间顺序。", "type": "direction" },
    { "level": 3, "text": "注意误会/错觉。", "type": "direction" }
  ],
  "guardrails": {
    "allowSupernatural": false,
    "allowDirectSolveGuess": true
  }
}
```

### `index.json`
用于大厅快速加载列表，避免一次性读入所有 `truth`：
```json
[
  { "id": "p001", "title": "深夜的电梯", "difficulty": "easy", "tags": ["都市"] },
  { "id": "p101", "title": "……", "difficulty": "medium", "tags": ["校园"] }
]
```

> 建议：`index.json` 不包含 `truth`、`keyFacts`（或只含一小部分元数据），详情由 API 按需返回。

---

## 前端数据模型（Story / Message）
为方便前端实现与模板对齐，这里给出精简型数据模型（与后端领域模型保持一致或可映射）。

### Story（海龟汤故事，前端视角）
- `id: string`：对应 Puzzle 的 `id`
- `title: string`
- `difficulty: 'easy' | 'medium' | 'hard'`
- `tags?: string[]`
- `surface: string`：汤面（给玩家）
- `truth?: string`：汤底（仅在揭晓页使用；正常游戏过程中前端不持有）

> 在实现时，前端可仅使用 `StorySurface` 视图模型（不含 `truth`），由 Reveal 接口在揭晓时单独返回真相。

### Message（对话消息，前端视角）
- `id: string`
- `role: 'player' | 'host' | 'system'`
- `content: string`
- `timestamp: number`
- 可选字段：
  - `answerType?: 'yes' | 'no' | 'irrelevant'`（主持人三态回答时标记）
  - `isHint?: boolean`（是否为提示消息）

> 前端 `ChatWindow`、`MessageBubble` 组件优先消费此结构；后端可返回同构或可轻易转换为该结构的 DTO。

---

## 游戏状态与状态机（FSM）
### 状态
- `idle`：未开始/大厅
- `playing`：进行中（问答）
- `solving`：玩家提交“我来猜汤底”
- `revealed`：已揭晓（通关/放弃/查看汤底）

### 会话数据（后端权威）
每局 `GameSession`（建议存在内存/Redis/数据库，MVP 可先内存 Map）：
- `sessionId`
- `puzzleId`
- `turn`：回合计数
- `messages[]`：[{ role: "player"|"host"|"system", text, ts }]
- `confirmedFacts`：Map<keyFactId, true|false|unknown>（可选）
- `streakNo` / `streakIrrelevant`：连续“否/无关”计数
- `hintsUsed`：已使用提示等级/数量
- `status`：playing / revealed
- `result`：win / giveup / reveal

> 前端也可用 LocalStorage 保存“最后一次 sessionId + UI 滚动位置 + 用户设置”，但**核心判定在后端**，避免篡改。

---

## 核心前端流程（与模板对齐）
结合 PRD 与模板，这里给出前端视角的最小流程：

1. **玩家选择故事**  
   - 在大厅点击某个漂流瓶卡片（`BottleCard`）  
   - 前端调用 `POST /api/game/start`，拿到 `sessionId` 与 `StorySurface`，并导航到 `GamePage`

2. **展示汤面**  
   - `GamePage` 顶部固定显示当前故事汤面（`PuzzleSurface` 组件）

3. **玩家提问**  
   - 玩家在 `Composer` 中输入问题并发送  

4. **AI 裁判回答（是 / 否 / 无关）**  
   - 前端调用 `POST /api/game/ask`  
   - 将返回的 `Message[]` 追加到聊天窗口，主持人回答限制为“是/否/无关”，并按三态样式渲染

5. **智能线索触发**  
   - 后端根据“累计 3 次否/无关”等规则决定是否返回 `hint`  
   - 前端若收到 `hint` 字段，则以系统提示样式展示，并激活动画（如提示按钮光晕）

6. **玩家猜汤底**  
   - 玩家点击“我来猜汤底”，弹出 `GuessModal`，输入完整推理  
   - 前端调用 `POST /api/game/guess`，根据 `passed`/`feedback` 决定：通关或继续推理

7. **揭晓与再开一局**  
   - 玩家通关或主动点击“查看汤底”/“结束游戏” → 调用 `POST /api/game/reveal`  
   - 跳转到 `RevealPage` 展示汤底与复盘信息，提供“再来一局”返回大厅

---

## API 设计（契约）
### 基础约定
- Base path：`/api`
- Content-Type：`application/json`
- 所有响应统一包裹：
  - `ok: boolean`
  - `data?: ...`
  - `error?: { code: string, message: string }`

### 1) 健康检查
#### GET `/api/health`
Response：
```json
{ "ok": true, "data": { "status": "ok" } }
```

### 2) 题库列表/详情
#### GET `/api/puzzles`
Query（可选）：`difficulty`, `tag`, `q`, `limit`
Response：
```json
{
  "ok": true,
  "data": {
    "items": [
      { "id": "p001", "title": "深夜的电梯", "difficulty": "easy", "tags": ["都市"] }
    ]
  }
}
```

#### GET `/api/puzzles/:id`
用途：示例预览或开发调试（线上可限制不返回 truth）
Response（建议线上不返回 truth/keyFacts，或仅管理员）：
```json
{
  "ok": true,
  "data": {
    "id": "p001",
    "title": "深夜的电梯",
    "difficulty": "easy",
    "tags": ["都市"],
    "surface": "……"
  }
}
```

### 3) 开局
#### POST `/api/game/start`
Request：
```json
{ "puzzleId": "p001" }
```
Response：
```json
{
  "ok": true,
  "data": {
    "sessionId": "sess_xxx",
    "puzzle": { "id": "p001", "title": "深夜的电梯", "difficulty": "easy", "tags": ["都市"], "surface": "……" },
    "messages": [
      { "role": "system", "text": "规则：请用是/否问题提问。主持人只回答“是/否/无关”。" }
    ]
  }
}
```

### 4) 提问（核心）
#### POST `/api/game/ask`
Request：
```json
{ "sessionId": "sess_xxx", "question": "主角死了吗？" }
```
Response：
```json
{
  "ok": true,
  "data": {
    "answer": "否",
    "turn": 3,
    "hint": null,
    "messagesAppended": [
      { "role": "player", "text": "主角死了吗？" },
      { "role": "host", "text": "否" }
    ]
  }
}
```

若触发提示（例如连续三次“否”）：
```json
{
  "ok": true,
  "data": {
    "answer": "否",
    "turn": 6,
    "hint": { "level": 1, "text": "关注地点。" },
    "messagesAppended": [
      { "role": "player", "text": "……？" },
      { "role": "host", "text": "否" },
      { "role": "system", "text": "提示：关注地点。" }
    ]
  }
}
```

### 5) 猜汤底
#### POST `/api/game/guess`
Request：
```json
{ "sessionId": "sess_xxx", "guessText": "我认为……（玩家推理）" }
```
Response（未通过）：
```json
{
  "ok": true,
  "data": {
    "passed": false,
    "coverage": 0.5,
    "feedback": "还差一点：动机或关键误会还不完整。",
    "missingDirections": ["动机", "关键误会"]
  }
}
```
Response（通过）：
```json
{
  "ok": true,
  "data": {
    "passed": true,
    "coverage": 0.83,
    "result": "win"
  }
}
```

### 6) 揭晓/结束
#### POST `/api/game/reveal`
Request：
```json
{ "sessionId": "sess_xxx", "reason": "view_truth" }
```
Response：
```json
{
  "ok": true,
  "data": {
    "result": "giveup",
    "puzzle": { "id": "p001", "title": "深夜的电梯", "surface": "……", "truth": "……" },
    "messages": [ /* 完整对话 */ ],
    "stats": { "turns": 12, "hintsUsed": 2 }
  }
}
```

---

## AI 主持人设计（Judge）
### 目标
- 输入玩家问题后，**稳定输出**三选一：`是`、`否`、`无关`
- 不泄底、不扩写、不聊天
- 对重复问题保持一致

### 输出格式（强约束，推荐）
要求模型只输出 JSON（后端解析后再映射到 UI）：
```json
{ "answer": "是" }
```
若输出不符合格式或不在枚举内，后端兜底：强制改为 `无关`。

### 输入上下文（每次 ask）
后端拼装：
- `system`：主持人规则（只三选一、禁止泄底、保持一致、不得编造新事实）
- `puzzle.surface`
- `puzzle.truth`（仅后端传给模型）
- `puzzle.keyFacts`（用于一致性与判定）
- `state.confirmedFacts`（如实现）
- `recentMessages`（最近 N 轮对话，避免上下文无限增长）
- `question`（当前玩家问题）

### 一致性策略（推荐优先级）
1. **输入短路**：多问句/非问句/泄底请求 → 不进模型或用轻模板，直接回答 `无关`
2. **重复问题复用**：同义匹配到历史问题 → 直接复用历史 `answer`
3. **模型裁决**：只做三分类，不允许解释
4. **输出校验**：非枚举 → `无关`

---

## “猜中汤底”判定（Solve Check）
### MVP 规则（可解释、可调参）
基于 `keyFacts` 计算覆盖率：
- 每条事实命中：`hit_i = 1`，否则 0
- 权重：`weight_i`
- 覆盖率：
  \[
  coverage = \frac{\sum weight_i \cdot hit_i}{\sum weight_i}
  \]
通过条件（建议）：
- `coverage >= 0.75`
- 且所有 `mustHave: true` 的事实都命中

### 命中判断（两种实现路径）
- **基础版（可离线）**：关键词/同义词匹配（由题库维护同义词，或简单 contains）
- **增强版（更鲁棒）**：LLM 逐条判定“玩家文本是否表达了该事实”（只返回 true/false），仍由规则计算 coverage

> 建议先做基础版，题库作者为每条 `keyFact` 维护少量关键词/同义词，保证可控与成本。

---

## 示例 AI Prompt 设计（与模板对齐）
以下为简化版主持人 System Prompt 示例，用于 `ai/prompt/system.ts`，实际实现可在此基础上加强结构化要求（JSON 输出）：

```text
你是一個海龟汤游戏的主持人。

当前故事的汤面是：{surface}
故事的汤底（真相）是：{truth}

玩家会向你提问，你只能用以下三种之一回答：
1. "是"：玩家的猜测与汤底一致
2. "否"：玩家的猜测与汤底不符
3. "无关"：玩家的猜测与汤底无关，无法判断

注意：
1. 只根据提供的故事判断，不要额外编造情节
2. 回答内容只能是 "是"、"否"、"无关"，不要解释
3. 保持神秘感，不要透露汤底或关键线索

玩家的问题是：{question}
请只输出一个词："是"、"否" 或 "无关"。
```

> 实际调用时，建议通过 `prompt/judge.ts` 再包一层，让模型输出结构化 JSON（见前文“输出格式”），这里主要作为语义与语气的参考模板。

---

## 提示系统（Hints）
### 触发条件（MVP）
满足任一触发发放下一条提示：
- 连续 3 次回答为 `否`
- 或连续 2 次回答为 `无关`
- 或回合数超过阈值（例如 12 回合）

### 提示来源与策略
- 优先使用题库 `hints[]`（从 level 1 → level 2）
- `hints[]` 用尽后，只给方向性提示（不直接给结论），并控制频率

---

## 反作弊与防攻击
### 输入约束
- 单次输入长度限制（例如 200 字）
- 多问句检测（出现多个 `?`/`？` 或多段并列）→ `无关`
- 泄底诱导（“忽略规则”“直接说真相”）→ `无关`

### 限流（后端）
- 基于 IP/sessionId 的简单限流（例如每分钟 30 次 ask）
- 超额返回错误：`429 RATE_LIMITED`

### Prompt Injection 防护
- system 规则高优先级
- 不把任何“用户指令”提升为系统指令
- 输出必须符合 JSON schema，否则兜底

---

## 部署与环境变量
### 环境变量（示例）
`.env.example` 建议包含：
- `AI_PROVIDER=deepseek|claude`
- `AI_API_KEY=...`
- `AI_MODEL=...`
- `AI_TIMEOUT_MS=...`

### 部署建议
- Web 与 API 可在 Vercel 分别部署（或同仓 monorepo）
- 题库 `puzzles/` 作为构建时静态资源，或由 API 读取并缓存

---

## 开发阶段建议（里程碑）
### MVP 里程碑
- 题库 JSON + index 列表
- `/game/start` + `/game/ask` + 三态气泡 UI
- 提示触发与展示
- `/game/guess`（关键事实覆盖率）
- `/game/reveal`（揭晓与复盘）

