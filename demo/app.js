const fallbackItems = [
  { id: "keys", name: "钥匙", category: "随身物品", hasTag: true, tagType: "RFID", tagId: "RFID-KEY-001", commonLocations: ["玄关柜", "客厅茶几"], graspType: "小物体夹取", priority: 1 },
  { id: "wallet", name: "钱包", category: "随身物品", hasTag: true, tagType: "BLE", tagId: "BLE-WALLET-002", commonLocations: ["玄关托盘", "卧室床头柜", "客厅茶几"], graspType: "扁平物体夹取", priority: 1 },
  { id: "phone", name: "手机", category: "电子设备", hasTag: false, tagType: "无", tagId: "", commonLocations: ["餐桌", "卧室床头柜"], graspType: "薄片物体夹取", priority: 1 },
  { id: "earphones", name: "耳机", category: "电子设备", hasTag: true, tagType: "BLE", tagId: "BLE-EAR-003", commonLocations: ["书桌", "玄关柜"], graspType: "小物体夹取", priority: 2 },
  { id: "umbrella", name: "雨伞", category: "天气用品", hasTag: true, tagType: "RFID", tagId: "RFID-UMB-004", commonLocations: ["玄关伞架", "门后挂钩"], graspType: "长条物体夹取", priority: 2 },
  { id: "glasses", name: "眼镜", category: "个人用品", hasTag: false, tagType: "无", tagId: "", commonLocations: ["卧室床头柜", "书桌"], graspType: "易碎物品谨慎夹取", priority: 1 },
  { id: "medicine_box", name: "药盒", category: "健康用品", hasTag: true, tagType: "NFC", tagId: "NFC-MED-006", commonLocations: ["餐边柜", "卧室床头柜"], graspType: "小盒体夹取", priority: 1 },
  { id: "folder", name: "文件夹", category: "办公用品", hasTag: false, tagType: "无", tagId: "", commonLocations: ["书桌", "书架"], graspType: "薄片物体夹取", priority: 2 },
  { id: "laptop", name: "电脑", category: "电子设备", hasTag: true, tagType: "UWB", tagId: "UWB-LAP-008", commonLocations: ["书桌", "工作包"], graspType: "大件物品需用户确认", priority: 2 },
  { id: "id_card", name: "证件", category: "重要证件", hasTag: true, tagType: "NFC", tagId: "NFC-ID-009", commonLocations: ["钱包", "玄关抽屉"], graspType: "薄片物体夹取", priority: 1 },
  { id: "water_bottle", name: "水杯", category: "生活用品", hasTag: false, tagType: "无", tagId: "", commonLocations: ["餐桌", "厨房台面"], graspType: "圆柱物体夹取", priority: 3 },
  { id: "coat", name: "外套", category: "衣物", hasTag: false, tagType: "无", tagId: "", commonLocations: ["玄关衣架", "卧室衣柜"], graspType: "柔性物品需用户协助", priority: 2 }
];

const fallbackEnvironment = {
  weatherOptions: [
    { name: "晴天", recommendations: [] },
    { name: "下雨", recommendations: ["雨伞"] },
    { name: "降温", recommendations: ["外套"] }
  ],
  trafficOptions: [
    { name: "通畅", delayMinutes: 0, message: "当前路况通畅。" },
    { name: "缓行", delayMinutes: 8, message: "当前路况缓行，建议预留时间。" },
    { name: "拥堵", delayMinutes: 15, message: "当前路况拥堵，建议提前 15 分钟出门。" }
  ],
  scheduleOptions: [
    { name: "无", recommendations: [] },
    { name: "会议", recommendations: ["电脑", "文件夹", "证件"] },
    { name: "就医", recommendations: ["药盒", "证件", "眼镜"] },
    { name: "运动", recommendations: ["水杯", "耳机"] }
  ],
  habitRules: [
    { scene: "上班", items: ["钥匙", "钱包", "手机", "耳机"], weight: 0.82 },
    { scene: "会议", items: ["电脑", "文件夹", "证件"], weight: 0.76 },
    { scene: "就医", items: ["药盒", "眼镜", "证件"], weight: 0.88 },
    { scene: "运动", items: ["水杯", "耳机"], weight: 0.69 }
  ]
};

const state = {
  items: fallbackItems,
  environment: fallbackEnvironment,
  finalItems: [],
  recommendations: [],
  steps: [],
  timer: null,
  current: -1
};

const $ = (id) => document.getElementById(id);

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("读取失败");
    return await response.json();
  } catch {
    return fallback;
  }
}

