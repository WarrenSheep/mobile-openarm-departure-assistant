# 基于 Mobile OpenARM 的家庭出门物品准备助手系统

本项目是机器人导论课程的系统设计与非实物演示项目。项目面向家庭出门场景，设计一套基于 Mobile OpenARM 移动操作平台的物品准备助手：用户输入出门物品清单后，系统结合模拟天气、交通、日程和用户习惯，生成最终准备清单，并用静态网页演示“系统决策 - 机器人作业 - 状态反馈”的完整流程。

> 说明：本仓库不连接真实 Mobile OpenARM，不实现真实 ROS、机械臂控制、导航或视觉识别算法。所有机器人行为均为工程设计说明和模拟数据演示。

## 应用场景

- 上班出门：准备钥匙、钱包、手机、耳机等随身物品。
- 雨天出门：根据天气模拟数据建议加入雨伞。
- 会议出门：根据日程建议携带电脑、文件夹或证件。
- 就医出门：提醒携带药盒、医保卡、病历或眼镜。
- 交通拥堵：提醒用户提前出门。

## 核心功能

- 物品清单输入与结构化解析。
- 天气、交通、日程、习惯数据驱动的主动建议。
- 家庭语义地图下的物品位置预测与搜索顺序规划。
- 视觉识别、电子标签、习惯模型三类信息的融合设计。
- 机器人导航、识别、抓取、放置、异常处理的模拟流程。
- 静态网页演示任务生成、执行状态、日志和架构图。

## 系统流程图入口

- [系统总体流程](docs/diagrams/system_overview.mmd)
- [机器人作业流程](docs/diagrams/robot_workflow.mmd)
- [硬件架构](docs/diagrams/hardware_architecture.mmd)
- [软件架构](docs/diagrams/software_architecture.mmd)
- [数据流](docs/diagrams/data_flow.mmd)

SVG 展示图位于 [assets](assets) 目录，可直接插入答辩材料或在演示页面中查看。

## 项目结构

```text
.
├── README.md
├── 项目介绍.md
├── docs/
│   ├── 系统设计手册.md
│   ├── 演示说明.md
│   └── diagrams/
├── assets/
├── demo/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── data/
    ├── mock_items.json
    ├── mock_environment.json
    └── mock_tasks.json
```

## 如何打开演示系统

直接用浏览器打开 [demo/index.html](demo/index.html)。演示页面不需要后端服务，不依赖真实 API，数据来自 [data](data) 目录中的 JSON 文件；若浏览器限制本地 JSON 读取，页面会自动使用内置备用数据。

## 文档说明

- [项目介绍.md](项目介绍.md)：课程提交用的项目背景、目标、需求和可行性介绍。
- [docs/系统设计手册.md](docs/系统设计手册.md)：系统边界、硬件架构、软件架构、机器人作业流程、安全机制和测试方案。
- [docs/演示说明.md](docs/演示说明.md)：组员答辩时的演示入口、操作步骤和讲解顺序。

