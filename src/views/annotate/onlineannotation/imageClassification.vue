<template>
  <div class="layout-padding">
    <div class="layout-padding-auto layout-padding-view" v-loading="handelLoading" ref="mainDiv"
      @mousedown="handleMouseDown">
      <div class="flex gap-2 justify-center items-center">
        <!-- 左边部分：显示文件名称、文件大小、无标注信息和有标注信息 -->
        <div v-show="mode" class="flex gap-10 w-full items-center justify-between">
          <!-- Tab页 -->
          <div style="flex: 0 0 auto;" class="tab-pane mt-[3.5px]">
            <el-tabs v-model="activeName" @tab-click="handleTabsClick">
              <el-tab-pane :label="`${t('onlineAnnotation.all')} (${totalImageNum})`" name="first"></el-tab-pane>
              <el-tab-pane
                :label="`${t('onlineAnnotation.noAnnotation')} (${totalImageNum - tagedNumber < 0 ? 0 : totalImageNum - tagedNumber})`"
                name="second" :disabled="totalImageNum - tagedNumber === 0"></el-tab-pane>
              <el-tab-pane :label="`${t('onlineAnnotation.hasAnnotation')} (${tagedNumber})`" name="third"
                :disabled="tagedNumber === 0"></el-tab-pane>
            </el-tabs>
          </div>
          <!-- 文件名称 -->
          <div class="middle-block">
            <el-tooltip :content="imageList[selectedIndex] ? imageList[selectedIndex].fileName : ''" placement="top"
              :disabled="!overflowIndexes.has(imageList[selectedIndex] ? imageList[selectedIndex].fileName : '')">
              <span v-overflow="handleOverflow(imageList[selectedIndex] ? imageList[selectedIndex].fileName : '')"
                class="file-name">
                {{ t('onlineAnnotation.fileName') }}：{{ imageList[selectedIndex] ? imageList[selectedIndex].fileName :
                  ''
                }}
              </span>
            </el-tooltip>
          </div>
          <!-- 右边部分：文件大小 + 翻页 + 工具图标 -->
          <div class="flex gap-2" style="flex:1 1 auto; justify-content: flex-end;">
            <!-- 文件大小 -->
            <div v-show="mode" class="file-size-wrapper">
              <span class="file-size">
                {{ t('onlineAnnotation.fileSize') }}：{{ fileSize }}
              </span>
            </div>
            <!-- 翻页 -->
            <div v-show="mode" class="page-info">
              <el-icon>
                <el-tooltip class="item" effect="light" :content="`上一张(${getShortcutKey('上一张')})`" placement="top"
                  :hide-after="0">
                  <ArrowLeftBold
                    :class="{ 'cursor-not-allowed': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) === 1, 'cursor-pointer hover:text-[#2e5cf6]': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) !== 1 }"
                    @click="lastNumber" />
                </el-tooltip>
              </el-icon>
              <span style="user-select: none;">&nbsp;{{ "第 " + (selectedIndex + 1 + page.pageSize * (page.pageNum - 1))
                +
                " 张 / 共 " + selectedImageTotal + " 张" }}&nbsp;</span>
              <el-icon>
                <el-tooltip class="item" effect="light" :content="`下一张(${getShortcutKey('下一张')})`" placement="top"
                  :hide-after="0">
                  <ArrowRightBold :class="{
                    'cursor-not-allowed': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) === (activeName === 'first' ? totalImageNum : activeName === 'second' ? totalImageNum -
                      tagedNumber :
                      tagedNumber), 'cursor-pointer hover:text-[#2e5cf6]': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) !== (activeName === 'first' ? totalImageNum : activeName === 'second' ? totalImageNum -
                        tagedNumber :
                        tagedNumber)
                  }" @click="nextNumber" />
                </el-tooltip>
              </el-icon>
            </div>
            <!-- <el-tooltip class="item" effect="light" content="统计分析" placement="top" :hide-after="0">
            <DataAnalysis class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]"
              @click="barEchartsRef.openDialog(state.queryForm.taskId)" />
          </el-tooltip> -->
            <el-tooltip class="item" effect="light" :content="`删除标注(${getShortcutKey('删除标注')})`" placement="top"
              :hide-after="0">
              <Delete class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]" @click="handleDelete" />
            </el-tooltip>
            <el-tooltip class="item" effect="light" :content="`保存标注(${getShortcutKey('保存标注')})`" placement="top"
              :hide-after="0">
              <Collection class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]" @click="handleSave" />
            </el-tooltip>
            <el-tooltip v-if="!mode" class="item" effect="light" :content="`清空选中项(${getShortcutKey('清空选中项')})`"
              placement="top" :hide-after="0">
              <Brush class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]" @click="clearSelectedList" />
            </el-tooltip>
            <el-popconfirm title="" hide-icon placement="bottom" trigger="click" :width="300"
              :visible="referToolVisible" @cancel="referToolVisible = false" @confirm="configReferLabel">
              <template #reference>
                <span>
                  <el-tooltip class="item" effect="light" content="参考标签" placement="top" :hide-after="0">
                    <template #default>
                      <el-badge :hidden="selectedTaskId === '' || showReference === '1'" is-dot
                        class="item mt-0.5 mr-2">
                        <Discount class="w-5 h-5 mr-1 cursor-pointer hover:text-[#2e5cf6]" @click="showReferLabel"
                          @contextmenu.prevent="getTaskList" />
                      </el-badge>
                    </template>
                  </el-tooltip>
                </span>
              </template>
              <template #actions="{ confirm, cancel }">
                <el-select v-model="selectedTaskId" placeholder="请选择标注任务作为参考标签显示"
                  style="width: 270px; margin-bottom: 8px;">
                  <el-option v-for="item in taskList" :key="item.taskId" :label="item.taskName" :value="item.taskId" />
                </el-select>
                <div style="text-align: center;">
                  <el-radio-group v-model="showReference">
                    <el-radio value="0">全部</el-radio>
                    <el-radio value="1">标注标签</el-radio>
                    <el-radio value="2">参考标签</el-radio>
                  </el-radio-group>
                </div>
                <div style="text-align: right; margin-top: 10px;">
                  <el-button size="small" text @click="cancel">取消</el-button>
                  <el-button size="small" type="primary" @click="confirm">确定</el-button>
                </div>
              </template>
            </el-popconfirm>
            <!-- <el-popconfirm title="" hide-icon placement="bottom" trigger="click" :width="230"
              :visible="magicToolVisible" @cancel="magicToolVisible = false" @confirm="smartLabeling">
              <template #reference>
                <span>
                  <el-tooltip class="item" effect="light" content="智能标注" placement="top" :hide-after="0">
                    <template #default>
                      <Pointer class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]" @click="smartLabeling"
                        @contextmenu.prevent="magicToolVisible = !magicToolVisible" />
                    </template>
                  </el-tooltip>
                </span>
              </template>
              <template #actions="{ confirm, cancel }">
                <el-input v-model="modelUrl" placeholder="请输入模型URL"
                  style="width: 200px; margin-bottom: 8px;"></el-input>
                <div style="text-align: right; margin-top: 10px;">
                  <el-button size="small" text @click="cancel">取消</el-button>
                  <el-button size="small" type="primary" @click="confirm">确定</el-button>
                </div>
              </template>
            </el-popconfirm> -->
            <!-- <el-tooltip class="item" effect="light" :content="`参考标签(${getShortcutKey('参考标签')})`" placement="top"
              :hide-after="0">
              <Discount class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]" @click="handleDelete" />
            </el-tooltip> -->
            <el-tooltip class="item" effect="light" content="智能标注" placement="top" :hide-after="0">
              <template #default>
                <el-badge :hidden="!smartSetted" is-dot class="item mt-0.5 mr-2">
                  <Pointer class="w-5 h-5 mr-1 cursor-pointer hover:text-[#2e5cf6]" @click="smartClick"
                    @contextmenu.prevent="openSmartDialog" />
                </el-badge>
              </template>
            </el-tooltip>
            <el-drawer ref="drawerRef" v-model="smartDialog" title="智能标注功能配置" :before-close="handleClose"
              direction="rtl" custom-class="demo-drawer">
              <el-form :model="smartForm">
                <el-form-item label="URL" label-width="70px">
                  <div class="flex items-center gap-2 w-full">
                    <el-input v-model="smartURL" autocomplete="off" class="flex-1" />
                    <el-button type="primary" @click="readParamsFile" class="ml-auto">加载参数</el-button>
                  </div>
                </el-form-item>
                <template v-if="smartTaskList.length > 0">
                  <el-form-item label="任务名称" label-width="70px">
                    <el-select v-model="smartForm.task" placeholder="请选择任务名称和类型" @change="changeSelectTask">
                      <el-option v-for="(task, index) in smartTaskList" :key="index"
                        :label="`${task.name} - ${task.type}`" :value="`${task.name}`" />
                    </el-select>
                  </el-form-item>
                </template>
                <!-- 动态显示 params 的输入框 -->
                <template v-if="currentParams">
                  <el-divider border-style="dashed" />
                  <div class="ml-0.5 mb-4">任务参数</div>
                  <div class="flex flex-wrap -mx-2 max-h-120 overflow-y-auto">
                    <el-form-item v-for="(value, key, index) in currentParams" :key="key" :label="key + ':'"
                      class="w-1/2 px-2" label-width="70px">
                      <el-input v-model="(smartForm.params as { [key: string]: string })[key]" />
                    </el-form-item>
                  </div>
                </template>
              </el-form>
              <div class="mt-5 flex justify-end items-start">
                <el-button @click="cancelForm">取消</el-button>
                <el-button type="primary" :loading="loading" @click="setSmartClick">{{
                  loading ? '提交中 ...' : '提交'
                }}</el-button>
              </div>
            </el-drawer>
            <el-tooltip class="item" effect="light" :content="`适配大小(${getShortcutKey('适配大小')})`" placement="top"
              :hide-after="0">
              <ScaleToOriginal v-show="mode" class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]"
                @click="instance.fitZoom()" />
            </el-tooltip>
            <el-tooltip class="item" effect="light" :content="offlineStatus ? '切换文件源(云端)' : '切换文件源(本地)'" placement="top"
              :hide-after="0">
              <i :class="['iconfont', 'w-5', 'h-5', 'mr-3', 'mt-[-3.5px]', 'cursor-pointer hover:text-[#2e5cf6]', 'icon-celvewenjian-lixian', 'fs-21']"
                @click="changeOfflinePath"></i>
            </el-tooltip>
            <el-tooltip class="item" effect="light"
              :content="mode ? `多图(${getShortcutKey('切换单多图')})` : `单图(${getShortcutKey('切换单多图')})`" placement="top"
              :hide-after="0">
              <Switch class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]" @click="changeMode" />
            </el-tooltip>
          </div>
        </div>
        <!-- 右边部分：文件大小 + 翻页 + 工具图标 -->
        <div v-show="!mode" class="flex items-center justify-between" style="flex:3;">
          <!-- 左侧内容：Tabs + 输入框 + 标签 -->
          <div class="flex items-center" style="flex: 1 1 auto;">
            <!-- Tabs -->
            <div class="flex tag-msg" style="margin-right: 20px;">
              <el-tabs v-model="activeName" @tab-click="handleTabsClick">
                <el-tab-pane :label="`${t('onlineAnnotation.all')} (${totalImageNum})`" name="first"></el-tab-pane>
                <el-tab-pane
                  :label="`${t('onlineAnnotation.noAnnotation')} (${totalImageNum - tagedNumber < 0 ? 0 : totalImageNum - tagedNumber})`"
                  name="second" :disabled="totalImageNum - tagedNumber === 0"></el-tab-pane>
                <el-tab-pane :label="`${t('onlineAnnotation.hasAnnotation')} (${tagedNumber})`" name="third"
                  :disabled="tagedNumber === 0"></el-tab-pane>
              </el-tabs>
            </div>
            <!-- 文件名称 -->
            <div class="filter-msg flex items-center ml-10 mr-12">
              <span class="mr-3">文件名称</span>
              <el-input ref="FilenameRef" v-model="inputFilename" placeholder="请输入文件名称" clearable style="width: 150px;"
                size="default" @focus="handleInput" @clear="handleSelectConfirm" @keyup.enter="handleSelectConfirm"
                @blur="handleSelectConfirm" />
            </div>
            <!-- 标签 -->
            <div class="filter-msg flex items-center">
              <span class="mr-3">标签</span>
              <el-select v-model="selectLabel" placeholder="请选择标签" @change="handleSelectTagChange" clearable
                style="width: 120px;">
                <el-option v-for="item in selectItem" :key="item.tagId" :label="item.tagName" :value="item.tagId" />
              </el-select>
            </div>
            <!-- 文件目录 -->
            <div class="filter-msg flex items-center ml-10 mr-12">
              <span class="mr-3">文件目录</span>
              <el-tree-select v-model="selectFileName" :data="convertedData" placeholder="全部" check-strictly
                :render-after-expand="false" style="width: 150px;">
              </el-tree-select>
            </div>
          </div>
          <!-- 右边部分：工具图标靠右 -->
          <div class="flex gap-2" style="flex:1 1 auto; justify-content: flex-end;">
            <!-- 文件大小 -->
            <div v-show="mode" class="file-size-wrapper">
              <span class="file-size">
                {{ t('onlineAnnotation.fileSize') }}：{{ fileSize }}
              </span>
            </div>
            <!-- 翻页 -->
            <div v-show="mode" class="page-info">
              <el-icon>
                <el-tooltip class="item" effect="light" :content="`上一张(${getShortcutKey('上一张')})`" placement="top"
                  :hide-after="0">
                  <ArrowLeftBold
                    :class="{ 'cursor-not-allowed': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) === 1, 'cursor-pointer hover:text-[#2e5cf6]': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) !== 1 }"
                    @click="lastNumber" />
                </el-tooltip>
              </el-icon>
              <span style="user-select: none;">&nbsp;{{ "第 " + (selectedIndex + 1 + page.pageSize * (page.pageNum - 1))
                +
                " 张 / 共 " + (activeName === 'first' ? totalImageNum : activeName === 'second' ? (totalImageNum -
                  tagedNumber < 0 ? 0 : totalImageNum - tagedNumber) : tagedNumber) + " 张" }}&nbsp;</span>
                  <el-icon>
                    <el-tooltip class="item" effect="light" :content="`下一张(${getShortcutKey('下一张')})`" placement="top"
                      :hide-after="0">
                      <ArrowRightBold :class="{
                        'cursor-not-allowed': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) === (activeName === 'first' ? totalImageNum : activeName === 'second' ? totalImageNum -
                          tagedNumber :
                          tagedNumber), 'cursor-pointer hover:text-[#2e5cf6]': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) !== (activeName === 'first' ? totalImageNum : activeName === 'second' ? totalImageNum -
                            tagedNumber :
                            tagedNumber)
                      }" @click="nextNumber" />
                    </el-tooltip>
                  </el-icon>
            </div>
            <!-- <el-tooltip class="item" effect="light" content="统计分析" placement="top" :hide-after="0">
            <DataAnalysis class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]"
              @click="barEchartsRef.openDialog(state.queryForm.taskId)" />
          </el-tooltip> -->
            <div class="flex gap-5 h-7">
              <el-tooltip v-if="showTagList && !mode" class="item" effect="light"
                :content="`隐藏标签栏(${getShortcutKey('显示或隐藏标签栏')})`" placement="top" :hide-after="0">
                <Expand class="w-5 h-5 cursor-pointer hover:text-[#2e5cf6]" @click="showTagList = !showTagList" />
              </el-tooltip>
              <el-tooltip v-if="!showTagList && !mode" class="item" effect="light"
                :content="`显示标签栏(${getShortcutKey('显示或隐藏标签栏')})`" placement="top" :hide-after="0">
                <Fold class="w-5 h-5 cursor-pointer hover:text-[#2e5cf6]" @click="showTagList = !showTagList" />
              </el-tooltip>
              <!-- <el-popconfirm title="" hide-icon placement="bottom" trigger="click" :width="300"
              @cancel="magicToolVisible = false" @confirm="magicToolVisible = false">
              <template #reference>
                <span>
                  <el-tooltip class="item" effect="light" content="参考标签" placement="top" :hide-after="0">
                    <template #default>
                      <el-badge :hidden="selectedTaskId === '' || showReference === '1'" is-dot
                        class="item mt-0.5 mr-2">
                        <Discount class="w-5 h-5 mr-1 cursor-pointer hover:text-[#2e5cf6]" @click="magicToolVisible = !magicToolVisible" />
                      </el-badge>
                    </template>
                  </el-tooltip>
                </span>
              </template>
              <template #actions="{ confirm, cancel }">
                <el-select v-model="selectedTaskId" placeholder="请选择标注任务作为参考标签显示"
                  style="width: 270px; margin-bottom: 8px;">
                  <el-option v-for="item in taskList" :key="item.taskId" :label="item.taskName" :value="item.taskId" />
                </el-select>
                <div style="text-align: center;">
                  <el-radio-group v-model="showReference">
                    <el-radio value="0">全部</el-radio>
                    <el-radio value="1">标注标签</el-radio>
                    <el-radio value="2">参考标签</el-radio>
                  </el-radio-group>
                </div>
                <div style="text-align: right; margin-top: 10px;">
                  <el-button size="small" text @click="cancel">取消</el-button>
                  <el-button size="small" type="primary" @click="confirm">确定</el-button>
                </div>
              </template>
            </el-popconfirm> -->
              <el-tooltip class="item" effect="light" :content="`清空选中项(${getShortcutKey('清空选中项')})`" placement="top"
                :hide-after="0">
                <Brush class="w-5 h-5 cursor-pointer hover:text-[#2e5cf6]" @click="clearSelectedList" />
              </el-tooltip>
              <el-tooltip class="item" effect="light" :content="`删除标注(${getShortcutKey('删除标注')})`" placement="top"
                :hide-after="0">
                <Delete class="w-5 h-5 cursor-pointer hover:text-[#2e5cf6]" @click="handleDelete" />
              </el-tooltip>
              <el-tooltip class="item" effect="light" :content="`保存标注(${getShortcutKey('保存标注')})`" placement="top"
                :hide-after="0">
                <Collection class="w-5 h-5 cursor-pointer hover:text-[#2e5cf6]" @click="handleSave" />
              </el-tooltip>
              <el-tooltip class="item" effect="light" content="智能标注" placement="top" :hide-after="0">
                <template #default>
                  <el-badge :hidden="!smartSetted" is-dot class="item">
                    <Pointer class="w-5 cursor-pointer hover:text-[#2e5cf6]" @click="smartClick"
                      @contextmenu.prevent="openSmartDialog" />
                  </el-badge>
                </template>
              </el-tooltip>
              <el-drawer ref="drawerRef" v-model="smartDialog" title="智能标注功能配置" :before-close="handleClose"
                direction="rtl" custom-class="demo-drawer">
                <el-form :model="smartForm">
                  <el-form-item label="URL" label-width="70px">
                    <div class="flex items-center gap-2 w-full">
                      <el-input v-model="smartURL" autocomplete="off" class="flex-1" />
                      <el-button type="primary" @click="readParamsFile" class="ml-auto">加载参数</el-button>
                    </div>
                  </el-form-item>
                  <template v-if="smartTaskList.length > 0">
                    <el-form-item label="任务名称" label-width="70px">
                      <el-select v-model="smartForm.task" placeholder="请选择任务名称和类型" @change="changeSelectTask">
                        <el-option v-for="(task, index) in smartTaskList" :key="index"
                          :label="`${task.name} - ${task.type}`" :value="`${task.name}`" />
                      </el-select>
                    </el-form-item>
                  </template>
                  <!-- 动态显示 params 的输入框 -->
                  <template v-if="currentParams">
                    <el-divider border-style="dashed" />
                    <div class="ml-0.5 mb-4">任务参数</div>
                    <div class="flex flex-wrap -mx-2 max-h-120 overflow-y-auto">
                      <el-form-item v-for="(value, key, index) in currentParams" :key="key" :label="key + ':'"
                        class="w-1/2 px-2" label-width="70px">
                        <el-input v-model="(smartForm.params as { [key: string]: string })[key]" />
                      </el-form-item>
                    </div>
                  </template>
                </el-form>
                <div class="mt-5 flex justify-end items-start">
                  <el-button @click="cancelForm">取消</el-button>
                  <el-button type="primary" :loading="loading" @click="setSmartClick">{{
                    loading ? '提交中 ...' : '提交'
                  }}</el-button>
                </div>
              </el-drawer>
              <el-tooltip class="item" effect="light" :content="offlineStatus ? '切换文件源(云端)' : '切换文件源(本地)'"
                placement="top" :hide-after="0">
                <i :class="['iconfont', 'w-5', 'h-7', 'mt-[-5.5px]', 'cursor-pointer hover:text-[#2e5cf6]', 'icon-celvewenjian-lixian', 'fs-21']"
                  @click="changeOfflinePath"></i>
              </el-tooltip>
              <el-tooltip class="item" effect="light"
                :content="mode ? `多图(${getShortcutKey('切换单多图')})` : `单图(${getShortcutKey('切换单多图')})`" placement="top"
                :hide-after="0">
                <Switch class="w-5 h-5 mr-3 cursor-pointer hover:text-[#2e5cf6]" @click="changeMode" />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <el-divider class="!my-1" border-style="dashed" />
      <div v-show="mode" class="w-full h-full flex overflow-y-auto" v-loading="loading">
        <!-- 左边部分 -->
        <div v-loading="state.loading"
          style="flex: 10; display: flex; flex-direction: column; height: 100%; overflow-x: auto;">
          <div class="left-top" ref="leftTopDiv">
            <!-- 上部分内容 -->
            <FileDirTree ref="fileDirTreeRef" :fileTreeData="fileTreeData" @node-click="handleNodeClick"
              :placeholder="t('onlineAnnotation.dirNameTip')"
              :baseDatasetName="route.query.baseDatasetName as string" />
            <canvas ref="canvasRef" class="canvas-container"></canvas>
            <el-tooltip class="item" effect="light"
              :content="(!originalImageList.includes(selectedList[0]) && existsFile) ? `切换成原图` : `切换成缩略图`"
              placement="left" :hide-after="0">
              <el-button effect="dark"
                class="absolute right-0 top-0 text-black w-auto h-auto text-lg p-2.5 bg-transparent"
                style="border: none; color:#000; width: auto; height: auto; font-size:large; padding: 10px;background-color:  rgba(255, 255, 255, 0.5);"
                @click="changeImagePath">{{
                  (!originalImageList.includes(selectedList[0]) && existsFile) ? "缩略图" : "原图" }}</el-button>
            </el-tooltip>
            <el-popover v-if="taskForm.subLabelType === '0'" placement="top" :width="320" trigger="hover">
              <template #reference>
                <el-tag v-show="isSaved(selectedList[0]) && showReference !== '2'" :color="getTagColor(selectedList[0])"
                  effect="dark" class="absolute right-0 bottom-0"
                  style="border: none; width: auto; height: auto; font-size:xx-large; padding: 10px;">{{
                    getTagContent(selectedList[0]) }}</el-tag>
              </template>
              <el-table :data="labelMsgList">
                <el-table-column width="100" property="tagName" label="标签" />
                <el-table-column width="100" property="confidence" label="置信度" />
                <el-table-column width="100" property="precision" label="准确率" />
              </el-table>
            </el-popover>
            <template v-else="taskForm.subLabelType === '1'">
              <!-- <div v-for="(item, index) in selectionTagList" :key="index">
                <el-tag :color="getTagColor(item)" effect="dark" class="absolute right-0 bottom-0"
                  style="border: none; width: auto; height: auto; font-size:xx-large; padding: 10px;">{{
                    getTagContent(item) }}</el-tag>
              </div> -->
            </template>
            <el-tag v-show="referTagName !== '' && showReference !== '1'" :color="getReferTagColor(referTagName)"
              effect="dark" class="absolute right-0 top-0"
              style="border: none; width: auto; height: auto; font-size:xx-large; padding: 10px;">{{
                referTagName }}</el-tag>
          </div>
          <div class="left-bottom" ref="leftBottomDiv" v-loading="loading">
            <!-- 下部分内容 -->
            <el-icon class="mr-2">
              <el-tooltip class="item" effect="light" :content="t('onlineAnnotation.lastPage')" placement="top"
                :hide-after="0">
                <ArrowLeftBold
                  :class="{ 'cursor-not-allowed': page.pageNum === 1, 'cursor-pointer hover:text-[#2e5cf6]': page.pageNum !== 1 }"
                  @click="scrollLeft" />
              </el-tooltip>
            </el-icon>
            <div class="col-span-1 overflow-x-auto" @wheel.prevent="handleWheelScroll" ref="xscrollContainer"
              style="width:100%;">
              <div v-if="imageList.length" class="flex gap-3" style="flex-wrap: nowrap; height: 100%;">
                <div v-for="(image, index) in imageList" :key="image.fileId" :ref="el => setImageRef(el, index)"
                  style="flex: 0 0 200px; height: 100%; border: 1px solid #F2F6FC">
                  <div
                    :class="['box-border relative flex items-center justify-center bg-br-extra-light border-3 hover:border-primary', { 'border-primary': selectedList.includes(image.fileId), 'border-body': !selectedList.includes(image.fileId) }]">
                    <el-tag effect="dark" class="absolute top-0 left-0 z-10" style="border-radius: 0;z-index: 3;">{{
                      index + 1 + page.pageSize * (page.pageNum - 1) }}</el-tag>
                    <el-image :key="image.fileId + page.pageNum" class="w-full h-32" style="z-index: 2;"
                      :src="imageViewList[index]" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2"
                      :initial-index="index" fit="contain"
                      @click="gotoImage(image.bucketName, image.fileName, image.fileId, index)" draggable="false">
                      <template #placeholder>
                        <div
                          class="flex items-center justify-center w-full h-full bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)] text-sm">
                          图片加载中<span class="dot">...</span></div>
                      </template>
                    </el-image>
                    <div v-show="isSaved(image.fileId)" class="absolute right-0 bottom-0" style="z-index:2;">
                      <!-- 如果 subLabelType 为 '1' 显示 OK -->
                      <span v-if="taskForm.subLabelType === '1'" class="absolute right-0 bottom-0 ok-tag">
                        OK
                      </span>
                      <!-- 否则显示 el-tag -->
                      <span v-else :style="{ backgroundColor: getTagColor(image.fileId) }"
                        style="color: #F2F6FC; border-radius: 4px;" :title="getTagContent(image.fileId)" class="inline-block max-w-[170px] h-6 px-2
                        whitespace-nowrap overflow-hidden text-ellipsis text-white text-xs leading-6 align-middle 
                        rounded border-none cursor-default">
                        {{ getTagContent(image.fileId) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-show="!imageList.length" class="mx-0 my-auto"
                :description="t('onlineAnnotation.noRelevantData')" :image-size="97" />
            </div>
            <el-icon class="ml-2">
              <el-tooltip class="item" effect="light" :content="t('onlineAnnotation.nextPage')" placement="top"
                :hide-after="0">
                <ArrowRightBold
                  :class="{ 'cursor-not-allowed': !hasMore, 'cursor-pointer hover:text-[#2e5cf6]': hasMore }"
                  @click="scrollRight" />
              </el-tooltip>
            </el-icon>
          </div>
        </div>
        <!-- 右边部分 -->
        <div v-if="taskForm.subLabelType === '1'" class="right" ref="rightDiv"
          style="flex: 2; display: flex; align-items: center; flex-direction: column; width: 100%; height: 100%; max-height: 100%;">
          <!-- TabBarArea 组件，占 50% -->
          <div
            style="flex: 1; width: 100%; max-height: 50%; border-bottom: 1px solid #e2e0e0; display: flex; flex-direction: column; overflow: hidden;">
            <TabBarArea ref="tabBarAreaRef" :taskForm="taskForm" :selectItem="selectItem"
              :referSelectItem="referSelectItem" :selection="selection" :showTypeIcon="selectedTaskId !== ''"
              @changeCheck="changeCheck" @deleteItem="deleteItem" @changeSelectTagList="changeSelectTagList" />
          </div>
          <!-- 标签栏，占 50% -->
          <div
            style="flex: 1; width: 100%; max-height: 50%; margin-top: 2px; border-top: 1px solid #e2e0e0; display: flex; flex-direction: column; overflow: hidden;">
            <ClassifyBarArea ref="classifyBarAreaRef" :taskForm="taskForm" :selectItem="selectItem"
              :referSelectItem="referSelectItem" :showTypeIcon="selectedTaskId !== ''" :resultMessage="resultMessage"
              :referResultMessage="referResultMessage" />
          </div>
        </div>
        <div v-else class="right" ref="rightDiv"
          style="flex: 2; display: flex; align-items: center; flex-direction: column;">
          <TabBarArea ref="tabBarAreaRef" :taskForm="taskForm" :selectItem="selectItem"
            :referSelectItem="referSelectItem" :selection="selection" :showTypeIcon="selectedTaskId !== ''"
            @changeCheck="changeCheck" @deleteItem="deleteItem" @changeSelectTagList="changeSelectTagList" />
        </div>
      </div>
      <div v-show="!mode" class="w-full h-full flex overflow-y-auto" v-loading="loading">
        <!-- 左边部分 -->
        <div v-if="!loading && state.pagination?.total" v-loading="state.loading"
          style="flex: 10; display: flex; flex-direction: column; height: 100%;">
          <div style=" overflow: hidden; margin-bottom: 15px; flex-grow: 1; height: 100%;">
            <div class="mask fixed bg-[#409eff] opacity-40 z-[5]" v-show="positionList.is_show_mask"
              :style="'width:' + mask_width + 'left:' + mask_left + 'height:' + mask_height + 'top:' + mask_top"></div>
            <el-checkbox-group v-model="selectedList" class="checkboxGroup" style=" flex-grow: 1; height: 100%;">
              <div class="unselectable-text w-full h-full grid grid-flow-row gap-4" :class="{
                'grid-cols-10': pageSize === 30,
                'grid-cols-8': pageSize === 24,
                'grid-cols-6': pageSize === 18,
                'grid-cols-4': pageSize === 12
                // 'grid-cols-10': pageSize === 40,
                // 'grid-cols-8': pageSize === 32,
                // 'grid-cols-6': pageSize === 24,
                // 'grid-cols-5': pageSize === 20,
              }">
                <div v-for="(image, index) in state.dataList" :key="image.fileId" class="relative">
                  <div
                    :class="['box-border relative flex items-center justify-center bg-br-extra-light border-4 hover:border-primary',
                      { 'border-primary': selectedImages.has(image.fileId), 'border-body': !selectedImages.has(image.fileId) }]">
                    <el-checkbox :key="image.fileId" :label="image.fileName" :value="image.fileId"
                      :class="selectedList.includes(image.fileId) ? 'checkbox aa-active' : 'checkbox'"
                      @change="checkItem(image.fileId)">
                      <el-tag effect="dark" class="absolute top-0 left-0 z-10"
                        style="border-radius: 0;height: 20px;z-index: 2;">{{
                          (index
                            + 1) + (pageCurrent - 1) * pageSize
                        }}</el-tag>
                      <el-image class="w-full h-40" style="z-index: 2;" :src="imageViewList[index]" fit="contain"
                        draggable="false">
                        <template #placeholder>
                          <div
                            class="flex items-center justify-center w-full h-full bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)] text-sm">
                            图片加载中<span class="dot">...</span></div>
                        </template>
                      </el-image>
                      <span class="absolute right-[25px] top-[5px] text-[#0051ff]" style="z-index:2"
                        v-show="selectedList.includes(image.fileId)">
                        {{
                          (selectedList.indexOf(image.fileId)
                            +
                            1) }}</span>
                      <!-- <span v-show="isSelected(image.fileId) && selection !== ''" :style="{
                        backgroundColor: selectItem.find(item => item.tagId === selection)?.color,
                        color: '#F2F6FC',
                        zIndex: 2,
                        borderRadius: '4px'
                      }"
                        class="absolute bottom-0 right-0 max-w-[100px] px-2 whitespace-nowrap overflow-hidden text-ellipsis text-xs leading-6 align-middle cursor-default border-none">
                        <span class="truncate">
                          {{selectItem.find(item => item.tagId === selection)?.tagName}}
                        </span>
                        <el-icon>
                          <CloseBold />
                        </el-icon>
                      </span> -->
                      <el-tag v-show="isSelected(image.fileId)" closable
                        :color="selectItem.find(item => item.tagId === selection)?.color" effect="dark"
                        class="absolute bottom-0 right-0 z-10" style="border:none;z-index: 2;">{{ showTagName(selection,
                          10) }}</el-tag>
                      <div v-show="isSaved(image.fileId)">
                        <span v-if="taskForm.labelType === '0' && taskForm.subLabelType === '1'"
                          class="absolute right-0 bottom-0 ok-tag">
                          OK
                        </span>
                        <span v-else-if="!(isSelected(image.fileId) && selection !== '')" :style="{
                          backgroundColor: getTagColor(image.fileId),
                          position: 'absolute',
                          right: '0',
                          bottom: '0',
                          border: 'none',
                          zIndex: '2',
                          color: '#F2F6FC',
                          borderRadius: '4px'
                        }" :title="getTagContent(image.fileId)"
                          class="inline-block max-w-[100px] h-6 px-2 whitespace-nowrap overflow-hidden text-ellipsis text-xs leading-6 align-middle rounded cursor-default">
                          {{ getTagContent(image.fileId) }}
                        </span>
                      </div>
                      <!-- <el-tag v-show="image.labelList[0].referenceTagId"
                        :color="getReferenceTagColor(image.labelList[0].referenceTagId)" effect="dark"
                        class="absolute left-0 bottom-0" style="border: none;z-index: 1000;">{{
                          image.labelList[0].referenceTagInfo ? image.labelList[0].referenceTagInfo :
                            getReferenceTagContent(image.labelList[0].referenceTagId) }}</el-tag> -->
                      <!-- <el-tag v-show="image.labelList[0].referenceTagId" :color="'#c0c4cc'" effect="dark"
                        class="absolute left-0 bottom-0" style="border: none;z-index: 1000;">{{
                          image.labelList[0].referenceTagInfo ? image.labelList[0].referenceTagInfo :
                            getReferenceTagContent(image.labelList[0].referenceTagId) }}</el-tag> -->
                    </el-checkbox>
                  </div>
                  <div class="mt-2 flex justify-between items-center bg-br-extra-light">
                    <el-popover v-if="taskForm.labelType === '0' && taskForm.subLabelType === '1'"
                      placement="bottom-start" class="w-full"
                      :trigger="image.tagInfoList && tagNameList.length > 1 ? 'hover' : 'none'">
                      <template v-if="tagNameList.length > 0">
                        <div class="max-h-32 space-y-1 overflow-y-auto overflow-x-hidden">
                          <div v-for="(name, index) in tagNameList" :key="index">
                            {{ name }}
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <span disabled>暂无标签</span>
                      </template>
                      <template #reference>
                        <div v-if="!isSaved(image.fileId) || (!image.tagInfoList || image.tagInfoList.length === 0)"
                          class=" ml-2 p-1 text-base leading-5 truncate" style="color:#B0AFAE">
                          {{ '无标签' }}
                        </div>
                        <div v-else v-overflow="handleOverflow(showTagName(image.tagInfoList[0].tagId) ?? '无标签')"
                          @mouseover="handleMouseOverTagName(image.tagInfoList)"
                          class=" ml-2 p-1 text-base leading-5 truncate">
                          {{ showTagName(image.tagInfoList[0].tagId) }}
                        </div>
                      </template>
                    </el-popover>
                    <el-tooltip v-else :content="image.fileName" placement="top"
                      :disabled="!overflowIndexes.has(image.fileId)">
                      <div v-overflow="handleOverflow(image.fileId)" class="p-1 text-base leading-5 truncate">
                        {{ image.fileName }}
                      </div>
                    </el-tooltip>
                    <div class="text-lg flex justify-center">
                      <!-- <el-icon class="cursor-pointer hover:text-[#2e5cf6]" @click.stop.prevent="ImageInfoRef.openDialog(image, 0)">
                        <Memo />
                      </el-icon> -->
                      <el-icon class="cursor-pointer hover:text-[#2e5cf6]"
                        @click.stop.prevent="ImageInfoRef.openDialog(image, 0, getTagContent(image.fileId))">
                        <Tickets />
                      </el-icon>
                      <el-icon class="cursor-pointer hover:text-[#2e5cf6]"
                        @click.stop.prevent="showImage(image.bucketName, image.fileName, index)">
                        <FullScreen />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </el-checkbox-group>
          </div>
          <div class="icon-pagination-container">
            <pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle"
              v-bind="state.pagination" />
          </div>
        </div>
        <el-empty v-else class="mx-0 my-auto w-full h-full"
          :description="activeName === 'second' ? t('onlineAnnotation.noUnlabelData') : (activeName === 'third' && selectLabel === '' ? t('onlineAnnotation.noLabelData') : t('onlineAnnotation.noRelevantData'))"
          :image-size="250" />
        <!-- 右边部分 -->
        <div v-show="showTagList" class="right"
          style="flex: 2; display: flex; align-items: center; flex-direction: column;">
          <TabBarArea ref="tabBarAreaRef" :taskForm="taskForm" :selectItem="selectItem" :selection="selection"
            @changeCheck="changeCheck" @deleteItem="deleteItem" @changeSelectTagList="changeSelectTagList" />
        </div>
        <el-image-viewer v-if="dialogImageVisible" @close="dialogImageVisible = false" :url-list="imageViewList"
          :initial-index="currentImageIndex" />
      </div>
      <ImageInfoDialog @refresh="getDataList()" ref="ImageInfoRef" />

      <!-- 统计分析  -->
      <BarEcharts ref="barEchartsRef" />
      <!-- 快捷键  -->
      <ShortCutKey ref="shortCutKeyRef" @close="updateShortcutList('0')" @mounted="getShortcutList('0')" />

      <el-button class="floating-button" type="primary" circle @click="shortCutKeyRef.openDialog(0)">
        <el-tooltip class="item" effect="light" content="编辑快捷键(Ctrl + Alt)" placement="top" :hide-after="0">
          <Monitor class="w-5 h-5 cursor-pointer hover:text-[#2e5cf6]" />
        </el-tooltip>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="imageClassification">
