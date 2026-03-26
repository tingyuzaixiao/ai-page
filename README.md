<div align="center">
   <font size="70">AI算法训练平台前端UI</font>
   <br/>
</div>

<p align="center">
 <img src="https://img.shields.io/badge/platform-3.7-success.svg" alt="Build Status">
 <img src="https://img.shields.io/badge/Spring%20Cloud-2021-blue.svg" alt="Coverage Status">
 <img src="https://img.shields.io/badge/Spring%20Boot-2.7-blue.svg" alt="Downloads">
 <img src="https://img.shields.io/badge/Vue-3.2-blue.svg" alt="Downloads">
</p>

## 框架说明

- Vue3 + TypeScript + Pinia + Vite + Element-Plus

## 系统说明

- 基于 Spring Cloud 、Spring Boot、 OAuth2 的 RBAC **权限管理系统**
- 基于数据驱动视图的理念封装 element-plus

## 快速开始

### 模块说明

```lua
platform-ui  -- https://git.code.tencent.com/tarining/training-vue.git
```

### 本地开发 运行

platform 提供了详细的[部署文档 wiki.pig4cloud.com](https://www.yuque.com/pig4cloud/pig/vsdox9)，包括开发环境安装、服务端代码运行、前端代码运行等。

请务必**完全按照**文档部署运行章节 进行操作，减少踩坑弯路！！


## 目录结构
以下是算法云平台前端的示例目录结构：

```
|-- AI 算法训练平台
|-- .env 部署环境
|-- .env.development 开发环境
├─ src/
│   ├─ assets/            # 静态资源文件夹
│   ├─ components/        # 公共组件文件夹
│   ├─ views/             # 页面组件文件夹
│   ├─ router/            # 路由配置文件夹
│   ├─ store/             # 状态管理文件夹
│   ├─ services/          # API服务文件夹
│   ├─ utils/             # 工具函数文件夹
│   ├─ App.vue            # 根组件
│   └─ main.ts            # 入口文件
├─ public/                # 公共静态文件夹
├─ .eslintrc.js           # ESLint配置文件
├─ babel.config.js        # Babel配置文件
├─ package.json           # 项目配置文件
└─ README.md              # 项目文档
```
