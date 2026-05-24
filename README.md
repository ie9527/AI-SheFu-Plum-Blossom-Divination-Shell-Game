
# AI射覆 - 梅花易数射覆小游戏

一个基于梅花易数的射覆小游戏，用户报数，AI进行占断。

## 功能特点

- 用户输入三个数字进行起卦
- 基于梅花易数算法计算卦象
- AI 智能占断射覆物品
- 射覆日志记录功能

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Node.js, Express
- AI服务：OpenAI API

## 安装

```bash
npm install
```

## 配置

1. 复制 `server/config/.env.example` 为 `.env`
2. 在 `.env` 中配置你的 OpenAI API Key 和其他配置

## 运行

```bash
npm start
```

或者开发模式（自动重启）：

```bash
npm run dev
```

## 访问地址

- 游戏入口：http://127.0.0.1:3000/
- 日志页面：http://127.0.0.1:3000/MHYS
- 健康检查：http://127.0.0.1:3000/api/health

## 项目结构

```
├── css/              # 样式文件
├── js/               # 前端 JavaScript
├── server/           # 后端代码
│   ├── config/     # 配置文件
│   └── services/   # 服务模块
├── index.html      # 主页面
└── info.html       # 日志页面
```

## API 接口

### GET /api/health
健康检查接口

### GET /api/logs
获取射覆日志

### POST /api/guess
AI 占断接口，接收三个数字，返回卦象和 AI 猜测

### POST /api/log
记录射覆日志

## License

MIT