import { BasicTableProps, useTable, } from '/@/hooks/table';
import { fetchBaseImageListNew, getDatasetById } from "/@/api/dataset/manage";
import { fetchList as fetchTaskList, getTaskObj, putTaskObj, getLabeledTotal } from '/@/api/annotate/annotation-task';
import { getObj as getTagObj } from '/@/api/annotate/tag';
import { addLabelObj, addBatchLabelObj, putLabelObj, delLabelObj, getLabelObjDetails, readJSONFile } from '/@/api/annotate/onlinelabel';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { fileUrl } from "/@/utils/env";
import router from '/@/router';
import mittBus from "/@/utils/mitt";
import { ElInput, TabsPaneContext, ElDrawer, subMenuProps } from 'element-plus'

import CanvasSelect from 'canvas-select-plus'
import { Brush, Collection, Pointer, Delete, ScaleToOriginal, Expand, Switch, ArrowLeftBold, ArrowRightBold, Files } from '@element-plus/icons-vue'
import { dirTree } from '/@/api/admin/file';
import { currentUserOfflinePath } from '/@/api/admin/offline';
import { color } from 'echarts';
import axios from 'axios';
import other from '/@/utils/other';
// import { write } from 'fs';
// import { use } from 'echarts';

const { t } = useI18n();
const ImageInfoDialog = defineAsyncComponent(() => import('../../dataset/dataset/imageInfoDialog.vue'));
const BarEcharts = defineAsyncComponent(() => import('./barEcharts.vue'));
const ShortCutKey = defineAsyncComponent(() => import('./shortCutKey.vue'));
const FileDirTree = defineAsyncComponent(() => import('./fileDirTree.vue'));
const TabBarArea = defineAsyncComponent(() => import('./tabBarArea.vue'));
const ClassifyBarArea = defineAsyncComponent(() => import('./classifyBarArea.vue'));

