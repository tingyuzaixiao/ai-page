<template>
  <el-dialog title="快捷键" width="420" v-model="visible" :close-on-click-modal="false" draggable @close="$emit('close')">
    <!-- <el-input v-model="filterTagName" style="height: 35px; width: 100%; margin-bottom: 5px;" placeholder="请输入快捷键名称"
      :suffix-icon="Search" @focus="filterVisible = true" @blur="filterVisible = false" /> -->
    <el-table :data="formattedShortcutData" style="width: 100%; max-height: 550px; overflow-y: auto;">
      <el-table-column label="名称" width="210">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-icon v-if="scope.row.icon">
              <component :is="scope.row.icon"></component>
            </el-icon>
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="快捷键" width="120">
        <template #default="scope">
          <el-tag @click="openEditDialog(scope.row)" class="cursor-pointer">
            {{ scope.row.key }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 20px;">
      <span style="margin-right: 5px;">按下</span>
      <el-tag>Ctrl + Alt</el-tag>
      <span style="margin-left: 5px;">快速打开快捷键对话框</span>
    </div>
  </el-dialog>
  <!-- 弹出对话框 -->
  <el-dialog v-model="dialogVisible" title="" width="400px" :show-close="false" @opened="focusInput">
    <template #header></template>
    <div style="display: flex; justify-content: center; align-items: center;">
      <span>先按所需的组合键, 再按 Enter 键</span>
    </div>
    <el-form style="margin-top: 20px;">
      <el-form-item>
        <el-input ref="shortcutInput" v-model="editingRow.key" placeholder="请按下快捷键" readonly
          input-style="text-align: center;" @keydown.prevent="captureShortcut" autofocus />
      </el-form-item>
    </el-form>
    <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
      <span>{{ editingRow.key }}</span>
    </div>
    <div style="display: flex; justify-content: center; align-items: center; margin-top: 5px;">
      <span v-show="haveMore > 0">已有{{ haveMore }}条按键的快捷绑定与此相同</span>
    </div>
  </el-dialog>
</template>

<script setup lang="tsx" name="ShortCutKey">
import { ref, defineExpose } from 'vue'

import { useMessage } from '/@/hooks/message';
import { ElInput } from "element-plus";
import { addShortcut, putShortcut, getShortcut } from '/@/api/annotate/labelShortcut';

// Emit事件，父组件通过事件与子组件交互
const emit = defineEmits(['close', 'mounted']);

const taskType = ref(0);

interface ShortcutRow {
  name: string
  key: string
}


const generalShortcut = ref<Record<string, string>>({
  "删除标注": "Delete",
  "保存标注": "Ctrl + S",
  "适配大小": "Ctrl + R",
  "切换单多图": "Ctrl + F",
  "上一张": "A",
  "下一张": "D"
});

const classifyShortcut = ref<Record<string, string>>({
  "清空选中项": "TAB",
  "显示或隐藏标签栏": "Ctrl + E"
});

const detectShortcut = ref<Record<string, string>>({
  "撤销": "Ctrl + Z",
  "重做": "Ctrl + X",
  "矩形框": "Shift + !",
  "直线": "Shift + *",
  "圆框": "Shift + @",
  "修订模式": "Shift + ~"
});

const segmentShortcut = ref<Record<string, string>>({
  "撤销": "Ctrl + Z",
  "重做": "Ctrl + X",
  "直线": "Shift + *",
  "多边形框": "Shift + #",
  "圆框": "Shift + @",
  "钢笔": "Shift + $",
  "刷子": "Shift + %",
  // "分割一切": "Shift + ^",
  "修订模式": "Shift + ~"
});


const shortcutMap = ref<Record<string, string>>({});

const dialogVisible = ref(false)
const editingRow = ref<ShortcutRow>({ name: '', key: '' })
const haveMore = ref(0)
const shortcutInput = ref<InstanceType<typeof ElInput> | null>(null);
const havenSaved = ref(false);

// 计算属性：转换 `shortcutMap` 为数组格式
const formattedShortcutData = computed(() =>
  Object.entries(shortcutMap.value).map(([name, key]) => ({ name, key }))
);

// 打开对话框，并存储当前行的数据
const openEditDialog = (row: ShortcutRow) => {
  editingRow.value = { ...row } // 复制对象，防止修改原数据
  dialogVisible.value = true
}

const focusInput = () => {
  nextTick(() => {
    if (shortcutInput.value) {
      shortcutInput.value.focus();
    }
  });
};

// 关闭对话框并保存修改
const saveEdit = async () => {
  if (!editingRow.value) return;

  const { name, key } = editingRow.value;
  if (!name || !key) return; // 确保 `name` 和 `key` 有值

  // **更新 `shortcutMap`（快捷键映射表）**
  if (generalShortcut.value[name] !== undefined) {
    generalShortcut.value[name] = key;
  } else if (taskType.value === 0 && classifyShortcut.value[name] !== undefined) {
    classifyShortcut.value[name] = key;
  } else if (taskType.value === 1 && detectShortcut.value[name] !== undefined) {
    detectShortcut.value[name] = key;
  } else {
    segmentShortcut.value[name] = key;
  }

  // **构造提交数据**
  const addForm = {
    shortcutId: '',
    generalShortcut: JSON.stringify(generalShortcut.value),
    classifyShortcut: JSON.stringify(classifyShortcut.value),
    detectShortcut: JSON.stringify(detectShortcut.value),
    segmentShortcut: JSON.stringify(segmentShortcut.value),
  };

  try {
    if (havenSaved.value) {
      addForm.shortcutId = shortcutId.value;
      const res = await putShortcut(addForm);
      if (res.data) {
        useMessage().success("快捷键已保存");
        shortcutMap.value[name] = key;
        saveToLocalStorage();
      } else {
        useMessage().error("保存失败，请重试！");
      }
    } else {
      addForm.shortcutId = '';
      const res = await addShortcut(addForm);
      if (res.data) {
        useMessage().success("快捷键已保存");
        shortcutMap.value[name] = key;
        havenSaved.value = true;
        try {
          // **获取快捷键数据**
          const res = await getShortcut();
          if (res.data) {
            havenSaved.value = true;
            generalShortcut.value = JSON.parse(res.data.generalShortcut);
            classifyShortcut.value = JSON.parse(res.data.classifyShortcut);
            detectShortcut.value = JSON.parse(res.data.detectShortcut);
            segmentShortcut.value = JSON.parse(res.data.segmentShortcut);
            shortcutId.value = res.data.shortcutId;
            saveToLocalStorage();
          } else {
            havenSaved.value = false;
          }
          switch (taskType.value) {
            case 0:
              shortcutMap.value = { ...generalShortcut.value, ...classifyShortcut.value };
              break;
            case 1:
              shortcutMap.value = { ...generalShortcut.value, ...detectShortcut.value };
              break;
            default:
              shortcutMap.value = { ...generalShortcut.value, ...segmentShortcut.value };
              break;
          }
        } catch (error) {
          console.error("获取快捷键失败:", error);
        }
      } else {
        useMessage().error("保存失败，请重试！");
      }
    }
    dialogVisible.value = false; // 关闭对话框
  } catch (error) {
    useMessage().error("保存失败，请重试！");
  }
};


const captureShortcut = (event: KeyboardEvent) => {

  event.preventDefault(); // 阻止默认输入
  let keys = [];
  haveMore.value = 0;

  if (event.ctrlKey) keys.push("Ctrl");
  if (event.altKey) keys.push("Alt");
  if (event.shiftKey) keys.push("Shift");
  if (event.metaKey) keys.push("Cmd"); // Mac 下的 Command 键

  if (!["Control", "Alt", "Shift", "Meta", "Enter"].includes(event.key)) {
    keys.push(event.key.toUpperCase()); // 捕获按键
  }

  // **按下 Enter 键时，保存并关闭对话框**
  if (event.key === "Enter") {
    saveEdit()
  } else {
    editingRow.value.key = keys.join(" + "); // 更新 el-input 显示的快捷键
    // **检查是否有重复的快捷键**
    haveMore.value = Object.values(shortcutMap.value).filter((key) => key === editingRow.value.key).length;
  }
};

const storageKey = "shortcutData";
/** 保存到 localStorage */
const saveToLocalStorage = () => {
  try {
    // 将 computed() 的值展开成一个普通对象，避免循环引用
    const shortcutData = {
      id: shortcutId.value, // 存储 shortcutId
      type: taskType.value, // 存储任务类型
      generalShortcut: { ...generalShortcut.value },
      classifyShortcut: { ...classifyShortcut.value },
      detectShortcut: { ...detectShortcut.value },
      segmentShortcut: { ...segmentShortcut.value }, // 存储快捷键数据
    };
    localStorage.setItem(storageKey, JSON.stringify(shortcutData));
    console.log("数据已成功保存到 localStorage");
  } catch (error) {
    console.error("保存数据失败:", error);
  }
};


/** **从 localStorage 读取数据并更新 `shortcutMap`** */
const loadFromLocalStorage = (type: number): boolean => {
  try {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return false; // 没有数据，返回 false

    const parsedData: { id?: string; type?: number; generalShortcut: Record<string, string>, classifyShortcut: Record<string, string>, detectShortcut: Record<string, string>, segmentShortcut: Record<string, string> } = JSON.parse(storedData);

    // **更新 `shortcutId`**
    shortcutId.value = parsedData.id || ""; // 避免 undefined

    // // **更新 `shortcutMap`（确保 Vue 响应式生效）**
    // Object.keys(parsedData.shortcuts).forEach((name) => {
    //   if (shortcutMap.value[name] !== undefined) {
    //     shortcutMap.value[name] = parsedData.shortcuts[name]; // 仅更新 `key`
    //   }
    // });
    if (type === 0) {
      shortcutMap.value = { ...parsedData.generalShortcut, ...parsedData.classifyShortcut };
    } else if (type === 1) {
      shortcutMap.value = { ...parsedData.generalShortcut, ...parsedData.detectShortcut };
    } else {
      shortcutMap.value = { ...parsedData.generalShortcut, ...parsedData.segmentShortcut };
    }

    console.log("数据已成功从 localStorage 读取:", shortcutMap.value);
    return true;
  } catch (error) {
    console.error("读取数据失败:", error);
    return false;
  }
};

const updateShortcutList = (taskType: string) => {
  const storedData = localStorage.getItem(storageKey);
  console.log("storedData", storedData);
  if (!storedData) return {}; // 没有数据，返回 false

  const parsedData: { id?: string; type?: number; generalShortcut: Record<string, string>, classifyShortcut: Record<string, string>, detectShortcut: Record<string, string>, segmentShortcut: Record<string, string> } = JSON.parse(storedData);
  if (taskType === '0') {
    return { ...parsedData.generalShortcut, ...parsedData.classifyShortcut };
  } else if (taskType === '1') {
    return { ...parsedData.generalShortcut, ...parsedData.detectShortcut };
  } else {
    return { ...parsedData.generalShortcut, ...parsedData.segmentShortcut };
  }

};

const getShortcutList = async (taskType: string) => {
  try {
    // **获取快捷键数据**
    const res = await getShortcut();
    if (res.data && res.data.generalShortcut) {
      // 解析 JSON 数据
      generalShortcut.value = JSON.parse(res.data.generalShortcut || '{}');
      classifyShortcut.value = JSON.parse(res.data.classifyShortcut || '{}');
      detectShortcut.value = JSON.parse(res.data.detectShortcut || '{}');
      segmentShortcut.value = JSON.parse(res.data.segmentShortcut || '{}');
      shortcutId.value = res.data.shortcutId;
      saveToLocalStorage();

      // 返回对应的快捷键数据
      return {
        '0': { ...generalShortcut.value, ...classifyShortcut.value },
        '1': { ...generalShortcut.value, ...detectShortcut.value },
        '2': { ...generalShortcut.value, ...segmentShortcut.value }
      }[taskType] || generalShortcut.value;
    } else {
      // 默认值（如果 `res.data.generalShortcut` 为空）
      const defaultShortcuts = {
        generalShortcut: generalShortcut.value || {},
        classifyShortcut: classifyShortcut.value || {},
        detectShortcut: detectShortcut.value || {},
        segmentShortcut: segmentShortcut.value || {}
      };

      // // **保存默认快捷键**
      // try {
      //   const res = await addShortcut({
      //     shortcutId: '',
      //     generalShortcut: JSON.stringify(defaultShortcuts.generalShortcut),
      //     classifyShortcut: JSON.stringify(defaultShortcuts.classifyShortcut),
      //     detectShortcut: JSON.stringify(defaultShortcuts.detectShortcut),
      //     segmentShortcut: JSON.stringify(defaultShortcuts.segmentShortcut),
      //   });
      //   if (res.data) {
      //     try {
      //       // **获取快捷键数据**
      //       const res = await getShortcut();
      //       if (res.data) {
      //         havenSaved.value = true;
      //         shortcutId.value = res.data.shortcutId;
      //         saveToLocalStorage();
      //       } else {
      //         havenSaved.value = false;
      //       }
      //     } catch (error) {
      //       console.error("获取快捷键失败:", error);
      //     }
      //   } else {
      //     useMessage().error("保存失败，请重试！");
      //   }
      // } catch (error) {
      //   console.error("保存快捷键失败:", error);
      // }

      // 返回对应的快捷键数据
      return {
        '0': { ...defaultShortcuts.generalShortcut, ...defaultShortcuts.classifyShortcut },
        '1': { ...defaultShortcuts.generalShortcut, ...defaultShortcuts.detectShortcut },
        '2': { ...defaultShortcuts.generalShortcut, ...defaultShortcuts.segmentShortcut }
      }[taskType] || defaultShortcuts.generalShortcut;
    }
  } catch (error) {
    console.error("获取快捷键失败:", error);
    return {}; // **返回空对象，防止 undefined 影响代码**
  }
};

const visible = ref(false);
const shortcutId = ref('');

/** **打开对话框并加载数据** */
const openDialog = async (type: number) => {
  taskType.value = type;

  // **加载本地存储数据**
  const result = loadFromLocalStorage(type);


  if (result) {
    if (shortcutId.value) {
      havenSaved.value = true;
    } else {
      havenSaved.value = false;
    }
  } else {
    try {
      // **获取快捷键数据**
      const res = await getShortcut();
      if (res.data && res.data.generalShortcut) {
        havenSaved.value = true;
        generalShortcut.value = JSON.parse(res.data.generalShortcut);
        classifyShortcut.value = JSON.parse(res.data.classifyShortcut);
        detectShortcut.value = JSON.parse(res.data.detectShortcut);
        segmentShortcut.value = JSON.parse(res.data.segmentShortcut);
        shortcutId.value = res.data.shortcutId;
        saveToLocalStorage();
      } else {
        havenSaved.value = false;
        saveToLocalStorage();
      }
      switch (taskType.value) {
        case 0:
          shortcutMap.value = { ...generalShortcut.value, ...classifyShortcut.value };
          break;
        case 1:
          shortcutMap.value = { ...generalShortcut.value, ...detectShortcut.value };
          break;
        default:
          shortcutMap.value = { ...generalShortcut.value, ...segmentShortcut.value };
          break;
      }
      console.log("获取快捷键:", res.data);
    } catch (error) {
      console.error("获取快捷键失败:", error);
    }
  }

  visible.value = true;
};

onMounted(() => {
  console.log('ShortCutKey 组件已挂载');
  emit('mounted'); // 触发 mounted 事件
});

defineExpose({
  openDialog,
  dialogVisible,
  getShortcutList,
  updateShortcutList,
  saveToLocalStorage
});

</script>

<style scoped>
.table-v2-inline-editing-trigger {
  border: 1px transparent dotted;
  padding: 4px;
}

.table-v2-inline-editing-trigger:hover {
  border-color: var(--el-color-primary);
}
</style>