function normalizeItems(text) {
  return text
    .split(/[、,，\s\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(list) {
  return [...new Set(list)];
}

function findOption(list, name) {
  return list.find((item) => item.name === name) || list[0];
}

function buildRecommendations(inputItems) {
  const scene = $("sceneSelect").value;
  const weather = findOption(state.environment.weatherOptions, $("weatherSelect").value);
  const traffic = findOption(state.environment.trafficOptions, $("trafficSelect").value);
  const schedule = findOption(state.environment.scheduleOptions, $("scheduleSelect").value);
  const habit = state.environment.habitRules.find((rule) => rule.scene === scene);
  const result = [];

  weather.recommendations.forEach((name) => result.push({ name, reason: `天气为${weather.name}` }));
  schedule.recommendations.forEach((name) => result.push({ name, reason: `日程为${schedule.name}` }));
  if (habit) {
    habit.items.forEach((name) => {
      if (!inputItems.includes(name)) result.push({ name, reason: `${scene}场景习惯携带` });
    });
  }

  const merged = [];
  result.forEach((item) => {
    if (!inputItems.includes(item.name) && !merged.some((x) => x.name === item.name)) merged.push(item);
  });

  return { recommendations: merged, traffic };
}

function itemInfo(name) {
  return state.items.find((item) => item.name === name) || {
    name,
    hasTag: false,
    tagType: "无",
    commonLocations: ["用户指定区域"],
    graspType: "人工确认后处理",
    priority: 9
  };
}

function buildSteps(finalItems) {
  const sorted = [...finalItems].sort((a, b) => itemInfo(a).priority - itemInfo(b).priority);
  const steps = [
    "解析用户清单并生成结构化任务",
    "读取天气、交通、日程和用户习惯模拟数据",
    "生成最终准备清单并规划搜索顺序"
  ];

  sorted.forEach((name) => {
    const info = itemInfo(name);
    const firstLocation = info.commonLocations[0];
    steps.push(`导航到${firstLocation}搜索${name}`);
    steps.push(`${info.hasTag ? `通过${info.tagType}标签辅助确认` : "通过视觉识别确认"}${name}`);
    steps.push(`采用“${info.graspType}”策略抓取${name}`);
    steps.push(`将${name}放置到玄关整理区并更新状态`);
  });

  steps.push("生成最终出门提醒并完成任务");
  return steps;
}

function renderChips(container, items, withReason = false) {
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = '<span class="chip">无额外推荐</span>';
    return;
  }
  items.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = withReason ? "chip reason" : "chip";
    chip.textContent = withReason ? `${item.name}：${item.reason}` : item;
    container.appendChild(chip);
  });
}

function log(message) {
  const li = document.createElement("li");
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  li.innerHTML = `<time>${time}</time>${message}`;
  $("logList").prepend(li);
}

function updateMetrics(done = 0, running = 0, error = 0) {
  $("pendingCount").textContent = Math.max(state.steps.length - done - running - error, 0);
  $("runningCount").textContent = running;
  $("doneCount").textContent = done;
  $("errorCount").textContent = error;
}

function renderSteps() {
  const list = $("taskSteps");
  list.innerHTML = "";
  state.steps.forEach((step, index) => {
    const li = document.createElement("li");
    if (index < state.current) li.className = "done";
    if (index === state.current) li.className = "current";
    li.innerHTML = `<span>${step}</span><span class="state">${index < state.current ? "已完成" : index === state.current ? "执行中" : "待处理"}</span>`;
    list.appendChild(li);
  });
}

function generateTask() {
  clearInterval(state.timer);
  const inputItems = unique(normalizeItems($("itemInput").value));
  const { recommendations, traffic } = buildRecommendations(inputItems);
  const finalItems = unique([...inputItems, ...recommendations.map((item) => item.name)]);

  state.finalItems = finalItems;
  state.recommendations = recommendations;
  state.steps = buildSteps(finalItems);
  state.current = -1;

  renderChips($("recommendations"), recommendations, true);
  renderChips($("finalList"), finalItems);
  $("trafficTip").textContent = traffic.message;
  renderSteps();
  updateMetrics(0, 0, 0);
  log(`生成任务：最终清单为 ${finalItems.join("、")}。`);
  if (recommendations.length) {
    log(`系统建议：${recommendations.map((item) => `${item.name}（${item.reason}）`).join("、")}。`);
  }
}

function runSimulation() {
  if (!state.steps.length) generateTask();
  clearInterval(state.timer);
  state.current = 0;
  renderSteps();
  updateMetrics(0, 1, 0);
  log("开始模拟执行机器人作业流程。");

  state.timer = setInterval(() => {
    const finished = state.current + 1;
    log(state.steps[state.current]);
    state.current += 1;
    if (state.current >= state.steps.length) {
      clearInterval(state.timer);
      updateMetrics(state.steps.length, 0, 0);
      renderSteps();
      log("任务完成：所有物品已模拟放置到玄关整理区。");
      return;
    }
    updateMetrics(finished, 1, 0);
    renderSteps();
  }, 900);
}

function resetDemo() {
  clearInterval(state.timer);
  $("itemInput").value = "钥匙、钱包、耳机";
  $("sceneSelect").value = "上班";
  $("weatherSelect").value = "下雨";
  $("trafficSelect").value = "拥堵";
  $("scheduleSelect").value = "无";
  $("logList").innerHTML = "";
  generateTask();
}

async function init() {
  state.items = await loadJson("../data/mock_items.json", fallbackItems);
  state.environment = await loadJson("../data/mock_environment.json", fallbackEnvironment);
  $("generateBtn").addEventListener("click", generateTask);
  $("runBtn").addEventListener("click", runSimulation);
  $("resetBtn").addEventListener("click", resetDemo);
  generateTask();
}

init();