const route = useRoute();

// 控制变量
const ImageInfoRef = ref();
const loading = ref(false);
const handelLoading = ref(false);
const selectedImages = ref(new Set<string>());
const overflowIndexes = ref(new Set<string>());
const barEchartsRef = ref();
const shortCutKeyRef = ref();
const tabBarAreaRef = ref();
const classifyBarAreaRef = ref();
const showTagList = ref(true);

// 弹出框控制变量
const dialogImageVisible = ref(false);
const dialogFormVisible = ref(false);

interface imageItem {
  fileId: string;
  baseDatasetId: string;
  fileName: string;
  md5: string;
  original: string;
  bucketName: string;
  type: string;
  fileSize: string;
  height: number;
  width: number;
  createTime: string;
  labelList: labelItem[];
}
interface labelItem {
  fileId: string;
  labelId: string;
  labelFileName: string;
  labelName: string;
  referenceTagId: string;
  referenceTagInfo: string;
}
interface TagInfo {
  confidence: string;
  labelId: string;
  scor: string;
  tagId: string;
  tagInfo: string;
  tagInfoId: string;
}
// 分页变量
const page = reactive<{
  pageSize: number;
  pageNum: number;
  totals: number;
}>({
  pageSize: 30,
  pageNum: 1,
  totals: 0,
});

const form = reactive({
  datasetId: '',
  imageIds: '',
})

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#5D00FF',
  '#90EE98',
  '#00ced1',
  '#1e90ff',
  '#c71585',
])

// #region *****************************树形目录结构*******************************

interface Tree {
  id: string;
  label: string;
  parentId: string | null;
  children?: Tree[]; // 可选的 children 属性，表示子节点
}
const fileDirTreeRef = ref();

const fileTreeData = ref<Tree[]>([
  {
    id: '',
    label: '',
    parentId: null,
    children: [],
  }]);

const getFileDir = async (bucketName: string) => {
  const res = await dirTree({ bucketName: bucketName });
  fileTreeData.value.length = 0;
  fileTreeData.value = res.data;
  console.log("fileTreeData", fileTreeData.value);

  fileTreeData.value.unshift({
    id: '',
    label: '全部',
    parentId: null,
    children: [],
  });
}

// 定义转换后的数据类型
interface ConvertedTree {
  value: string;
  label: string;
  children: ConvertedTree[];
}

const convertData = (data: Tree[]): ConvertedTree[] => {
  return data.map((item: Tree): ConvertedTree => {
    const convertedItem: ConvertedTree = {
      value: item.id,
      label: item.label,
      children: item.children && item.children.length > 0 ? convertData(item.children) : []
    };
    return convertedItem;
  });
};

// 计算属性，获取转换后的数据
const convertedData = computed(() => convertData(fileTreeData.value));

const selectFileName = ref("")

watch(() => selectFileName, () => {
  if (!mode.value) {
    activeName.value = "first";
    state.queryForm.bucketName = selectFileName;
    filterbyBucketName();
  }
}, { deep: true });

const filterbyBucketName = async (pageNum: number = 1, pageSize: number = 30, changePage: boolean = true) => {
  loading.value = true;
  try {
    const response = await fetchBaseImageListNew({
      baseDatasetId: state.queryForm.baseDatasetId,
      bucketName: state.queryForm.bucketName,
      current: pageNum,
      size: pageSize,
      fileName: '',
      isLabeled: state.queryForm.isLabeled,
      tagId: '',
      taskId: state.queryForm.taskId,
      descs: '',
      ascs: '',
    });
    // 每次滚动刷新可以获取page.pageNum页的数据，
    const data = response.data;
    const { current, pages, size, total, records } = data;
    page.pageNum = current;
    page.pageSize = size;
    selectedImageTotal.value = total;
    if (changePage) {
      page.totals = total;
      totalImageNum.value = total;
    }
    imageList.value.length = 0;
    imageViewList.value.length = 0;
    resultList.length = 0;
    imageList.value.push(...records);
    imageViewList.value.push(...records.map((item: imageItem) => formatUrl(item.bucketName, item.fileName, item.fileId)));
    for (let i = 0; i < records.length; i++) {
      if (records[i].labelId) {
        resultList.push({
          labelId: records[i].labelId,
          fileId: records[i].fileId,
          tagId: records[i].tagId,
        });
      }
    }
    if (total > 0) {
      gotoImage(imageList.value[0].bucketName,
        imageList.value[0].fileName, imageList.value[0].fileId, 0);
    } else {
      selectedIndex.value = -1;
      fileSize.value = '';
      instance.setImage('');
      instance.update();
    }
    // 判断是否存在下一页
    hasMore.value = current < pages;
    getLabeledTotal({ taskId: route.query.taskId, bucketName: state.queryForm.bucketName }).then((res) => {
      tagedNumber.value = res.data.total;
    }).catch((err) => {
      useMessage().error(err.msg);
    });
  } catch (error) {
    console.error('Failed to load images', error);
  } finally {
    loading.value = false;
  }
}

// 点击节点时的处理方法
const handleNodeClick = async (nodeData: Tree) => {
  activeName.value = "first";
  if (!nodeData.children || nodeData.children.length === 0) {
    // 如果没有子节点，说明是叶子节点
    state.queryForm.bucketName = nodeData.id;
    await filterbyBucketName();
  }
};
// #endregion

// #region *****************************单图模式canvas*******************************
let instance: CanvasSelect;
const xscrollContainer: Ref<HTMLElement | null> = ref(null);
const imageList: Ref<imageItem[]> = ref([]); //保存已滚动加载的图片
const imageViewList: Ref<string[]> = ref([]);
const hasMore = ref(true);// 记录是否还可以滚动刷新
// const hoveredItem = ref(-1); // 用于跟踪鼠标悬停的索引
// const editedItem = ref(''); // 用于记录正在编辑标签的索引
// const lockedItem = ref(''); // 用于记录锁定标签的索引
const selectionTagList = ref<string[]>([]);

const changeSelectTagList = (tagIds: string[]) => {
  selectionTagList.value = [...tagIds];
}

const currentFileUrl = ref('');
currentFileUrl.value = fileUrl;
const formatUrl = (bucketName: string, fileName: string, fileId: string, noUrl: boolean = false) => {
  if (bucketName === '' || fileName === '')
    return '';
  let fileUrlString = "";
  if (noUrl) {
    fileUrlString = bucketName + '/' + fileName;
  } else {
    // 单图和多图默认显示缩略图，单图可以切换原图，多图不支持
    if (mode) {
      if (!originalImageList.value.includes(fileId) && existsFile.value) {
        fileUrlString = currentFileUrl.value + 'thumbnails/' + bucketName + '/' + fileName;
      } else {
        fileUrlString = currentFileUrl.value + bucketName + '/' + fileName;
      }
    } else {
      fileUrlString = currentFileUrl.value + bucketName + '/' + fileName;
    }
  }
  let startUrl = fileUrlString.substring(0, 17);
  let endUrl = fileUrlString.substring(17).replace(/\/\/+/g, '/');
  return startUrl + endUrl;
};

const currentImageIndex = ref(0);
const showImage = (bucketName: string, fileName: string, index: number) => {
  currentImageIndex.value = index;
  dialogImageVisible.value = true;
};


// 滚动加载绑定事件
function debounce(fn: Function, delay: number) {
  let timeoutID: number | null = null;
  return function (...args: any[]) {
    if (timeoutID) clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// 向左滚动
const scrollLeft = async () => {
  if (!xscrollContainer.value) return;
  if (page.pageNum > 1) {
    page.pageNum--;
    await loadImageList();
    nextTick(() => {
      if (xscrollContainer.value) {
        xscrollContainer.value.scrollTo({
          left: xscrollContainer.value.scrollWidth,  // 滚动到最右端
          behavior: 'smooth',  // 平滑滚动
        });
      }
    });
    const lastIndex = imageList.value.length - 1;
    gotoImage(imageList.value[lastIndex].bucketName,
      imageList.value[lastIndex].fileName, imageList.value[lastIndex].fileId, lastIndex);
  } else {
    // useMessage().wraning('已经是第一页！！！');
  }
};

// 向右滚动
const scrollRight = async () => {
  if (!xscrollContainer.value) return;
  if (hasMore.value) {
    page.pageNum++;
    await loadImageList();
    nextTick(() => {
      if (xscrollContainer.value) {
        xscrollContainer.value.scrollTo({
          left: 0,  // 滚动到最左端
          behavior: 'smooth',  // 平滑滚动
        });
      }
    });
    gotoImage(imageList.value[0].bucketName,
      imageList.value[0].fileName, imageList.value[0].fileId, 0);
  } else {
    // useMessage().wraning('已经是最后一页！！！');
  }
};
// 滚轮控制横向滑动
const handleWheelScroll = (event: WheelEvent) => {
  if (!xscrollContainer.value) return;

  // **平滑滚动处理**
  xscrollContainer.value.scrollLeft += event.deltaY;
};
// const xhandleScroll = debounce(() => {
//   if (!xscrollContainer.value) return;
//   const container = xscrollContainer.value;
//   const scrollPosition = container.scrollLeft + container.clientWidth;
//   const scrollWidth = container.scrollWidth;

//   // if (scrollPosition === scrollWidth) {
//   //   if (hasMore.value) useMessage().wraning('请点击右侧按钮进行翻页！！！');
//   //   else useMessage().wraning('已经是最后一页！！！');
//   // }

//   // if (container.scrollLeft === 0) {
//   //   if (page.pageNum > 1) useMessage().wraning('请点击左侧按钮进行翻页！！！');
//   //   else useMessage().wraning('已经是第一页！！！');
//   // }
// }, 200);


// 单次滚动加载数据
const loadImageList = async () => {
  try {
    loading.value = true;
    // handelLoading.value = true;
    const response = await fetchBaseImageListNew({
      baseDatasetId: state.queryForm.baseDatasetId,
      bucketName: state.queryForm.bucketName,
      current: page.pageNum,
      size: page.pageSize,
      fileName: inputFilename.value,
      isLabeled: state.queryForm.isLabeled,
      tagId: state.queryForm.tagId,
      taskId: state.queryForm.taskId,
      descs: '',
      ascs: '',
    });
    // 每次滚动刷新可以获取page.pageNum页的数据，
    const data = response.data;
    const { current, pages, size, total, records } = data;
    page.pageNum = current; // 保存当前显示数据的页码
    page.pageSize = size;
    page.totals = total;
    imageList.value.length = 0;
    imageViewList.value.length = 0;
    resultList.length = 0;
    imageList.value.push(...records);
    imageViewList.value.push(...records.map((item: imageItem) => formatUrl(item.bucketName, item.fileName, item.fileId)));
    for (let i = 0; i < records.length; i++) {
      if (records[i].labelId) {
        resultList.push({
          labelId: records[i].labelId,
          fileId: records[i].fileId,
          tagId: records[i].tagId,
        });
      }
    }
    // 判断是否存在下一页
    hasMore.value = current < pages;
  } catch (error) {
    console.error('Failed to load images', error);
  } finally {
    loading.value = false;
    // handelLoading.value = false;
  }
};

// 单图模式下，图片跳转
const imageRefs = ref<(Element | HTMLElement | null)[]>([]);
const fileSize = ref('');
const resultMessage = ref<string[]>([]);
const referResultMessage = ref<string[]>([]);
const setImageRef = (el: Element | HTMLElement | ComponentPublicInstance | null, index: number) => {
  if (el instanceof HTMLElement) {
    imageRefs.value[index] = el;
  }
};
const gotoImage = async (bucketName: string, fileName: string, fileId: string, index: number) => {
  selectedList.value = [];
  instance.setImage(formatUrl(bucketName, fileName, fileId));
  selectedList.value.push(fileId);
  selectedIndex.value = index;
  if (imageList.value[selectedIndex.value]) {
    const sizeInBytes = Number(imageList.value[selectedIndex.value].fileSize);
    if (sizeInBytes >= 1_073_741_824) {
      fileSize.value = (sizeInBytes / 1_073_741_824).toFixed(2) + 'GB';
    } else if (sizeInBytes >= 1_048_576) {
      fileSize.value = (sizeInBytes / 1_048_576).toFixed(2) + 'MB';
    } else {
      fileSize.value = (sizeInBytes / 1_024).toFixed(2) + 'KB';
    }
  }

  if (taskForm.subLabelType === '1') {
    const record = resultList.find(item => item.fileId === fileId);
    if (record) {
      tabBarAreaRef.value.setSelectionList(record.tagId.split(','));
      resultMessage.value = record.tagId.split(',');
    } else {
      tabBarAreaRef.value.setSelectionList([]);
      resultMessage.value = [];
    }
  }
  // 加载参考标签
  if (selectedTaskId.value !== '' && showReference.value !== '1') {
    await showReferLabel();
  }
  if (xscrollContainer.value && imageRefs.value[index]) {
    const container = xscrollContainer.value;
    const imageElement = imageRefs.value[index];

    if (imageElement instanceof HTMLElement) { // 添加类型保护
      const containerWidth = container.clientWidth;
      const elementWidth = imageElement.clientWidth;

      // 计算滚动到中间的位置
      const scrollPosition = imageElement.offsetLeft - (containerWidth / 2) + (elementWidth / 2);

      // 平滑滚动到中间
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    } else {
      console.error("The referenced element is not an HTMLElement");
    }
  }
}

const originalImageList = ref<string[]>([]);
const changeImagePath = async () => {
  if (!existsFile.value) {
    useMessage().wraning("本数据集暂无缩略图，仅显示原图");
    return;
  }
  handelLoading.value = true;
  if (originalImageList.value.includes(selectedList.value[0])) {
    originalImageList.value = originalImageList.value.filter(id => id !== selectedList.value[0]);
  } else {
    originalImageList.value.push(selectedList.value[0]);
  }
  instance.setImage(formatUrl(imageList.value[selectedIndex.value].bucketName,
    imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId));
}
// #endregion

// #region *****************************获取图片列表(多图)*****************************
const state: BasicTableProps = reactive<BasicTableProps>({
  createdIsNeed: false,
  pagination: {
    size: 30,
    current: 1,
    // pageSizes: [20, 24, 32, 40],
    pageSizes: [12, 18, 24, 30],
  },
  queryForm: {
    baseDatasetId: '',
    bucketName: '',
    tagId: '',
    taskId: '',
    fileName: '',
    isLabeled: '',
  },
  pageList: fetchBaseImageListNew,
});

const pageSize = ref(30);
const pageCurrent = ref(1);
const pageTotal = ref(1);
const tagedNumber = ref(0);

const { getDataList, currentChangeHandle, sizeChangeHandle } = useTable(state);

const openCanvas = async (param: any) => {
  loading.value = true;
  try {
    const res = await getDatasetById(param.datasetId);
    if (res && res.data) {
      state.queryForm.baseDatasetId = res.data.baseDatasetId;
      state.queryForm.taskId = route.query.taskId
      form.datasetId = res.data.datasetId;
      let imageIdString = res.data.imageIds;
      // 精度丢失
      let imageIdStringParse = JSON.parse(imageIdString);
      imageIdStringParse && imageIdStringParse.length ? (selectedImages.value = new Set(imageIdStringParse)) : (selectedImages.value = new Set());
    }
    getDataList();
  } catch (error: any) {
    useMessage().error(error)
  } finally {
    loading.value = false;
  }

};

const backIndex = () => {
  form.imageIds = '';
  router.back();
  mittBus.emit(
    "onCurrentContextmenuClick",
    Object.assign({}, { contextMenuClickId: 1, ...route })
  );
}

const handleOverflow = (index: string) => (el: any) => {
  nextTick(() => {
    if (el.scrollWidth > el.clientWidth) {
      overflowIndexes.value.add(index);
    } else {
      overflowIndexes.value.delete(index);
    }
  });
};
const tagNameList = ref<string[]>([]);

const handleMouseOverTagName = (image: TagInfo[]) => {
  // 使用 Set 来存储标签名，自动去重
  const uniqueTagNames = new Set<string>();
  image.forEach(element => {
    const tagMsg = selectItem.find((item: Tag) => item.tagId === String(element.tagId));
    if (tagMsg) {
      uniqueTagNames.add(tagMsg.tagName);
    }
  });
  // 将 Set 转换为数组赋值给 tagNameList
  tagNameList.value = Array.from(uniqueTagNames);
};
const showTagName = (tagId: string, maxLength: number = 200) => {
  const tagName = selectItem.find((item: Tag) => item.tagId == tagId)?.tagName ?? '';
  return tagName.length > maxLength ? tagName?.substring(0, maxLength - 1) + '...' : tagName;
}

// #endregion

// #region *****************************标注或验证定量指标*****************************
const labelMsgList = ref([
  {
    tagName: '',
    confidence: '',
    precision: '',
  }
]);
// #endregion

// #region *******************************键盘监听相关逻辑*****************************
const controlKeyDown = ref(false);
const shiftKeyDown = ref(false);

const shortcutData = ref<Record<string, string>>({
  "删除标注": "Delete",
  "保存标注": "Ctrl + S",
  "适配大小": "Ctrl + R",
  "切换单多图": "Ctrl + F",
  "上一张": "A",
  "下一张": "D",
  "清空选中项": "TAB",
  "显示或隐藏标签栏": "Ctrl + E"
});
const getShortcutList = async (tasktype: string) => {
  if (shortCutKeyRef.value) {
    const res = await shortCutKeyRef.value.getShortcutList(tasktype);
    if (res.data) {
      shortcutData.value = res.data;
    } else {
      await shortCutKeyRef.value.saveToLocalStorage();
    }
  } else {
    console.error("shortCutKeyRef is not available yet");
  }
};

const updateShortcutList = (tasktype: string) => {
  if (shortCutKeyRef.value) {
    const res = shortCutKeyRef.value.updateShortcutList(tasktype);
    if (Object.keys(res).length !== 0) {
      shortcutData.value = res;
    }
  } else {
    console.error("shortCutKeyRef is not available yet");
  }
};

const getShortcutKey = (name: string): string => {
  return Object.entries(shortcutData.value).find(([key]) => key === name)?.[1] || t('onlineAnnotation.noSet');
};

// 监听键盘按键
const detectKey = () => {
  const isWin = navigator.userAgent.includes("Windows");
  const isMac = navigator.userAgent.includes("Mac OS X");

  let isThrottled = false;
  let throttleTime = 1000; // 节流时间，单位毫秒

  window.onkeydown = (event) => {
    let keys = new Set(); // 使用 Set 以避免重复按键
    let combinkeys = "";

    if (shortCutKeyRef.value?.dialogVisible) { return; }

    if (handelLoading.value || loading.value || state.loading) { return; }

    // focusedElement全局判断，是否在进行输入操作
    const focusedElement = document.activeElement;
    if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')) { return; }

    event.preventDefault(); // 阻止默认输入

    // 记录组合键
    if (event.ctrlKey) keys.add("Ctrl");
    if (event.altKey) keys.add("Alt");
    if (event.shiftKey) keys.add("Shift");
    if (event.metaKey) keys.add("Cmd"); // Mac 下的 Command 键

    // **捕获主要按键**
    const key = event.key.toUpperCase();
    if (!["CONTROL", "ALT", "SHIFT", "META"].includes(key)) {
      keys.add(key); // 只添加非修饰键
    }

    // **组合键字符串**
    combinkeys = Array.from(keys).join(" + ");

    console.log(`当前组合键: ${combinkeys}`); // 方便调试

    if ((event.ctrlKey || (event.metaKey && isMac)) && event.altKey) {
      event.preventDefault();  // 防止浏览器执行默认的保存操作
      shortCutKeyRef.value.openDialog(0);
      return; // 直接返回，不执行后续节流的逻辑
    }

    if (event.key === 'Shift') {
      shiftKeyDown.value = true;
    }

    const indexes = Object.entries(shortcutData.value).reduce<number[]>(
      (acc, [_, key], idx) => {
        if (key.toLowerCase() === combinkeys.toLowerCase()) {
          acc.push(idx);
        }
        return acc;
      },
      []
    );

    if (indexes.length > 1) {
      useMessage().wraning('快捷键冲突，请检查设置！！！');
      return;
    }

    if (indexes.length === 0) {
      if (combinkeys >= "1" && combinkeys <= "9") {
        // 检测数字键 1 到 9
        let index = parseInt(event.key) - 1;
        if (index < selectItem.length) {
          if (taskForm.subLabelType === '0') {
            selection.value = selectItem[index].tagId;
            changeCheck(index, "");
          } else {
            const tagIndex = selectionTagList.value.indexOf(selectItem[index].tagId);
            if (tagIndex > -1) {
              selectionTagList.value.splice(tagIndex, 1);
            } else {
              selectionTagList.value.push(selectItem[index].tagId);
            }
            tabBarAreaRef.value.setSelectionList(selectionTagList.value);
          }
        } else {
          useMessage().wraning("请选择 1-" + selectItem.length + " 号标签项！！！");
        }
      }
      return;
    }

    const index = indexes[0]; // 取第一个索引
    const name = Object.keys(shortcutData.value)[index];

    if (name === '切换单多图') {
      changeMode();
      return;
    } else if (name === '保存标注') {
      handleSave();  // 执行保存操作
      return; // 直接返回，不执行后续节流的逻辑
    } else if (name === '适配大小') {
      instance.fitZoom();
      return; // 直接返回，不执行后续节流的逻辑
    } else if (name === '清空选中项') {
      clearSelectedList();
      return;
    } else if (name === '删除标注') {
      handleDelete();
      return;
    } else if (name === '显示或隐藏标签栏') {
      showTagList.value = !showTagList.value;
      return;
    }

    // 其他键位受节流控制
    if (isThrottled) return;
    isThrottled = true;

    if (name === '上一张') {
      event.preventDefault();  // 防止浏览器执行默认的保存操作
      if (mode.value) {
        throttleTime = 250;
        if (selectedIndex.value !== 0) {
          gotoImage(imageList.value[selectedIndex.value - 1].bucketName,
            imageList.value[selectedIndex.value - 1].fileName, imageList.value[selectedIndex.value - 1].fileId, selectedIndex.value - 1);
        } else {
          scrollLeft();
        }
      } else {
        throttleTime = 1000;
        if (pageCurrent.value - 1 >= 1 && state.pagination) {
          state.pagination.current = pageCurrent.value - 1;
          getDataList(false);
        }
      }
    } else if (name === '下一张') {
      event.preventDefault();  // 防止浏览器执行默认的保存操作
      if (mode.value) {
        throttleTime = 250;
        if (selectedIndex.value + 1 !== imageList.value.length) {
          gotoImage(imageList.value[selectedIndex.value + 1].bucketName,
            imageList.value[selectedIndex.value + 1].fileName, imageList.value[selectedIndex.value + 1].fileId, selectedIndex.value + 1);
        } else {
          scrollRight();
        }
      } else {
        throttleTime = 1000;
        if (pageCurrent.value + 1 <= pageTotal.value && state.pagination) {
          state.pagination.current = pageCurrent.value + 1;
          getDataList(false);
        }
      }
    } else {
      useMessage().wraning('未定义快捷键！！！');
    }
    setTimeout(() => {
      isThrottled = false;
    }, throttleTime);
  };

  window.onkeyup = (event) => {
    if (event.key === 'Shift') {
      shiftKeyDown.value = false;
    }
    if ((event.key === 'Control' && isWin) || (event.key === 'Meta' && isMac)) {
      controlKeyDown.value = false;
    }
  };
};

// 鼠标按下事件
const handleMouseDown = (event: MouseEvent) => {
  if (!positionList || mode.value) return;
  positionList.is_show_mask = true;
  positionList.start_x = event.clientX;
  positionList.start_y = event.clientY;
  positionList.end_x = event.clientX;
  positionList.end_y = event.clientY;
  document.body.addEventListener("mousemove", handleMouseMove);
  document.body.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!positionList || mode.value) return;
  positionList.end_x = event.clientX;
  positionList.end_y = event.clientY;
};

const handleMouseUp = () => {
  if (!positionList || mode.value) return;
  document.body.removeEventListener("mousemove", handleMouseMove);
  document.body.removeEventListener("mouseup", handleMouseUp);
  positionList.is_show_mask = false;
  handleDomSelect();
  resSetXY();
};
// #endregion

// #region *********************************多图选中方式 ******************************
const selectedList = ref<string[]>([]);
const positionList = reactive({
  is_show_mask: false,
  box_screen_left: 0,
  box_screen_top: 0,
  start_x: 0,
  start_y: 0,
  end_x: 0,
  end_y: 0
});

// 计算mask属性
const mask_width = computed(() => positionList ? `${Math.abs(positionList.end_x - positionList.start_x)}px;` : '0px;');
const mask_height = computed(() => positionList ? `${Math.abs(positionList.end_y - positionList.start_y)}px;` : '0px;');
const mask_left = computed(() => positionList ? `${Math.min(positionList.start_x, positionList.end_x) - positionList.box_screen_left}px;` : '0px;');
const mask_top = computed(() => positionList ? `${Math.min(positionList.start_y, positionList.end_y) - positionList.box_screen_top}px;` : '0px;');

//单击多选框选中
const checkItem = (fileId: string) => {
  if (shiftKeyDown.value && state.dataList) {
    const indexArr: number[] = [];
    // 记录最后点击索引
    const lastSelectedIndex = state.dataList.findIndex(item => item.fileId === fileId) ?? -1;
    if (lastSelectedIndex !== -1 && state.dataList && state.dataList.length > 0) {
      // 将 selectedList.value（一个包含文件 ID 的数组）转换为对应文件在 imageList 中位置的索引数组，且只包含有效的索引。
      const previousIndexes = selectedList.value.map(id =>
        state.dataList?.findIndex(item => item.fileId === id) ?? -1
      ).filter(index => index !== -1);
      const minIndex = Math.min(...previousIndexes);
      const maxIndex = Math.max(...previousIndexes);
      // 如果之前没有选中任何项，则从 0 到 lastSelectedIndex 选择
      if (previousIndexes.length === 1) {
        for (let index = 0; index <= lastSelectedIndex; index++) {
          indexArr.push(index);
        }
      } else {
        // 选择从 minIndex 到 lastSelectedIndex 之间的所有项
        const startIndex = Math.min(minIndex, lastSelectedIndex);
        const endIndex = Math.max(maxIndex, lastSelectedIndex);
        for (let index = startIndex; index <= endIndex; index++) {
          indexArr.push(index);
        }
      }
      // 根据 indexArr 更新 selectedList   (!为TypeScript 非空断言)
      selectedList.value = indexArr.map(index => state.dataList?.[index]?.fileId || null);
    }
  }
}

function handleDomSelect() {
  const dom_mask = window.document.querySelector(".mask");
  let rect_select = { x: 0, y: 0, width: 0, height: 0 };
  //getClientRects()每一个盒子的边界矩形的矩形集合
  if (dom_mask) {
    rect_select = dom_mask.getClientRects()[0];
  }

  const add_list: string[] = [];
  const del_list: string[] = [];
  document.querySelectorAll(".checkboxGroup .checkbox").forEach((node, index) => {
    const rects = node.getClientRects()[0];
    //比较checkbox盒子边界和遮罩层边界最大最小值
    const maxX = Math.max(rects.x + rects.width, rect_select.x + rect_select.width);
    const maxY = Math.max(rects.y + rects.height, rect_select.y + rect_select.height);
    const minX = Math.min(rects.x, rect_select.x);
    const minY = Math.min(rects.y, rect_select.y);
    const compared = maxX - minX <= rects.width + rect_select.width && maxY - minY <= rects.height + rect_select.height;
    if (rects && compared === true && state.dataList) {
      const fileId = state.dataList[index].fileId;
      if (selectedList.value.includes(fileId)) {
        del_list.push(fileId);
      } else {
        add_list.push(fileId);
      }
    }
  });
  if (rect_select.width !== 0 && rect_select.height !== 0) {
    selectedList.value = selectedList.value.concat(add_list).filter((item) => !del_list.includes(item));
  }
}
//清除
function resSetXY() {
  positionList.start_x = 0;
  positionList.start_y = 0;
  positionList.end_x = 0;
  positionList.end_y = 0;
}
// #endregion

// #region ************************************标签栏********************************
// 定义 Tag 对象的类型
interface Tag {
  tagId: string;
  tagName: string;
  color: string;
}

const selection = ref('0');
const selectedLabel = computed(() => {
  const item = selectItem.find(tag => tag.tagId === selection.value);
  return item ? item.tagName : ''; // 如果找不到匹配项返回空字符串
});
const selectItem = reactive<Tag[]>([
  // { tagName: '牡丹', tagId: '1', color: '#1E90FF' },
]);
const referSelectItem = reactive<Tag[]>([
  // { tagName: '牡丹', tagId: '1', color: '#1E90FF' },
]);
const FilenameRef = ref<InstanceType<typeof ElInput>>()

const filterTagName = ref('');
const filteredSelectItem = computed(() => {
  const searchValue = filterTagName.value.trim().toLowerCase();
  if (searchValue === '') {
    // 如果搜索条件为空，返回全部数据
    return selectItem;
  } else {
    // 根据名称进行模糊匹配
    return selectItem.filter((item) =>
      item.tagName.includes(searchValue)
    );
  }
});

const updateTagIds = async (newtaskForm: Task) => {
  // 更新labeltask的tagIds
  try {
    await putTaskObj(newtaskForm);
    useMessage().success(t('onlineAnnotation.editSuccessText'));
  } catch (err: any) {
    useMessage().error(err.msg);
  }
}

const deleteItem = async (value: string) => {
  // 弹窗确认
  await useMessageBox().confirm(t('onlineAnnotation.confirmDelete'));
  try {
    loading.value = true;
    handelLoading.value = true;
    let tagIdsJson = JSON.parse(taskForm.tagIds);
    let index = tagIdsJson.findIndex((item: string) => item.toString() === value);
    if (index > -1) {
      tagIdsJson.splice(index, 1);
      const newtaskForm: Task = {
        taskId: taskForm.taskId,
        taskName: taskForm.taskName,
        datasetId: taskForm.datasetId,
        baseDatasetId: taskForm.baseDatasetId,
        labelType: taskForm.labelType,
        subLabelType: taskForm.subLabelType,
        tagIds: JSON.stringify(tagIdsJson),
        groupId: taskForm.groupId,
        groupName: taskForm.groupName,
      }
      // 更新labeltask的tagIds
      await updateTagIds(newtaskForm);
      // 更新taskForm
      taskForm.tagIds = JSON.stringify(tagIdsJson);
      // 更新selectItem
      index = selectItem.findIndex((item: Tag) => item.tagId === value);
      if (index > -1) {
        selectItem.splice(index, 1);
      }
      selection.value = '0';
      // 更新resultList
      for (let i = resultList.length - 1; i >= 0; i--) {
        if (resultList[i].tagId === value) {
          resultList.splice(i, 1);
        }
      }
    }
  } catch {
    useMessage().error("删除失败！！！");
  } finally {
    loading.value = false;
    handelLoading.value = false;
  }
};

// 选中标签触发事件（点击或快捷键选中）
const changeCheck = async (index: number, value: string) => {
  // 不选中任一标签项
  if (index === -1 && value === '') {
    selection.value = '0';
    return;
  } else if (index !== -1 && value === '') {
    if (tabBarAreaRef.value.editedItem !== '' && tabBarAreaRef.value.editedItem === value) {
      return;
    } else if (tabBarAreaRef.value.lockedItem !== '' && tabBarAreaRef.value.lockedItem !== value) {
      useMessage().wraning("已锁定其他选项！！！");
      return;
    }
    // 通过index（快捷键）选中
    if (filteredSelectItem.value.length === 0) {
      useMessage().wraning("无对应的快捷键选项！！！");
      return;
    } else if (index < filteredSelectItem.value.length) {
      selection.value = filteredSelectItem.value[index].tagId;
    } else {
      useMessage().wraning("无对应的快捷键选项！！！");
      return;
    }
  } else {
    // 通过selectItem.value选中
    if (tabBarAreaRef.value.editedItem !== '' && tabBarAreaRef.value.editedItem === value) {
      return;
    } else if (tabBarAreaRef.value.lockedItem !== '' && tabBarAreaRef.value.lockedItem !== value) {
      useMessage().wraning("已锁定其他选项！！！");
      return;
    }
    selection.value = value;
  }
  // 单图模式下，选中标签后自动保存并跳转到下一个
  if (mode.value === true && selectedList.value.length !== 0) {
    // 查询当前图片的索引
    let currindex = selectedIndex.value;
    // if (imageList.value[currindex].labelList[0].referenceTagId) {
    //   useMessage().wraning('参考标签，不可修改！！！');
    //   return;
    // }
    await handleSave();
    if (currindex !== -1 && currindex + 1 < imageList.value.length) {
      gotoImage(imageList.value[currindex + 1].bucketName, imageList.value[currindex + 1].fileName, imageList.value[currindex + 1].fileId, currindex + 1);
    } else {
      if ((selectedIndex.value + 1 + page.pageSize * (page.pageNum - 1)) === selectedImageTotal.value) {
        useMessage().wraning('已是最后一张图片！！！');
        handelLoading.value = false;
        return;
      }
      if (selectedIndex.value + 1 >= imageList.value.length) {
        // useMessage().wraning('已是最后一张图片！！！');
        // handelLoading.value = false;
        // havenSaved.value = true;
        scrollRight();
        return;
      }
      gotoImage(imageList.value[currindex].bucketName, imageList.value[currindex].fileName, imageList.value[currindex].fileId, currindex);
      // useMessage().wraning('已是最后一张图片！！！');
    }
  }
}

// #endregion

// #region ************************************筛选栏********************************
const activeName = ref('first');  // 设置默认选中的tab为第一个（name="first"）
const inputFilename = ref('');
const selectLabel = ref('');
const selectedImageTotal = ref(0);

const vOverflow = {
  mounted(el: any, binding: any) {
    const callback = binding.value;
    callback(el);
  },
  updated(el: any, binding: any) {
    const callback = binding.value;
    callback(el);
  },
};

const canvasRef = ref<HTMLCanvasElement | null>(null);
interface Task {
  taskId: string;
  taskName: string;
  datasetId: string;
  baseDatasetId: string;
  labelType: string;
  subLabelType: string;
  tagIds: string;
  groupId: string;
  groupName: string;
}
// 提交表单数据
const taskForm: Task = reactive({
  taskId: "",
  taskName: "",
  datasetId: "",
  baseDatasetId: "",
  labelType: "",
  subLabelType: "",
  tagIds: "",
  groupId: "",
  groupName: ""
});
// 记录图片列表文件总数
const totalImageNum = ref(0);

const leftTopDiv = ref<HTMLElement | null>(null);  // 用于引用 class="left-top" 的 div
const leftBottomDiv = ref<HTMLElement | null>(null);
const rightDiv = ref<HTMLElement | null>(null);
const mainDiv = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

const handleResize = () => {
  if (!mode.value) {
    return;
  }

  // 清除上一次的定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  // 设置一个新的定时器，确保在 500ms 后才执行 handleResize
  const mianHeight = mainDiv.value?.offsetHeight ?? 775;
  const mianWidth = mainDiv.value?.offsetWidth ?? 1670;
  const rightWidth = rightDiv.value?.offsetWidth ?? 272;
  const leftBottomHeight = leftBottomDiv.value?.offsetHeight ?? 145;
  const height = mianHeight - leftBottomHeight - 62;
  const width = mianWidth - rightWidth - 28;

  if (selectedIndex.value >= 0 && imageList.value.length !== 0) {
    instance.resize(width, height, 1, formatUrl(imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId));
  }
};

// 上一张
const lastNumber = () => {
  if (handelLoading.value) return;
  if (selectedIndex.value !== 0) {
    gotoImage(imageList.value[selectedIndex.value - 1].bucketName,
      imageList.value[selectedIndex.value - 1].fileName, imageList.value[selectedIndex.value - 1].fileId, selectedIndex.value - 1);
  } else {
    scrollLeft();
  }
}
// 下一张
const nextNumber = () => {
  if (handelLoading.value) return;
  if (selectedIndex.value + 1 !== imageList.value.length) {
    gotoImage(imageList.value[selectedIndex.value + 1].bucketName,
      imageList.value[selectedIndex.value + 1].fileName, imageList.value[selectedIndex.value + 1].fileId, selectedIndex.value + 1);
  } else {
    scrollRight();
  }
}

const handleTabsClick = (tab: TabsPaneContext) => {
  if (tab.props.label.includes("全部")) {
    state.queryForm.isLabeled = '';
    selectLabel.value = '';
    state.queryForm.tagId = '';
  } else if (tab.props.label.includes("无标注信息")) {
    if (totalImageNum.value - tagedNumber.value === 0) {
      useMessage().wraning('当前数据集无未标注图片！！！');
      return;
    }
    state.queryForm.isLabeled = 'false';
    selectLabel.value = '';
    state.queryForm.tagId = '';
  } else {
    if (tagedNumber.value === 0) {
      useMessage().wraning('当前数据集无已标注图片！！！');
      return;
    }
    state.queryForm.isLabeled = 'true';
  }
  loading.value = true;
  page.pageNum = 1;
  imageList.value.length = 0;
  getDataList();
}

// 按标签筛选
const handleSelectTagChange = () => {
  state.queryForm.tagId = selectLabel.value;
  if (selectLabel.value) {
    activeName.value = 'third';
    state.queryForm.isLabeled = "true";
  } else {
    activeName.value = 'first';
    state.queryForm.isLabeled = "";
  }
  loading.value = true;
  page.pageNum = 2;
  selectedList.value.length = 0;
  imageList.value.length = 0;
  getDataList();
};

// 名称检索Input
const handleInput = () => {
  nextTick(() => {
    FilenameRef.value!.input!.focus()
  })
};
// 名称检索事件
const handleSelectConfirm = () => {
  if (inputFilename.value) {
    // 执行按名称检索
    state.queryForm.fileName = inputFilename.value;
    selectLabel.value = '';
    nextTick(() => {
      FilenameRef.value!.input!.blur()
    })
  } else {
    if (state.queryForm.fileName === '') return;
    state.queryForm.fileName = ''
  }
  loading.value = true;
  page.pageNum = 2;
  selectedList.value.length = 0;
  imageList.value.length = 0;
  getDataList();
}
interface ResultItem {
  labelId: string;
  fileId: string;
  tagId: string;
  tagInfo?: string;
  referenceTagId?: string;
  referenceTagInfo?: string;
}
const resultList = reactive<ResultItem[]>([]);
const isSelected = (val: string) => {
  return selectedList.value.some(item => item === val) && (selection.value !== '0');
};
const isSaved = (val: string) => {
  return resultList.some(item => item.fileId === val);
};
const getTagColor = (val: string) => {
  const result = resultList.find(item => item.fileId === val);
  const selected = selectedList.value.find(item => item === val);
  const color = result?.tagId ? selectItem.find(item => item.tagId === result.tagId)?.color : selected ? selectItem.find(item => item.tagId === selection.value)?.color : '#c0c4cc';
  return color || '#c0c4cc';
};
const getReferTagColor = (name: string) => {
  const color = referSelectItem.find(item => item.tagName === name)?.color;
  return color || '#c0c4cc';
};
const getTagContent = (val: string) => {
  const result = resultList.find(item => item.fileId === val);
  const label = selectItem.find(item => item.tagId === result?.tagId)?.tagName;
  return label;
};

// #endregion

// #region ************************************工具栏********************************
const mode = ref(true); //切换单图(true)和多图模式(false)
const selectedIndex = ref(0); //记录单图下，选中图片的index
// 智能标注
const magicToolVisible = ref(false);
const referToolVisible = ref(false);
const modelUrl = ref('');
const selectedTaskId = ref('');
const taskList = ref<Task[]>([]);
const showReference = ref('0'); // 0：都显示 1：只标注标签 2：只参考标签
const referTagName = ref(''); // 记录当前显示图片的参考标签
const changeMode = async () => {
  mode.value = !mode.value;
  // 多——>单
  if (mode.value) {
    hasMore.value = true;
    loading.value = true;
    page.pageSize = state.pagination?.size ?? 30;
    page.pageNum = state.pagination?.current ?? 1;
    page.totals = 0;
    activeName.value = "first";
    state.queryForm.isLabeled = '';
    state.queryForm.tagId = '';
    state.queryForm.bucketName = '';
    imageList.value.length = 0;
    imageViewList.value.length = 0;
    resultList.length = 0;
    if (selectedList.value.length > 0 && state.dataList) {
      const index = state.dataList.findIndex(item => item.fileId === selectedList.value[0]);
      await filterbyBucketName(state.pagination!.current, state.pagination!.size, false);
      gotoImage(imageList.value[index].bucketName, imageList.value[index].fileName, imageList.value[index].fileId, index);
    } else {
      filterbyBucketName(page.pageNum, page.pageSize);
    }
  } else {
    // 单——>多
    hasMore.value = true;
    loading.value = true;
    // page.pageSize = 30;
    // page.pageNum = 2;
    // page.totals = 0;
    activeName.value = "first";
    inputFilename.value = '';
    selectLabel.value = '';
    state.queryForm.isLabeled = '';
    state.queryForm.tagId = '';
    state.queryForm.bucketName = '';
    // selectedList.value.length = 0;
    imageList.value.length = 0;
    imageViewList.value.length = 0;
    resultList.length = 0;
    // filterbyBucketName();
    currentChangeHandle(page.pageNum);
    getLabeledTotal({ taskId: route.query.taskId, bucketName: state.queryForm.bucketName }).then((res) => {
      tagedNumber.value = res.data.total;
    }).catch((err) => {
      useMessage().error(err.msg);
    });
    fileDirTreeRef.value.resetTree();
  }
};
// const statistics = () => {
//   useMessage().wraning('正在开发中，敬请期待！！！');
// }
const getTaskList = async () => {
  referToolVisible.value = !referToolVisible.value;
  if (taskList.value.length > 0) {
    return;
  }
  const res = await fetchTaskList({ baseDatasetId: taskForm.baseDatasetId, labelType: taskForm.labelType, subLabelType: taskForm.subLabelType });
  if (res && res.data) {
    taskList.value = res.data.records[0].labelTaskList;
    taskList.value = taskList.value.filter(item => item.taskId !== taskForm.taskId);
  }
}
// 参考标签
const configReferLabel = async () => {
  referToolVisible.value = false;
  const res = await getTaskObj(selectedTaskId.value);
  referSelectItem.length = 0;
  if (res.data.tagList && res.data.tagList.length > 0) {
    res.data.tagList.forEach((tag: Tag) => {
      referSelectItem.push({
        tagId: tag.tagId,
        tagName: tag.tagName,
        color: tag.color
      });
    });
  }
  showReferLabel();
}
// 参考标签
const showReferLabel = async () => {
  if (selectedTaskId.value === '') {
    useMessage().wraning('请先右键图标进行配置！！！');
    return;
  } else if (referSelectItem.length === 0) {
    useMessage().wraning('当前配置无参考标签，请先右键图标进行配置！！！');
    return;
  }
  else if (taskForm.subLabelType === '0') {
    referToolVisible.value = false;
    const res = await getLabelObjDetails({
      fileId: selectedList.value[0],
      taskId: selectedTaskId.value,
    });
    if (res.data && res.data.tagInfoList[0]) {
      referTagName.value = referSelectItem.find(item => item.tagId === res.data.tagInfoList[0].tagId)?.tagName ?? '';
    } else {
      referTagName.value = '';
    }
  } else {
    referToolVisible.value = false;
    const res = await getLabelObjDetails({
      fileId: selectedList.value[0],
      taskId: selectedTaskId.value,
    });
    referResultMessage.value.length = 0;
    if (res.data && res.data.tagInfoList[0]) {
      res.data.tagInfoList.forEach((element: Tag) => {
        referResultMessage.value.push(element.tagId);
      });
    }
  }
}

interface ApiResponse {
  code: number;
  message: string;
  data_list: any[];
}

// 智能标注
const smartDialog = ref(false);
const smartURL = ref('http://172.18.10.61:7080/detect');
const smartSetted = ref(false);
const smartForm = reactive({
  task: '',
  params: {},
  base_path: {
    external: "http://prod.aircas.icu:81/admin/sys-file/",
    local: "http://172.18.10.65:88/admin/sys-file/"
  },
  labelType: 0,
  subLabelType: 0,
  labelTags: [] as any[],
  data_list: [] as any[],
});
const currentParams = ref<{ [key: string]: string } | null>(null);
const smartTaskList = ref<{
  name: string;
  type: string;
  params: { [key: string]: string };
}[]>([]);
const drawerRef = ref<InstanceType<typeof ElDrawer>>();
const openSmartDialog = async () => {
  smartDialog.value = true;
}
const changeSelectTask = () => {
  currentParams.value = smartTaskList.value.find(item => item.name === smartForm.task)?.params ?? null;
  smartForm.params = currentParams.value as { [key: string]: string };
  console.log(currentParams.value);
}
const readParamsFile = async () => {
  const formData = new FormData();
  formData.append('path', '/local/model.json');
  await readJSONFile(formData).then((response) => {
    const res = JSON.parse(response.data);
    if (!res) {
      useMessage().wraning('URL下无可选任务！');
      return;
    }
    smartTaskList.value = res.taskList;
    console.log("response", smartTaskList.value);
  }).catch((err) => {
    useMessage().error('读取Json失败！');
  });
}
const setSmartClick = () => {
  if (smartURL.value === '') {
    useMessage().wraning("请输入智能标注URL！")
  } else if (smartForm.task === '') {
    useMessage().wraning("请点击'加载参数',完成智能标注配置！")
  } else {
    smartDialog.value = false;
    smartForm.labelType = taskForm.labelType;
    smartForm.subLabelType = taskForm.subLabelType;
    smartSetted.value = true;
    useMessage().success("智能配置成功");
  }
}
const smartClick = async () => {
  smartForm.labelTags.length = 0;
  smartForm.data_list.length = 0;
  selectItem.forEach((item) => {
    smartForm.labelTags.push({
      tagName: item.tagName,
      tagId: item.tagId
    })
  })
  if (mode.value) {
    imageList.value.forEach((image) => {
      if (selectedList.value.some(item => item === image.fileId)) {
        smartForm.data_list.push({
          fileId: image.fileId,
          imgPath: formatUrl(image.bucketName, image.fileName, image.fileId, true),
          height: image.height,
          width: image.width
        })
      }
    });
  } else {
    state.dataList?.forEach((image) => {
      if (selectedList.value.some(item => item === image.fileId)) {
        smartForm.data_list.push({
          fileId: image.fileId,
          imgPath: formatUrl(image.bucketName, image.fileName, image.fileId, true),
          height: image.height,
          width: image.width
        })
      }
    });
  }
  console.log("配置信息：", smartForm);
  if (smartForm.labelTags.length === 0) {
    useMessage().wraning("暂无标签，请先添加标签！");
  } else if (smartForm.data_list.length === 0) {
    useMessage().wraning("请先选择待标注图片！");
  } else {
    // 请求接口
    // useMessage().wraning("暂无对接智能标注接口！");
    // return;
    try {
      const { host, port, uri } = other.useUrlParser(smartURL.value)
      const response = await axios.post('/ai/smart' + uri.value, smartForm, {
        headers: {
          'X-Custom-IP': host.value,
          'X-Custom-Port': port.value
        }
      });
      if (response.ok) {
        const result = (await response.json()) as ApiResponse;
        useMessage().success("成功");
        if (result.data_list.length === 0) {
          useMessage().wraning("当前图片无智能标注结果，请检查模型配置是否正确！");
          return;
        } else {
        }
      }
    } catch (err: any) {
      useMessage().error(err.msg);
    }
  }
}
const handleClose = () => {
  smartDialog.value = false;
}
const cancelForm = () => {
  loading.value = false;
  smartSetted.value = false;
  smartDialog.value = false;
  smartTaskList.value.length = 0;
  smartForm.task = '';
  smartForm.params = {};
  currentParams.value = null;
  smartForm.labelTags.length = 0;
  smartForm.data_list.length = 0;
}
//清空选中项
const clearSelectedList = () => {
  if (mode.value) {
    useMessage().wraning("仅在多图模式下支持！！！");
  } else {
    selectedList.value = [];
  }
}
// 删除标签功能
const handleDelete = async () => {
  handelLoading.value = true;
  const setB = new Set(selectedList.value);
  let ids = [];
  // 从后向前遍历数组A，避免索引问题
  for (let i = resultList.length - 1; i >= 0; i--) {
    if (setB.has(resultList[i].fileId)) {
      ids.push(resultList[i].labelId);
    }
  }
  if (ids.length > 0) {
    await delLabelObj(ids).then(() => {
      useMessage().success("删除成功！！！");
      for (let i = 0; i < ids.length; i++) {
        const index = resultList.findIndex(item => item.labelId === ids[i]);
        resultList.splice(index, 1);
      }
      tagedNumber.value = tagedNumber.value - ids.length;
    }).catch((err) => {
      useMessage().error(err.msg);
    });
    if (!mode) {
      selectedList.value = [];
    } else {
      gotoImage(imageList.value[selectedIndex.value].bucketName,
        imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId, selectedIndex.value);
    }
  } else {
    useMessage().wraning("无标注可删除")
  }
  handelLoading.value = false;
};

const addFileIdList: Ref<string[]> = ref([]);
const putLabelIdList: Ref<string[]> = ref([]);
// 保存标签功能
const handleSave = async () => {
  if (selection.value === '0' && selectionTagList.value.length === 0) {
    useMessage().info('请选择标签项！！！');
  } else if (selectedList.value.length === 0) {
    useMessage().info('请选择图像！！！');
  } else {
    handelLoading.value = true;
    addFileIdList.value.length = 0;
    putLabelIdList.value.length = 0;
    for (let i in selectedList.value) {
      // 如果已经标注过，就先查再修改
      if (isSaved(selectedList.value[i])) {
        const temp = resultList.find(item => item.fileId === selectedList.value[i]);
        if (temp) {
          putLabelIdList.value.push(temp.labelId);
        }
      } else {
        addFileIdList.value.push(selectedList.value[i]);
      }
    }
    if (addFileIdList.value.length > 0) {
      let params = {
        labelId: "",
        labelType: taskForm.labelType,
        subLabelType: taskForm.subLabelType,
        fileId: addFileIdList.value.join(','),
        labelFileName: "",
        taskId: taskForm.taskId,
        tagId: "",
        tagInfo: "",
      };
      if (taskForm.subLabelType === '0') {
        params.tagId = selection.value;
      } else {
        selectionTagList.value.forEach((item: string, index: number) => {
          if (index < selectionTagList.value.length - 1) {
            params.tagId += item + ',';
          } else {
            params.tagId += item;
          }
        });
        params.tagInfo = params.tagId;
      }
      // 如果没有标注过，就添加
      if (mode.value) {
        await addLabelObj(params).then((res) => {
          //修改已标注图片数量、修改resultList
          // getDataList(false);
          resultList.push({
            labelId: res.data.labelId,
            fileId: params.fileId,
            tagId: params.tagId
          });
          tagedNumber.value = tagedNumber.value + addFileIdList.value.length;
        }).catch((err) => {
          useMessage().error(err.msg);
          return;
        });
      } else {
        await addBatchLabelObj(params).then((res) => {
          //修改已标注图片数量、修改resultList
          // getDataList(false);
          for (let i = 0; i < res.data.data.length; i++) {
            resultList.push({
              labelId: res.data.data[i].labelId,
              fileId: res.data.data[i].fileId,
              tagId: res.data.data[i].tagId
            });
          }
          tagedNumber.value = tagedNumber.value + addFileIdList.value.length;
        }).catch((err) => {
          useMessage().error(err.msg);
          return;
        });
      }
    }
    if (putLabelIdList.value.length > 0) {
      let params = {
        labelId: putLabelIdList.value.join(','),
        labelType: taskForm.labelType,
        subLabelType: taskForm.subLabelType,
        labelFileName: "",
        taskId: taskForm.taskId,
        tagId: '',
        tagInfo: '',
      };
      if (taskForm.subLabelType === '0') {
        params.tagId = selection.value;
      } else {
        selectionTagList.value.forEach((item: string, index: number) => {
          if (index < selectionTagList.value.length - 1) {
            params.tagId += item + ',';
          } else {
            params.tagId += item;
          }
        });
        params.tagInfo = params.tagId;
      }
      await putLabelObj(params).then(() => {
        // getDataList(false);
        for (let i = 0; i < putLabelIdList.value.length; i++) {
          const index = resultList.findIndex(item => item.labelId === putLabelIdList.value[i]);
          resultList[index].tagId = params.tagId;
        }
      }).catch((err) => {
        useMessage().error(err.msg);
      });
    }
    handelLoading.value = false;
    if (resultList.length > 0) {
      useMessage().success('已完成标注数量:' + tagedNumber.value);
    } else {
      useMessage().wraning('标注异常！！！');
    }
    if (taskForm.subLabelType === '0') {
      selectedList.value = [];
      if (!tabBarAreaRef.value.lockedItem) {
        changeCheck(-1, '');
      }
    } else {
      // 单图模式下，选中标签后自动保存并跳转到下一个
      if (mode.value === true) {
        if ((selectedIndex.value + 1 + page.pageSize * (page.pageNum - 1)) === selectedImageTotal.value) {
          useMessage().wraning('已是最后一张图片！！！');
          handelLoading.value = false;
          return;
        }
        if (selectedIndex.value + 1 >= imageList.value.length) {
          // useMessage().wraning('已是最后一张图片！！！');
          // handelLoading.value = false;
          // havenSaved.value = true;
          scrollRight();
          return;
        }
        // 查询当前图片的索引
        let currindex = selectedIndex.value;
        if (currindex !== -1 && currindex + 1 < imageList.value.length) {
          gotoImage(imageList.value[currindex + 1].bucketName, imageList.value[currindex + 1].fileName, imageList.value[currindex + 1].fileId, currindex + 1);
        } else {
          gotoImage(imageList.value[currindex].bucketName, imageList.value[currindex].fileName, imageList.value[currindex].fileId, currindex);
          useMessage().wraning('已是最后一张图片！！！');
        }
      }
    }
  }
};

// #endregion
async function checkFileExists(fileUrl: string): Promise<boolean> {
  try {
    // 发送HEAD请求，只获取响应头不下载内容
    const response = await fetch(fileUrl, {
      method: 'HEAD',
      cache: 'no-cache' // 避免浏览器缓存影响结果
    });

    // 200-299状态码表示文件存在
    return response.ok;
  } catch (error) {
    console.error('检查文件存在时出错:', error);
    return false;
  }
}

const existsFile = ref<null | boolean>(null);

onMounted(async () => {
  // 初始设置 canvas 尺寸
  instance = new CanvasSelect('.canvas-container');
  // 判断taskId是否存在
  if (route.query.taskId && typeof route.query.taskId === 'string') {
    try {
      handelLoading.value = true;
      const res = await getTaskObj(route.query.taskId);
      if (res) {
        state.queryForm.baseDatasetId = res.data.baseDatasetId;
        state.queryForm.taskId = route.query.taskId;
        taskForm.taskId = res.data.taskId;
        taskForm.taskName = res.data.taskName;
        taskForm.datasetId = res.data.datasetId;
        taskForm.baseDatasetId = res.data.baseDatasetId;
        taskForm.labelType = res.data.labelType;
        taskForm.subLabelType = route.query.subLabelType as string;
        taskForm.tagIds = res.data.tagIds || "[]";
        if (res.data.datasetId) {
          form.datasetId = res.data.datasetId;
          openCanvas(form);
        } else {
          getDataList();
        }
        // 初始化标签列表
        selectItem.length = 0;
        if (res.data.tagList && res.data.tagList.length > 0) {
          res.data.tagList.forEach((tag: Tag) => {
            selectItem.push({
              tagId: tag.tagId,
              tagName: tag.tagName,
              color: tag.color
            });
          });
        }
      }
      // getDataList();
    } catch (error: any) {
      useMessage().error(error)
    } finally {
      handelLoading.value = false;
    }
  } else {
    useMessageBox().error("未获取到baseDatasetId")
    backIndex();
  }
  const bucketNameParam = 'dataset/' + route.query.baseDatasetName + '/base/images';
  getFileDir(bucketNameParam);
  detectKey();
  if (leftTopDiv.value) {
    let resizeTimeout: number;
    resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);  // 清除上一次的定时器
      resizeTimeout = setTimeout(() => {
        handleResize();  // 延迟执行，避免高频调用
      }, 20);  // 可以调整这个延迟时间
    });
    resizeObserver.observe(leftTopDiv.value);
  }
  instance.on('load', (src: string) => {
    console.log('图片加载完成', src);
    handelLoading.value = false;
    // }
  });
  xscrollContainer.value?.addEventListener("wheel", handleWheelScroll);
})
onBeforeUnmount(() => {
  if (resizeObserver && leftTopDiv.value) {
    resizeObserver.unobserve(leftTopDiv.value);
    resizeObserver.disconnect(); // 完全释放资源
    resizeObserver = null; // 避免悬空引用
  }
  // 组件卸载时移除事件监听器
  window.onkeydown = null;
  window.onkeyup = null;
  instance.destroy();
});
// 注销时打印
onUnmounted(() => {
  xscrollContainer.value?.removeEventListener("wheel", handleWheelScroll);
})

// 用于检测并等待子组件挂载成功
function waitForTabBarMounted(maxRetry = 10, delay = 100): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = (retry = 0) => {
      if (mode && tabBarAreaRef.value && fileDirTreeRef.value && shortCutKeyRef.value) resolve();
      else if (retry < maxRetry) setTimeout(() => check(retry + 1), delay);
      else reject('Ref未挂载');
    };
    check();
  });
}
// 监控state.dataList变化
watch(() => state.dataList, async () => {
  if (state.dataList && state.dataList.length > 0) {
    // 首次加载时，判断缩略图路径下是否为空
    if (existsFile.value === null) {
      const filePath = `${currentFileUrl.value}thumbnails/${state.dataList[0].bucketName}/${state.dataList[0].fileName}`;
      existsFile.value = await checkFileExists(filePath);
    }
    imageList.value.length = 0;
    imageViewList.value.length = 0;
    imageList.value.push(...(state.dataList ?? []));
    imageViewList.value.push(...(state.dataList ?? []).map((item: imageItem) => formatUrl(item.bucketName, item.fileName, item.fileId)));
    await nextTick();
    try {
      await waitForTabBarMounted(20, 200); // 等待 tabBarAreaRef 挂载完成
    } catch (e) {
      console.warn(e);
      return;
    }
    if (mode.value) {
      gotoImage(imageList.value[0].bucketName, imageList.value[0].fileName, imageList.value[0].fileId, 0);
    }
  }
  if (state.dataList && state.dataList.length > 0) {
    resultList.length = 0;
    for (let i = 0; i < state.dataList.length; i++) {
      if (state.dataList[i].labelId) {
        resultList.push({
          labelId: state.dataList[i].labelId,
          fileId: state.dataList[i].fileId,
          tagId: state.dataList[i].tagId,
        });
        // if (state.dataList[i].tagInfoList[0].referenceTagId && !referenceTagIdList.value.includes(state.dataList[i].tagInfoList[0].referenceTagId)) {
        //   referenceTagIdList.value.push(state.dataList[i].tagInfoList[0].referenceTagId);
        // }
      }
    }
  }
  if (state.pagination?.total !== undefined) {
    if (state.pagination.total > imageList.value.length) {
      hasMore.value = true;
    } else {
      hasMore.value = false;
    }
  } else {
    hasMore.value = false;
  }
  selectedImageTotal.value = state.pagination?.total ?? 0;
  if (totalImageNum.value === 0) {
    totalImageNum.value = state.pagination?.total ?? 0;
  }
  if (loading.value === true) {
    loading.value = false;
  }
  if (handelLoading.value === true) {
    handelLoading.value = false;
  }
  if (state.pagination && state.pagination.total && state.pagination.total > 0) {
    pageTotal.value = Math.ceil(state.pagination.total / pageSize.value);
  }
}, { deep: true });

watch(() => state.pagination?.current, () => {
  selectedList.value.length = 0;
  pageCurrent.value = state.pagination?.current ?? 1;
  pageSize.value = state.pagination?.size ?? 30;
  getLabeledTotal({ taskId: route.query.taskId }).then((res) => {
    tagedNumber.value = res.data.total;
  }).catch((err) => {
    useMessage().error(err.msg);
  });
}, { deep: true, immediate: true });

watch(() => state.pagination?.size, () => {
  pageSize.value = state.pagination?.size ?? 30;
}, { deep: true, immediate: true });

watch(() => selectLabel, (newVal) => {
  state.queryForm.tagId = newVal;
}, { deep: true });

const offlineStatus = ref(false);
const changeOfflinePath = () => {
  //本地->云  云->本地
  useMessage().wraning(t('onlineAnnotation.switchLoading'))
  if (offlineStatus.value) {
    currentFileUrl.value = fileUrl;
    useMessage().success(t('onlineAnnotation.switchToCloud'));
    offlineStatus.value = false;
  } else {
    currentUserOfflinePath('0').then((res) => {
      const { code, data } = res;
      if (code === 0) {
        if (data) {
          let url = res.data.protocol + '://' + res.data.serverIp + ":" + res.data.serverPort + "/";
          switchToLocalNginx(url);
        } else {
          useMessage().wraning(t('onlineAnnotation.switchWarning'));
        }
      } else {
        useMessage().error(t('onlineAnnotation.switchError'));
      }
    })
  }
}

const switchToLocalNginx = async (url: string) => {
  try {
    // 使用 AbortController 设置超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时

    const response = await fetch(url, { method: 'HEAD' })
    if (response.ok) {
      handleLocalNginxSwitch(url)
    } else {
      throw new Error(t('onlineAnnotation.switchNginxError'))
    }

    clearTimeout(timeoutId)
  } catch (error) {
    useMessage().error(t('onlineAnnotation.switchNginxError'))
    console.error('本地Nginx检测失败:', error)
  }
}

const handleLocalNginxSwitch = (url: string) => {
  // 这里实现切换逻辑，例如更新全局变量或调用store
  currentFileUrl.value = url;
  useMessage().success(t('onlineAnnotation.switchToLocal'));
  offlineStatus.value = true;
  // useMessage().success('已切换至本地Nginx服务')
}
</script>

<style lang="scss">
.checkboxGroup {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .el-checkbox__input {
    white-space: nowrap;
    cursor: pointer;
    outline: 0;
    display: inline-flex;
    position: absolute;
    right: 5px;
    top: 5px;
    // z-index: 1001;
  }

  .el-checkbox__label {
    padding: 0;
    width: 100%;
    height: 100%;
  }

  .el-checkbox__input .el-checkbox__inner:after {
    border-color: #ffffff;
  }

  .el-checkbox__input.is-checked .el-checkbox__inner {
    border: 1px solid #0051ff;
  }

  .el-checkbox__inner {
    border: 1px solid #fff;
  }
}

.checkbox {
  width: 252px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
}

.checkbox-active {
  border: 1px solid #00ffff;
}

.unselectable-text {
  user-select: none;
  -webkit-user-select: none;
  /* 对于 WebKit 浏览器 */
  -moz-user-select: none;
  /* 对于 Firefox 浏览器 */
  -ms-user-select: none;
  /* 对于 IE 浏览器 */
}

.left-top {
  flex-grow: 8;
  /* 左边上部分占80%高度 */
  z-index: 2;
  width: 100%;
  height: 100%;
  border: 1px solid #e2e0e0;
  // background-color: lightcoral;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.left-bottom {
  flex-grow: 2;
  border: 1px solid #e2e0e0;
  margin-top: 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  // max-width: 1450px;
  /* 左边下部分占20%高度 */
}

/* 右边部分，占30%宽度，高度100% */
.right {
  flex: 20%;
  /* 右边占30% */
  // background-color: lightgray;
  width: 100%;
  height: 100%;
  // min-width: 272px;
  margin-left: 4px;
  min-width: 276px;
  border: 1px solid #e2e0e0;
}

/* 左右滑动按钮的样式 */
.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 1;
}

.scroll-button.left {
  left: 0;
}

.scroll-button.right {
  right: 0;
}

.scroll-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

/* 隐藏掉 el-color-picker 内部的图标 */
.el-color-picker__trigger .el-icon-arrow-down {
  display: none;
}

.el-popover.el-popper {
  min-width: 100px;
}

.canvas-container {
  position: absolute;
  background-color: #F7F7F7;
  width: 100%;
  height: 100%;
  // z-index: 2;
}

.el-tabs__header {
  margin: 0 0 0px;
}

.el-tabs {
  --el-tabs-header-height: 20px;
}

.el-tabs__item {
  margin-bottom: 6px;
}

.custom-dropdown {
  transform: translate(-40%, -10%) !important;
  /* 将内容居中 */
}

.cursor-not-allowed {
  opacity: 0.2;
  cursor: not-allowed;
  /* 鼠标显示为不可点击状态 */
}

.annotaion-overflow {
  overflow-x: auto !important;
  min-width: 1500px;
}

.icon-pagination-container {
  display: flex;
  align-items: flex-end;
  /* 垂直居中对齐 */
  justify-content: flex-end;
  /* 水平右对齐 */
  gap: 10px;
  /* 调整图标与分页组件之间的间距 */
}

.floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.el-button.is-circle {
  width: 45px;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.page-info {
  white-space: nowrap;
  flex: 0 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  margin-left: 15px;
  margin-right: 15px;
}

.file-size-wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
}

.middle-block {
  flex: 1 1 auto;
  min-width: 0;
  /* 防止撑出容器 */
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ok-tag {
  z-index: 2;
  background-color: #DBEADF;
  color: #5BAC87;
  font-weight: bold;
  font-size: 14px;
  padding: 4px 0px 4px 0px;
  border-radius: 0;
  line-height: 1;
  border: none;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}


@media (max-width: 1260px) {

  .file-size {
    display: none;
  }
}

@media (max-width: 1140px) {

  .page-info {
    display: none;
  }
}

@media (max-width: 740px) {

  .tab-pane {
    display: none;
  }
}

@media (max-width: 1290px) {

  .filter-msg {
    display: none;
  }
}

@media (max-width: 590px) {

  .tag-msg {
    display: none;
  }
}

.fs-21 {
  font-size: 21px !important;
}

.el-drawer__title {
  font-size: 20px;
  color: #0f0f0f;
}
</style>