<template>
    <div class="layout-padding">
        <div class="layout-padding-auto layout-padding-view" v-loading="handelLoading" ref="mainDiv"
            @mousedown="handleMouseDown">
            <div class="flex gap-2 justify-center items-center">
                <div v-show="countMode" class="flex gap-10 w-full items-center justify-between">
                    <!-- Tab页 -->
                    <div style="flex: 0 0 auto;" class="tab-pane mt-[3.5px]">
                        <el-tabs v-model="activeName" @tab-click="handleTabsClick">
                            <el-tab-pane :label="`${t('onlineAnnotation.all')} (${totalImageNum})`"
                                name="first"></el-tab-pane>
                            <el-tab-pane
                                :label="`${t('onlineAnnotation.noAnnotation')} (${totalImageNum - tagedNumber < 0 ? 0 : totalImageNum - tagedNumber})`"
                                name="second" :disabled="totalImageNum - tagedNumber === 0"></el-tab-pane>
                            <el-tab-pane :label="`${t('onlineAnnotation.hasAnnotation')} (${tagedNumber})`" name="third"
                                :disabled="tagedNumber === 0"></el-tab-pane>
                        </el-tabs>
                    </div>
                    <!-- 文件名称 -->
                    <div class="middle-block">
                        <el-tooltip :content="imageList[selectedIndex] ? imageList[selectedIndex].fileName : ''"
                            placement="top"
                            :disabled="!overflowIndexes.has(imageList[selectedIndex] ? imageList[selectedIndex].fileName : '')">
                            <span
                                v-overflow="handleOverflow(imageList[selectedIndex] ? imageList[selectedIndex].fileName : '')"
                                class="file-name">
                                {{ t('onlineAnnotation.fileName') }}：{{ imageList[selectedIndex] ?
                                    imageList[selectedIndex].fileName :
                                    '' }}
                            </span>
                        </el-tooltip>
                    </div>
                    <!-- 右边部分：文件大小 + 翻页 + 工具图标 -->
                    <div class="flex gap-2" style="flex:1 1 auto; justify-content: flex-end;">
                        <!-- 文件大小 -->
                        <div class="file-size-wrapper">
                            <span class="file-size">
                                {{ t('onlineAnnotation.fileSize') }}：{{ fileSize }}
                            </span>
                        </div>
                        <!-- 翻页 -->
                        <div class="page-info">
                            <el-icon>
                                <el-tooltip class="item" effect="light" :content="`上一张(${getShortcutKey('上一张')})`"
                                    placement="top" :hide-after="0">
                                    <ArrowLeftBold :class="{
                                        'cursor-not-allowed': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) === 1,
                                        'cursor-pointer': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) !== 1
                                    }" @click="lastNumber" />
                                </el-tooltip>
                            </el-icon>
                            <span style="user-select: none;">
                                &nbsp;{{ `第 ${selectedIndex + 1 + page.pageSize * (page.pageNum - 1)} 张 / 共
                                ${selectedImageTotal} 张`
                                }}&nbsp;
                            </span>
                            <el-icon>
                                <el-tooltip class="item" effect="light" :content="`下一张(${getShortcutKey('下一张')})`"
                                    placement="top" :hide-after="0">
                                    <ArrowRightBold :class="{
                                        'cursor-not-allowed': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) === (activeName === 'first'
                                            ? totalImageNum
                                            : activeName === 'second'
                                                ? totalImageNum - tagedNumber
                                                : tagedNumber),
                                        'cursor-pointer': (selectedIndex + 1 + page.pageSize * (page.pageNum - 1)) !== (activeName === 'first'
                                            ? totalImageNum
                                            : activeName === 'second'
                                                ? totalImageNum - tagedNumber
                                                : tagedNumber)
                                    }" @click="nextNumber" />
                                </el-tooltip>
                            </el-icon>
                        </div>
                        <!-- 工具图标 -->
                        <el-tooltip class="item" effect="light" :content="`删除标注(${getShortcutKey('删除标注')})`"
                            placement="top" :hide-after="0">
                            <Delete class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]"
                                @click="handleDelete" />
                        </el-tooltip>
                        <el-tooltip class="item" effect="light" :content="`保存标注(${getShortcutKey('保存标注')})`"
                            placement="top" :hide-after="0">
                            <Collection class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]"
                                @click="handleSave()" />
                        </el-tooltip>
                        <el-tooltip class="item" effect="light" :content="`撤销(${getShortcutKey('撤销')})`" placement="top"
                            :hide-after="0">
                            <RefreshLeft class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]"
                                @click="undoOperation()" />
                        </el-tooltip>
                        <el-tooltip class="item" effect="light" :content="`重做(${getShortcutKey('重做')})`" placement="top"
                            :hide-after="0">
                            <RefreshRight class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]"
                                @click="redoOperation()" />
                        </el-tooltip>
                        <el-tooltip class="item" effect="light" :content="`适配大小(${getShortcutKey('适配大小')})`"
                            placement="top" :hide-after="0">
                            <ScaleToOriginal class="w-5 h-5 mt-0.5 mr-3 cursor-pointer hover:text-[#2e5cf6]"
                                @click="instance.fitZoom();" />
                        </el-tooltip>
                        <el-popconfirm title="" hide-icon placement="bottom" trigger="click" :width="300"
                            :visible="referToolVisible" @cancel="referToolVisible = false" @confirm="configReferLabel">
                            <template #reference>
                                <span>
                                    <el-tooltip class="item" effect="light" content="参考标签" placement="top"
                                        :hide-after="0">
                                        <template #default>
                                            <el-badge :hidden="selectedTaskId === '' || showReference === '1'" is-dot
                                                class="item mt-0.5 mr-2">
                                                <Discount class="w-5 h-5 mr-1 cursor-pointer hover:text-[#2e5cf6]"
                                                    @click="showReferLabel" @contextmenu.prevent="getTaskList" />
                                            </el-badge>
                                        </template>
                                    </el-tooltip>
                                </span>
                            </template>
                            <template #actions="{ confirm, cancel }">
                                <el-select v-model="selectedTaskId" placeholder="请选择标注任务作为参考标签显示"
                                    style="width: 270px; margin-bottom: 8px;">
                                    <el-option v-for="item in taskList" :key="item.taskId" :label="item.taskName"
                                        :value="item.taskId" />
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
              @cancel="magicToolVisible = false" @confirm="magicToolVisible = false">
              <template #reference>
                <span>
                  <el-tooltip class="item" effect="light" content="智能标注" placement="top" :hide-after="0">
                    <template #default>
                      <Pointer class="w-5 h-5 mt-0.5 mr-3 cursor-pointer"
                        @click="magicToolVisible = !magicToolVisible" />
                    </template>
                  </el-tooltip>
                </span>
              </template>
              <template #actions="{ confirm, cancel }">
                <el-input v-model="modelUrl" placeholder="请输入模型URL"
                  style="width: 200px; margin-top: 2px; margin-bottom: 8px;"></el-input>
                <div style="text-align: right; margin-top: 10px;">
                  <el-button size="small" text @click="cancel">取消</el-button>
                  <el-button size="small" type="primary" @click="confirm">确定</el-button>
                </div>
              </template>
            </el-popconfirm> -->
                        <el-tooltip class="item" effect="light" content="智能标注" placement="top" :hide-after="0">
                            <template #default>
                                <el-badge :hidden="!smartSetted" is-dot class="item mt-0.5 mr-2">
                                    <Pointer class="w-5 h-5 mr-1 cursor-pointer hover:text-[#2e5cf6]"
                                        @click="smartClick" @contextmenu.prevent="openSmartDialog" />
                                </el-badge>
                            </template>
                        </el-tooltip>
                        <el-drawer ref="drawerRef" v-model="smartDialog" title="智能标注功能配置" :before-close="handleClose"
                            direction="rtl" custom-class="demo-drawer">
                            <el-form :model="smartForm">
                                <el-form-item label="URL" label-width="70px">
                                    <div class="flex items-center gap-2 w-full">
                                        <el-input v-model="smartURL" autocomplete="off" class="flex-1" />
                                        <el-button type="primary" @click="readParamsFile"
                                            class="ml-auto">加载参数</el-button>
                                    </div>
                                </el-form-item>
                                <template v-if="smartTaskList.length > 0">
                                    <el-form-item label="任务名称" label-width="70px">
                                        <el-select v-model="smartForm.task" placeholder="请选择任务名称和类型"
                                            @change="changeSelectTask">
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
                                        <el-form-item v-for="(value, key, index) in currentParams" :key="key"
                                            :label="key + ':'" class="w-1/2 px-2" label-width="70px">
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
                        <template v-for="tool in toolList" :key="tool.type">
                            <el-tooltip v-if="route.query.subLabelType === tool.subLabelType" class="item"
                                effect="light" :content="`${tool.label}(${getShortcutKey(tool.label)})`" placement="top"
                                :hide-after="0">
                                <el-badge :hidden="mode !== 1 || toolType !== tool.type" is-dot
                                    class="item mt-0.5 mr-2">
                                    <component :is="tool.icon" class="w-5 h-5 mr-1 cursor-pointer"
                                        :class="{ 'text-[#2e5cf6] bg-[#f5f6fc]': mode === 1 && toolType === tool.type && instance.createType === tool.type }"
                                        @click="drawShapes(tool.type)" />
                                </el-badge>
                            </el-tooltip>
                        </template>
                        <el-tooltip v-if="route.query.subLabelType === '2'" class="item" effect="light" :content="`橡皮擦`"
                            placement="top" :hide-after="0">
                            <el-badge :hidden="!iserase || mode !== 1" is-dot class="item mt-0.5 mr-2">
                                <IceCreamSquare class="w-5 h-5 mr-1 cursor-pointer hover:text-[#2e5cf6]"
                                    :class="{ 'text-[#2e5cf6] bg-[#f5f6fc]': (iserase && mode === 1) }"
                                    @click="eraser()" />
                            </el-badge>
                        </el-tooltip>
                        <!-- <el-tooltip class="item" effect="light" content="AI工具" placement="top" :hide-after="0">
              <el-popover title="AI 工具" :visible="magicToolVisible" placement="bottom" trigger="click" :width="230">
                <div>标签</div>
                <el-select v-model="magicLabel" placeholder="请选择标签"
                  style="width: 200px; margin-top: 2px; margin-bottom: 4px;">
                  <el-option v-for="item in selectItem" :key="item.tagId" :label="item.tagName" :value="item.tagId" />
                </el-select>
                <div>模型</div>
                <el-select v-model="modelLabel" placeholder="请选择模型"
                  style="width: 200px; margin-top: 2px; margin-bottom: 8px;">
                  <el-option v-for="item in modelItem" :key="item.modelId" :label="item.modelName"
                    :value="item.modelId" />
                </el-select>
                <el-switch v-model="maskToPolygon" />
                <span style="margin-left: 10px;">将掩膜转成多边形</span>
                <div style="text-align: right; margin-top: 10px;">
                  <el-button size="small" text @click="magicToolVisible = false">取消</el-button>
                  <el-button size="small" type="primary" @click="magicToolVisible = false; magicTool()">
                    确定
                  </el-button>
                </div>
                <template #reference>
                  <el-badge :hidden="!isMagicToolActive" is-dot class="item mt-0.5 mr-2">
                    <Pointer class="w-5 h-5 mr-1 cursor-pointer" @click="magicToolVisible = !magicToolVisible" />
                  </el-badge>
                </template>
              </el-popover>
            </el-tooltip>
            <el-tooltip class="item" effect="light" :content="`分割一切(${getShortcutKey('分割一切')})`" placement="top"
              :hide-after="0">
              <el-badge :hidden="!havedMask" is-dot class="item mt-0.5 mr-1">
                <Picture class="w-5 h-5 mr-1 cursor-pointer" @click="getAllMask()" />
              </el-badge>
            </el-tooltip> -->
                        <!-- <el-tooltip class="item" effect="light" content="保存图片" placement="top" :hide-after="0">
            <Download class="w-5 h-5 mt-0.5 mr-1 cursor-pointer" @click="downLoadImage()" />
          </el-tooltip> -->
                        <el-tooltip class="item" effect="light" :content="`修订模式(${getShortcutKey('修订模式')})`"
                            placement="top" :hide-after="0">
                            <el-badge :hidden="mode !== 2" is-dot class="item mt-0.5 mr-2">
                                <Edit class="w-5 h-5 mr-1 cursor-pointer hover:text-[#2e5cf6]"
                                    :class="{ 'text-[#2e5cf6] bg-[#f5f6fc]': mode === 2 }" @click="changeMode(2)" />
                            </el-badge>
                        </el-tooltip>
                        <!-- <el-tooltip class="item" effect="light" content="隐藏" placement="top" :hide-after="0">
            <Hide class="w-5 h-5 mt-0.5 mr-3 cursor-pointer" @click="hideShape()" />
          </el-tooltip>
          <el-tooltip class="item" effect="light" content="显示" placement="top" :hide-after="0">
            <el-badge :value="hideNum === 0 ? '' : hideNum" class="item mt-0.5 mr-2" style="">
              <View class="w-5 h-5 mr-1 cursor-pointer" @click="showShape()" />
            </el-badge>
          </el-tooltip> -->
                        <el-tooltip class="item" effect="light" content="专注模式" placement="top" :hide-after="0">
                            <el-badge :hidden="focusMode === false" is-dot class="item mt-0.5 mr-2">
                                <Aim class="w-5 h-5 mr-1 cursor-pointer hover:text-[#2e5cf6]"
                                    :class="{ 'text-[#2e5cf6] bg-[#f5f6fc]': focusMode === true }"
                                    @click="focusMode === false ? changeMode(3) : changeMode(2)" />
                            </el-badge>
                        </el-tooltip>
                        <!-- <el-tooltip class="item" effect="light" :content="mode === 0 ? '只读' : '非只读'" placement="top" :hide-after="0">
            <el-badge v-if="mode === 0" is-dot class="item mt-0.5 mr-2">
              <Lock class="w-5 h-5 mr-1 cursor-pointer" :class="{ 'text-[#2e5cf6]': mode === 0 }" @click="changeMode(2)" />
            </el-badge>
            <Unlock v-else class="w-5 h-5 mt-0.5 mr-3 cursor-pointer" @click="changeMode(0)" />
          </el-tooltip> -->
                        <!-- 右侧切换图标 -->
                        <el-tooltip class="item" effect="light" :content="offlineStatus ? '切换文件源(云端)' : '切换文件源(本地)'"
                            placement="top" :hide-after="0">
                            <i :class="['iconfont', 'w-5', 'h-5', 'mr-3', 'mt-[-3.5px]', 'cursor-pointer', 'icon-celvewenjian-lixian', 'fs-21', 'hover:text-[#2e5cf6]']"
                                @click="changeOfflinePath"></i>
                        </el-tooltip>
                        <el-tooltip class="item" effect="light"
                            :content="countMode ? `多图(${getShortcutKey('切换单多图')})` : `单图(${getShortcutKey('切换单多图')})`"
                            placement="top" :hide-after="0">
                            <Switch class="w-5 h-5 mr-3 mt-0.5 cursor-pointer hover:text-[#2e5cf6]"
                                @click="countSwitch" />
                        </el-tooltip>
                        <!-- <el-tooltip class="item" effect="light"
            :content="mode === 0 ? '只读模式' : mode === 1 ? '绘制模式' : mode === 2 ? '修订模式' : '专注模式'" placement="top"
            :hide-after="0">
            <Switch class="w-5 h-5 mt-0.5 mr-3 cursor-pointer" @click="changeMode(-1)" />
          </el-tooltip> -->
                    </div>
                </div>
                <div v-show="!countMode" class="flex items-center justify-between" style="flex: 3;">
                    <!-- 左侧内容：Tabs + 输入框 + 标签 -->
                    <div class="flex items-center" style="flex: 1 1 auto;">
                        <!-- Tabs -->
                        <div class="flex tag-msg" style="margin-right: 20px;">
                            <el-tabs v-model="activeName" @tab-click="handleTabsClick">
                                <el-tab-pane :label="`${t('onlineAnnotation.all')} (${totalImageNum})`"
                                    name="first"></el-tab-pane>
                                <el-tab-pane
                                    :label="`${t('onlineAnnotation.noAnnotation')} (${totalImageNum - tagedNumber < 0 ? 0 : totalImageNum - tagedNumber})`"
                                    name="second" :disabled="totalImageNum - tagedNumber === 0"></el-tab-pane>
                                <el-tab-pane :label="`${t('onlineAnnotation.hasAnnotation')} (${tagedNumber})`"
                                    name="third" :disabled="tagedNumber === 0"></el-tab-pane>
                            </el-tabs>
                        </div>
                        <!-- 文件名称 -->
                        <div class="flex ml-10 mr-12 items-center">
                            <span class="mr-3">文件名称</span>
                            <el-input ref="FilenameRef" v-model="inputFilename" placeholder="请输入文件名称" clearable
                                style="width: 150px;" size="default" @focus="handleInput" @clear="handleSelectConfirm"
                                @keyup.enter="handleSelectConfirm" @blur="handleSelectConfirm" />
                        </div>
                        <!-- 标签 -->
                        <div class="flex items-center">
                            <span class="mr-3 ">标签</span>
                            <el-select v-model="selectLabel" placeholder="请选择标签" @change="handleSelectTagChange"
                                clearable style="width: 120px;">
                                <el-option v-for="item in selectItem" :key="item.tagId" :label="item.tagName"
                                    :value="item.tagId" />
                            </el-select>
                        </div>
                        <!-- 文件目录 -->
                        <div class="flex ml-10 mr-12 items-center">
                            <span class="mr-3">文件目录</span>
                            <el-tree-select v-model="selectFileName" :data="convertedData" placeholder="全部"
                                check-strictly :render-after-expand="false" style="width: 150px;">
                            </el-tree-select>
                        </div>
                    </div>
                    <!-- 右侧切换图标 -->
                    <div class="flex gap-5 h-7" style="flex-shrink: 0;">
                        <el-tooltip class="item" effect="light" :content="`清空选中项(${getShortcutKey('清空选中项')})`"
                            placement="top" :hide-after="0">
                            <Brush class="w-5 h-5 cursor-pointer" @click="clearSelectedList" />
                        </el-tooltip>
                        <el-tooltip class="item" effect="light" content="智能标注" placement="top" :hide-after="0">
                            <template #default>
                                <el-badge :hidden="!smartSetted" is-dot class="item ">
                                    <Pointer class="w-5 h-5 cursor-pointer" @click="smartClick"
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
                                        <el-button type="primary" @click="readParamsFile"
                                            class="ml-auto">加载参数</el-button>
                                    </div>
                                </el-form-item>
                                <template v-if="smartTaskList.length > 0">
                                    <el-form-item label="任务名称" label-width="70px">
                                        <el-select v-model="smartForm.task" placeholder="请选择任务名称和类型"
                                            @change="changeSelectTask">
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
                                        <el-form-item v-for="(value, key, index) in currentParams" :key="key"
                                            :label="key + ':'" class="w-1/2 px-2" label-width="70px">
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
                            <i :class="['iconfont', 'w-5', 'mt-[-5.5px]', 'cursor-pointer', 'icon-celvewenjian-lixian', 'fs-21']"
                                @click="changeOfflinePath"></i>
                        </el-tooltip>
                        <el-tooltip class="item" effect="light"
                            :content="countMode ? `多图(${getShortcutKey('切换单多图')})` : `单图(${getShortcutKey('切换单多图')})`"
                            placement="top" :hide-after="0">
                            <Switch class="w-5 h-5 mr-3 cursor-pointer" @click="countSwitch" />
                        </el-tooltip>
                    </div>
                </div>
            </div>
            <el-divider class="!my-1" border-style="dashed" />
            <div v-show="countMode" class="w-full h-full flex overflow-y-auto" v-loading="loading">
                <!-- 左边部分 -->
                <div v-loading="state.loading"
                    style="flex: 10; display: flex; flex-direction: column; height: 100%; overflow-x: auto;">
                    <div class="left-top" ref="leftTopDiv">
                        <!-- 上部分内容 -->
                        <FileDirTree ref="fileDirTreeRef" :fileTreeData="fileTreeData" @node-click="handleNodeClick"
                            :placeholder="'请输入文件目录名称'" :baseDatasetName="route.query.baseDatasetName as string" />
                        <canvas ref="imageCanvasRef" id="image-canvas" class="bgimage"></canvas>
                        <canvas ref="segcanvasRef" class="seg-canvas-container"></canvas>
                        <canvas ref="segtempCanvasRef" id="seg-temp-canvas" class="segtempcanvas"></canvas>
                        <el-tooltip class="item" effect="light"
                            :content="(!originalImageList.includes(selectedList[0]) && existsFile) ? `切换成原图` : `切换成缩略图`"
                            placement="left" :hide-after="0">
                            <el-button effect="dark"
                                class="absolute right-0 top-0 text-black w-auto h-auto text-lg p-2.5 bg-transparent"
                                style="border: none; color:#000; width: auto; height: auto; font-size:large; padding: 10px;background-color:  rgba(255, 255, 255, 0.5);"
                                @click="changeImagePath">{{
                                    (!originalImageList.includes(selectedList[0]) && existsFile) ? "缩略图" : "原图"
                                }}</el-button>
                        </el-tooltip>
                        <!-- 自定义圆形光标 -->
                        <div v-show="mode === 1 && (toolType === 7 || toolType === 10)" id="customCursor"
                            ref="customCursorRef">
                        </div>
                        <!-- 光标 canvas 用于绘制光标 -->
                        <div class="toolBar" v-show="mode === 1 && (toolType === 7 || toolType === 9) && switchToolBar">
                            <div class="mb-2"
                                style="display: flex; justify-content: space-between; align-items: center;">
                                <b>{{ toolType === 7 ? "画笔" : "钢笔" }}</b>
                                <el-tooltip class="item" effect="light" :content="`折叠`" placement="top" :hide-after="0">
                                    <Expand class="w-5 h-5 cursor-pointer" @click="switchToolBar = !switchToolBar" />
                                </el-tooltip>
                            </div>
                            <div class="mb-2">
                                <span>标签：{{ pathTagName }}</span>
                            </div>
                            <div class="mb-2">
                                <span>颜色：</span>
                                <el-input type="color" class="colorSelect"
                                    style="width: 80px; border: none; padding: none;" v-model="brushColor" disabled />
                            </div>
                            <div v-show="toolType === 7">
                                <span>宽度：</span>
                                <input type="range" min="10" max="30" id="widthRange" v-model="brushLineWidth" />
                                <span id="widthValue">{{ brushLineWidth }}</span>
                            </div>
                            <!-- <div v-show="toolType === 9">
                <el-tooltip class="item" effect="light" content="相同标签的相交轨迹会自动合并" placement="top" :hide-after="0">
                  <el-button id="eraser" :type="iserase ? 'primary' : 'default'" @click="eraser()"
                    size="small">合并</el-button>
                </el-tooltip>
              </div> -->
                            <!-- <p class="mt-2">
                                <b>工具栏</b>
                            </p>
                            <div class="tool mt-2">
                                <el-button id="eraser" :type="iserase ? 'primary' : 'default'" @click="eraser()"
                                    size="small">橡皮擦</el-button>
                                <el-button id="eraser" type="primary" @click="changeMode(2); mergeState = ''"
                                    size="small">完成</el-button>
                                <el-button id="clear" size="small" @click="handleDelete">清除</el-button>
                <el-button id="clear" size="small" @click="undoOperation">撤销</el-button>
                                <el-button id="undo" size="small">后退</el-button>
                <el-button id="redo" size="small">前进</el-button>
                            </div> -->
                        </div>
                        <div v-show="mode === 1 && !switchToolBar" style="position: absolute; top: 45px; right: 0; width: 32px;
            height: 32px; display: flex; justify-content: center; align-items: center; border: 1px solid #ccc; 
            border-radius: 6px; background-color: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); cursor: pointer;">
                            <el-tooltip effect="light" content="展开" placement="top" :hide-after="0">
                                <Fold class="w-5 h-5" @click="switchToolBar = !switchToolBar" />
                            </el-tooltip>
                        </div>
                        <div class="toolBar" v-show="mode === 1 && toolType === 10 && switchToolBar">
                            <div class="mb-2"
                                style="display: flex; justify-content: space-between; align-items: center;">
                                <b>橡皮擦</b>
                                <el-tooltip class="item" effect="light" :content="`折叠`" placement="top" :hide-after="0">
                                    <Expand class="w-5 h-5 cursor-pointer" @click="switchToolBar = !switchToolBar" />
                                </el-tooltip>
                            </div>
                            <div>
                                <span>宽度：</span>
                                <input type="range" min="10" max="30" id="widthRange" v-model="brushLineWidth" />
                                <span id="widthValue">{{ brushLineWidth }}</span>
                            </div>
                            <!-- <p class="mt-2"><b>工具栏</b></p>
              <div class="tool mt-2">
                <el-button id="clear" size="small" @click="drawShapes(9)">钢笔</el-button>
                <el-button id="clear" size="small" @click="drawShapes(7)">刷子</el-button> -->
                            <!-- <el-button id="clear" size="small" @click="handleDelete">清除</el-button>
                <el-button id="clear" size="small" @click="undoOperation">撤销</el-button> -->
                            <!-- <el-button id="undo" size="small">后退</el-button>
                <el-button id="redo" size="small">前进</el-button> -->
                            <!-- </div> -->
                        </div>
                        <div class="toolBar" style="width: 250px; display: flex; align-items: center;"
                            v-show="isMagicToolActive && maskToPolygon">
                            <span style="display: inline-block; white-space: nowrap; margin-right: 5px;">轮廓阈值：</span>
                            <el-slider v-model="pointsSlider" :show-tooltip="false" :min="0" :max="0.5" :step="0.05"
                                show-stops />
                            <el-button style="margin-left: 15px;" @click="donePoints">确定</el-button>
                        </div>
                        <div class="toolBar" style="width: 250px; align-items: center;"
                            v-show="isMagicToolActive && !maskToPolygon">
                            <div class="mb-2">
                                <span>标签：{{ magicTagName }}</span>
                            </div>
                            <div class="mb-2">
                                <span>颜色：</span>
                                <el-input type="color" class="colorSelect" style="width: 80px;" v-model="magicTagColor"
                                    disabled />
                                <el-button style="margin-left: 15px;" @click="donePoints">确定</el-button>
                            </div>
                        </div>
                        <div class="toolBar"
                            style="width: 200px; display: flex; align-items: center; justify-content: center;"
                            v-show="instance && instance.activeShape && !instance.activeShape.creating && instance.activeShape.type === 2">
                            <span
                                style="white-space: nowrap; margin-right: 5px; display: inline-flex; user-select: none; align-items: center;">坐标点：</span>
                            <el-icon class="mr-3 cursor-pointer"
                                style="font-size: 25px; display: inline-flex; align-items: center;">
                                <CirclePlusFilled @click="instance.addPoint()" />
                            </el-icon>
                            <el-icon class="mr-3 cursor-pointer"
                                style="font-size: 25px; display: inline-flex; align-items: center;">
                                <RemoveFilled @click="instance.deletePoint()" />
                            </el-icon>
                        </div>
                        <div class="pathMesg" v-show="showPathMesg && switchPathMesg">
                            <div class="mb-2"
                                style="display: flex; justify-content: space-between; align-items: center;">
                                <b>标注框信息</b>
                                <el-tooltip class="item" effect="light" :content="`折叠`" placement="top" :hide-after="0">
                                    <Expand class="w-5 h-5 cursor-pointer" @click="switchPathMesg = !switchPathMesg" />
                                </el-tooltip>
                            </div>
                            <div class="mb-2">
                                <el-tooltip :content="pathTagName" placement="top" effect="light"
                                    :disabled="!overflowIndexes.has(pathTagName)">
                                    <div :title="pathTagName"
                                        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width:150px;">
                                        标签：{{ pathTagName }}
                                    </div>
                                </el-tooltip>
                            </div>
                            <div class="mb-2">
                                <span>颜色：</span>
                                <el-input type="color" class="colorSelect" style="width: 80px;" v-model="pathTagColor"
                                    disabled />
                            </div>
                            <div class="mb-2">
                                <span>备注：</span>
                                <el-mention v-model="pathRemark" type="textarea" style="width: 170px"
                                    @input="havenRemark = true;" />
                            </div>
                            <div class="tool mt-2">
                                <el-popover placement="left" :width="320" trigger="hover">
                                    <template #reference>
                                        <el-button size="small">{{ '定量指标' }}</el-button>
                                    </template>
                                    <el-table :data="labelMsgList">
                                        <el-table-column width="100" property="tagName" label="标签" />
                                        <el-table-column width="100" property="confidence" label="置信度" />
                                        <el-table-column width="100" property="precision" label="准确率" />
                                    </el-table>
                                </el-popover>
                                <el-button size="small" @click="handlehide">{{ hideLabel ? '显示标签名' : '隐藏标签名'
                                }}</el-button>
                            </div>
                        </div>
                        <div v-show="showPathMesg && !switchPathMesg" style="position: absolute; bottom: 185px; right: 0; width: 32px;
            height: 32px; display: flex; justify-content: center; align-items: center; border: 1px solid #ccc; 
            border-radius: 6px; background-color: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); cursor: pointer;">
                            <el-tooltip effect="light" content="展开" placement="top" :hide-after="0">
                                <Fold class="w-5 h-5" @click="switchPathMesg = !switchPathMesg" />
                            </el-tooltip>
                        </div>
                        <!-- 右键菜单 -->
                        <div v-if="menuVisible" :style="{ top: menuPosition.y + 'px', left: menuPosition.x + 'px' }"
                            class="context-menu">
                            <el-input v-model="searchTerm" type="text" placeholder="搜索..." class="search-input"
                                style="border: none; margin-bottom: 0px;">
                                <template #append>
                                    <el-button :icon="Search" />
                                </template>
                            </el-input>
                            <el-divider class="!my-1" border-style="dashed" />
                            <ul v-show="filteredItems().length !== 0" class="menu-list">
                                <!-- 从 selectItem 中渲染 li 元素 -->
                                <li v-for="(item, index) in filteredItems()" :key="index"
                                    @click="menuChangeLabel(item.tagId)">
                                    <span class="menu-item-label">{{ item.tagName }}</span>
                                </li>
                            </ul>
                            <el-empty v-show="filteredItems().length === 0" class="mx-0 my-auto" :image-size="150">
                                <template #description>
                                    <span>
                                        没有搜索到该名称标签，
                                        <span class="blue-text" @click="handleInputConfirm(searchTerm)">
                                            新增此标签
                                        </span>
                                    </span>
                                </template>
                            </el-empty>
                        </div>
                    </div>
                    <div class="left-bottom">
                        <!-- 下部分内容 -->
                        <el-icon class="mr-2">
                            <el-tooltip class="item" effect="light" :content="`上一页`" placement="top" :hide-after="0">
                                <ArrowLeftBold
                                    :class="{ 'cursor-not-allowed': page.pageNum === 1, 'cursor-pointer': page.pageNum !== 1 }"
                                    @click="scrollLeft" />
                            </el-tooltip>
                        </el-icon>
                        <div class="col-span-1 overflow-x-auto" @wheel.prevent="handleWheelScroll"
                            ref="xscrollContainer" style="width:100%;">
                            <div v-if="imageList.length" class="flex gap-3" style="flex-wrap: nowrap; height: 100%;">
                                <div v-for="(image, index) in imageList" :key="image.fileId"
                                    :ref="el => setImageRef(el, index)"
                                    style="flex: 0 0 200px; height: 100%; border: 1px solid #F2F6FC">
                                    <div
                                        :class="['box-border relative flex items-center justify-center bg-br-extra-light border-3 hover:border-primary', { 'border-primary': selectedList.includes(image.fileId), 'border-body': !selectedList.includes(image.fileId) }]">
                                        <el-tag effect="dark" class="absolute top-0 left-0 z-10"
                                            style="border-radius: 0;z-index: 3;">{{
                                                index
                                                + 1 + page.pageSize * (page.pageNum - 1)
                                            }}</el-tag>
                                        <el-image class="w-full h-32" style="z-index: 2;" :src="imageViewList[index]"
                                            :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" :initial-index="index"
                                            fit="contain"
                                            @click="gotoImage(image.bucketName, image.fileName, image.fileId, index)"
                                            draggable="false">
                                            <template #placeholder>
                                                <div
                                                    class="flex items-center justify-center w-full h-full bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)] text-sm">
                                                    图片加载中<span class="dot">...</span></div>
                                            </template>
                                        </el-image>
                                        <span v-show="isSaved(image.fileId)" class="absolute right-0 bottom-0 ok-tag">
                                            OK
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <el-empty v-show="!imageList.length" class="mx-0 my-auto" description="无相关数据"
                                :image-size="97" />
                        </div>
                        <el-icon class="ml-2">
                            <el-tooltip class="item" effect="light" :content="`下一页`" placement="top" :hide-after="0">
                                <ArrowRightBold :class="{ 'cursor-not-allowed': !hasMore, 'cursor-pointer': hasMore }"
                                    @click="scrollRight" />
                            </el-tooltip>
                        </el-icon>
                    </div>
                </div>
                <!-- 右边部分 -->
                <div class="right" ref="rightDiv"
                    style="flex: 2; display: flex; align-items: center; flex-direction: column; width: 100%; height: 100%; max-height: 100%;">
                    <!-- TabBarArea 组件，占 50% -->
                    <div
                        style="flex: 1; width: 100%; max-height: 50%; border-bottom: 1px solid #e2e0e0; display: flex; flex-direction: column; overflow: hidden;">
                        <TabBarArea ref="tabBarAreaRef" :taskForm="taskForm" :resultMessage="resultMessage"
                            :selectItem="selectItem" :referSelectItem="referSelectItem" :selection="selection"
                            :instance="instance" :showTypeIcon="selectedTaskId !== ''" @changeCheck="changeCheck"
                            @deleteItem="deleteItem" @refreshCanvas="refreshCanvas" />
                    </div>
                    <!-- 标签栏，占 50% -->
                    <div
                        style="flex: 1; width: 100%; max-height: 50%; margin-top: 2px; border-top: 1px solid #e2e0e0; display: flex; flex-direction: column; overflow: hidden;">
                        <ObjectBarArea ref="objectBarAreaRef" :taskForm="taskForm"
                            :resultMessage="route.query.subLabelType === '2' ? resultMessage_object : resultMessage"
                            :taskType="2" :subLabelType="String(route.query.subLabelType) ?? '0'"
                            :selectItem="selectItem" :selection="selection" :toolList="toolList" :instance="instance"
                            :instance_bgimg="instance_bgimg" :controlKeyDown="controlKeyDown" @changeMode="changeMode"
                            @handleShapeMouse="handleShapeMouse" @brushMerge="brushMerge"
                            @updateResultMessage_object="updateResultMessage_object" />
                    </div>
                </div>
            </div>
            <div v-show="!countMode" class="w-full h-full flex overflow-y-auto" v-loading="loading">
                <div v-if="!loading && state.pagination?.total" v-loading="state.loading"
                    style="flex: 10;display: flex; flex-direction: column; height: 100%;">
                    <div style="overflow-x: hidden; margin-bottom: 15px; flex-grow: 1; height: 100%;">
                        <div class="mask fixed bg-[#409eff] opacity-40 z-[5]" v-show="positionList.is_show_mask"
                            :style="'width:' + mask_width + 'left:' + mask_left + 'height:' + mask_height + 'top:' + mask_top">
                        </div>
                        <el-checkbox-group v-model="selectedList" class="checkboxGroup" style=" flex-grow: 1;">
                            <div class="unselectable-text w-full grid grid-flow-row gap-4" :class="{
                                'grid-cols-6': pageSize === 18,
                                'grid-cols-5': pageSize === 15,
                                'grid-cols-4': pageSize === 12,
                                'grid-cols-3': pageSize === 9
                            }">
                                <div v-for="(image, index) in state.dataList" :key="image.fileId" class="relative">
                                    <div
                                        :class="['box-border relative flex items-center justify-center bg-br-extra-light border-4 hover:border-primary',
                                            { 'border-primary': selectedImages.has(image.fileId), 'border-body': !selectedImages.has(image.fileId) }]">
                                        <el-checkbox :key="image.fileId" :label="image.fileName" :value="image.fileId"
                                            :class="selectedList.includes(image.fileId) ? 'checkbox aa-active' : 'checkbox'"
                                            @change="checkItem(image.fileId)">
                                            <el-tag effect="dark" class="absolute top-0 left-0 z-10"
                                                style="border-radius: 0;height: 20px;z-index: 3;">{{
                                                    (index
                                                        + 1) + (pageCurrent - 1) * pageSize
                                                }}</el-tag>
                                            <div @click="!positionList.is_show_mask ? gotoImageFromMutil(index) : null"
                                                :style="{ cursor: positionList.is_show_mask ? 'default' : 'pointer' }">
                                                <el-image v-show="imageVisibility[index]"
                                                    class="w-full h-40 object-contain" style="z-index: 2;"
                                                    :src="imageViewList[index]" fit="contain" :zoom-rate="1.2"
                                                    :max-scale="7" :min-scale="0.2" :initial-index="index">
                                                    <template #placeholder>
                                                        <div
                                                            class="flex items-center justify-center w-full h-full bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)] text-sm">
                                                            图片加载中<span class="dot">...</span></div>
                                                    </template>
                                                </el-image>
                                                <canvas v-show="!imageVisibility[index]" :key="index"
                                                    :id="`smallcontainer${index}`" class="smallcontainer"></canvas>
                                                <span class="absolute right-[25px] top-[5px] text-[#0051ff]"
                                                    style="z-index:2" v-show="selectedList.includes(image.fileId)">
                                                    {{
                                                        (selectedList.indexOf(image.fileId)
                                                            +
                                                            1) }}</span>
                                                <span v-show="isSaved(image.fileId)"
                                                    class="absolute right-0 bottom-0 ok-tag">
                                                    OK
                                                </span>
                                            </div>
                                        </el-checkbox>
                                    </div>
                                    <div class="mt-2 flex justify-between items-center bg-br-extra-light">
                                        <!-- <el-tooltip :content="image.fileName" placement="top" :disabled="!overflowIndexes.has(image.fileId)">
                    <div v-overflow="handleOverflow(image.fileId)" class="p-1 text-base leading-5 truncate">
                      {{ image.fileName }}
                    </div>
                  </el-tooltip> -->
                                        <el-popover placement="bottom-start" class="w-full"
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
                                                <div v-if="!image.tagInfoList || image.tagInfoList.length === 0"
                                                    class=" ml-2 p-1 text-base leading-5 truncate"
                                                    style="color:#B0AFAE">
                                                    {{ '无标签' }}
                                                </div>
                                                <div v-else
                                                    v-overflow="handleOverflow(showTagName(image.tagInfoList[0]) ?? '无标签')"
                                                    @mouseover="handleMouseOverTagName(image.tagInfoList)"
                                                    class=" ml-2 p-1 text-base leading-5 truncate">
                                                    {{ showTagName(image.tagInfoList[0]) }}
                                                </div>
                                            </template>
                                        </el-popover>
                                        <div class="text-lg flex justify-center">
                                            <el-icon v-show="isSaved(image.fileId)"
                                                class="cursor-pointer hover:text-[#2e5cf6]"
                                                @click.stop.prevent="toggleImageCanvas(index)">
                                                <Refresh />
                                            </el-icon>
                                            <el-icon class="cursor-pointer hover:text-[#2e5cf6]"
                                                @click.stop.prevent="ImageInfoRef.openDialog(image, 0)">
                                                <Tickets />
                                            </el-icon>
                                            <el-icon class="cursor-pointer hover:text-[#2e5cf6]"
                                                @click.stop.prevent="showImage(index, image.fileId, image.bucketName, image.fileName, isSaved(image.fileId) && !imageVisibility[index])">
                                                <FullScreen />
                                            </el-icon>
                                            <el-icon v-show="isSaved(image.fileId)"
                                                class="cursor-pointer hover:text-[#2e5cf6]"
                                                @click.stop.prevent="showMask(index, image.fileId, image.bucketName, image.fileName)">
                                                <Picture />
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
                <el-empty v-else class="mx-0 my-auto w-full h-full" v-loading="state.loading"
                    :description="activeName === 'second' ? '暂无未标注数据' : (activeName === 'third' && selectLabel === '' ? '暂无已标注数据' : '无相关数据')"
                    :image-size="250" />
                <!-- <el-image-viewer v-if="dialogImageVisible" @close="dialogImageVisible = false" :url-list="imageViewList"
          :initial-index="currentImageIndex" /> -->
                <el-image-viewer v-if="dialogCanvasVisible" @close="dialogCanvasVisible = false"
                    :url-list="[singleImageUrl]" />
            </div>
            <ImageInfoDialog @refresh="getDataList()" ref="ImageInfoRef" />
            <!-- 快捷键  -->
            <ShortCutKey ref="shortCutKeyRef" @close="updateShortcutList('2')" @mounted="getShortcutList('2')" />

            <el-button v-show="countMode" class="floating-button" type="primary" circle
                @click="shortCutKeyRef.openDialog(2)">
                <el-tooltip class="item" effect="light" content="编辑快捷键(Ctrl + Alt)" placement="top" :hide-after="0">
                    <Monitor class="w-5 h-5 cursor-pointer" />
                </el-tooltip>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts" name="imageSegmentation">
import { BasicTableProps, useTable, } from '/@/hooks/table';
import { fetchBaseImageListNew, getDatasetById } from "/@/api/dataset/manage";
import { fetchList as fetchTaskList, getTaskObj, putTaskObj, getLabeledTotal } from '/@/api/annotate/annotation-task';
import { addLabelObj, putLabelObj, fetchLabelList, delLabelObj, readJSONFile } from '/@/api/annotate/onlinelabel';
import { upload } from '/@/api/admin/file';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { fileUrl } from "/@/utils/env";
import router from '/@/router';
import mittBus from "/@/utils/mitt";
import { ElInput, TabsPaneContext, ElLoading, ElDrawer } from 'element-plus'
import { Search, Unlock } from '@element-plus/icons-vue'; // 导入Search图标
import { deepClone } from '/@/utils/other';

import CanvasSelect from 'canvas-select-plus'
import pako from 'pako';
import * as martinez from 'martinez-polygon-clipping';
// import { fa, tr } from 'element-plus/es/locale';
import { EditPen, Edit, Collection, Delete, Coin, ScaleToOriginal, Crop, Brush, Pointer, Picture, RefreshLeft, RefreshRight, Switch, ArrowLeftBold, ArrowRightBold, Files } from '@element-plus/icons-vue'
import { dirTree } from '/@/api/admin/file';
import { currentUserOfflinePath } from '/@/api/admin/offline';
import axios from 'axios';
import other from '/@/utils/other';

const { t } = useI18n();
const ImageInfoDialog = defineAsyncComponent(() => import('../../dataset/dataset/imageInfoDialog.vue'));
const ShortCutKey = defineAsyncComponent(() => import('./shortCutKey.vue'));
const FileDirTree = defineAsyncComponent(() => import('./fileDirTree.vue'));
const TabBarArea = defineAsyncComponent(() => import('./tabBarArea.vue'));
const ObjectBarArea = defineAsyncComponent(() => import('./objectBarArea.vue'));

const route = useRoute();


// 控制变量
const ImageInfoRef = ref();
const loading = ref(false);
const handelLoading = ref(false);
const selectedImages = ref(new Set<string>());
const overflowIndexes = ref(new Set<string>());
const shortCutKeyRef = ref();
const fileDirTreeRef = ref();
const tabBarAreaRef = ref();
const objectBarAreaRef = ref();

// 弹出框控制变量
const dialogImageVisible = ref(false);
const dialogCanvasVisible = ref(false);

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
}
// 分页变量
const page = reactive<{
    pageSize: number;
    pageNum: number;
    totals: number;
}>({
    pageSize: 18,
    pageNum: 1,
    totals: 0,
});

const form = reactive({
    datasetId: '',
    imageIds: '',
})

// #region *****************************树形目录结构*******************************
interface Tree {
    id: string;
    label: string;
    parentId: string | null;
    children?: Tree[]; // 可选的 children 属性，表示子节点
}

const fileTreeData = ref<Tree[]>([{
    id: '',
    label: '',
    parentId: null,
    children: [],
}]);

const getFileDir = async (bucketName: string) => {
    const res = await dirTree({ bucketName: bucketName });
    fileTreeData.value.length = 0;
    fileTreeData.value = res.data;
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
    if (!countMode.value) {
        activeName.value = "first";
        state.queryForm.bucketName = selectFileName;
        filterbyBucketName();
    }
}, { deep: true });

const filterbyBucketName = async (pageNum: number = 1, pageSize: number = 18, changePage: boolean = true) => {
    loading.value = true;
    try {
        const response = await fetchBaseImageListNew({
            baseDatasetId: state.queryForm.baseDatasetId,
            bucketName: state.queryForm.bucketName,
            current: pageNum,
            size: pageSize,
            fileName: '',
            isLabeled: state.queryForm.isLabeled,
            tagId: state.queryForm.tagId,
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
            if (records[i].tagInfoList) {
                let optionMsg: Option[] = [];
                for (let j = 0; j < records[i].tagInfoList.length; j++) {
                    const tagInfo = JSON.parse(records[i].tagInfoList[j].tagInfo);
                    if (tagInfo) {
                        const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.tagId));
                        if (tagMsg) {
                            optionMsg.push({
                                label: tagMsg.tagName,
                                tagId: String(tagInfo.tagId),
                                fillStyle: tagInfo.fillStyle,
                                coor: tagInfo.coor,
                                type: tagInfo.type,
                                // ...(tagInfo.boundingRect ? { boundingRect: tagInfo.boundingRect } : {}),
                                ...(tagInfo.encodePixelData ? { encodePixelData: tagInfo.encodePixelData } : {}),
                                ...(tagInfo.startPoint ? { startPoint: tagInfo.startPoint } : {}),
                                ...(tagInfo.width ? { width: tagInfo.width } : {}),
                                ...(tagInfo.height ? { height: tagInfo.height } : {}),
                                ...(tagInfo.brushWidth ? { brushWidth: tagInfo.brushWidth } : {}),
                                ...(tagInfo.lineWidth ? { lineWidth: tagInfo.lineWidth } : {}),
                                ...(tagInfo.iseraser ? { iseraser: tagInfo.iseraser } : {}),
                                ...(tagInfo.radius ? { radius: tagInfo.radius } : {}),
                                active: false,
                                creating: false,
                                dragging: false,
                                hiddening: false,
                                locking: false
                            });
                        }
                    }
                }
                resultList.push({
                    labelId: records[i].labelId,
                    fileId: records[i].fileId,
                    // type: records[i].labelFileName,
                    options: optionMsg
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
            instance.setData([]);
            instance_bgimg.setData([]);
            instance_bgimg.setImage('');
            instance.update();
            instance_bgimg.update();
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

// #region *****************************标注或验证定量指标*****************************
const labelMsgList = ref([
    {
        tagName: '',
        confidence: '',
        precision: '',
    }
]);
// #endregion

// #region *****************************单图模式canvas*******************************
let instance: CanvasSelect;
let instance_bgimg: CanvasSelect;
let instance_temp: CanvasSelect;
const xscrollContainer: Ref<HTMLElement | null> = ref(null);
const imageList: Ref<imageItem[]> = ref([]); //保存已滚动加载的图片
const imageViewList: Ref<string[]> = ref([]);
const hasMore = ref(true);// 记录是否还可以滚动刷新
const editedItem = ref(''); // 用于记录正在编辑标签的索引
const lockedItem = ref(''); // 用于记录锁定标签的索引

// const currentImageIndex = ref(0);
const singleImageUrl = ref(''); // 存储单张图片的 URL

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
        if (countMode) {
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

const showImage = async (index: number, fileId: string, bucketName: string, fileName: string, isSaved: boolean) => {
    if (isSaved) {
        // 将 Canvas 内容转换为图片 URL
        instance_temp.setImage(formatUrl(bucketName, fileName, fileId));
        const shape = resultList.find(item => item.fileId === fileId);
        if (shape) {
            // 根据tagId为每个图形设置标签名称和颜色（应对标签修改的情况）
            for (let i = 0; i < shape.options.length; i++) {
                let index = selectItem.findIndex((item: Tag) => item.tagId === shape.options[i].tagId);
                if (index !== -1) {
                    // shape.options[i].label = selectItem[index].tagName;
                    // if (shape.options[i].type === 7) {
                    //   shape.options[i].strokeStyle = selectItem[index].color;
                    //   shape.options[i].fillStyle = selectItem[index].color;
                    // } else {
                    shape.options[i].label = '';
                    shape.options[i].strokeStyle = hexToRgba(selectItem[index].color ?? '', 0.4);
                    shape.options[i].fillStyle = hexToRgba(selectItem[index].color ?? '', 0.4);
                    // }
                    // shape.options[i].textFillStyle = selectItem[index].color;
                } else {
                    // 说明该标签已被删除，置空，在handlesave时除掉
                    shape.options[i].label = '';
                    shape.options[i].strokeStyle = '';
                    shape.options[i].fillStyle = '';
                    // shape.options[i].textFillStyle = '';
                }
                // 对刷子和橡皮檫轨迹进行解码和反压缩
                if ((shape.options[i].type === 9 || shape.options[i].type === 7 || shape.options[i].type === 4) && 'encodedData' in shape.options[i].coor) {
                    shape.options[i].coor = decodeAndDecompressPoints(shape.options[i].coor.encodedData, shape.options[i].coor.startX, shape.options[i].coor.startY);
                    if (shape.options[i].type === 9) { shape.options[i].coor.push([-1, -1]); }
                }
            }
        }
        await instance_temp.setData(shape?.options);
        await new Promise(requestAnimationFrame);
        setTimeout(() => {
            if (segtempCanvasRef.value) {
                singleImageUrl.value = segtempCanvasRef.value.toDataURL("image/png");
            }
            // 打开图片查看器
            dialogCanvasVisible.value = true;
        }, 500);
        // console.log("index", index);
        // console.log("create", singleImageUrl.value);
    } else {
        instance_temp.setImage(formatUrl(bucketName, fileName, fileId));
        await instance_temp.setData([]);
        await new Promise(requestAnimationFrame);
        setTimeout(() => {
            if (segtempCanvasRef.value) {
                singleImageUrl.value = segtempCanvasRef.value.toDataURL("image/png");
            }
            dialogCanvasVisible.value = true;
        }, 500);
    }
};

const showMask = async (index: number, fileId: string, bucketName: string, fileName: string) => {
    // bucketName = bucketName.replace(/images$/, "mask");
    // fileName = fileName.replace(/\.\w+$/, ".png");
    singleImageUrl.value = '';
    instance_temp.setImage(formatUrl(bucketName, fileName, fileId), 1);

    const shape = resultList.find(item => item.fileId === fileId);
    if (shape) {
        // 根据tagId为每个图形设置标签名称和颜色（应对标签修改的情况）
        for (let i = 0; i < shape.options.length; i++) {
            let index = selectItem.findIndex((item: Tag) => item.tagId === shape.options[i].tagId);
            if (index !== -1) {
                shape.options[i].label = '';
                shape.options[i].strokeStyle = selectItem[index].color;
                shape.options[i].fillStyle = selectItem[index].color;
            } else {
                // 说明该标签已被删除，置空，在handlesave时除掉
                shape.options[i].label = '';
                shape.options[i].strokeStyle = '';
                shape.options[i].fillStyle = '';
            }
            // 对刷子和橡皮檫轨迹进行解码和反压缩
            if ((shape.options[i].type === 9 || shape.options[i].type === 7 || shape.options[i].type === 4) && 'encodedData' in shape.options[i].coor) {
                shape.options[i].coor = decodeAndDecompressPoints(shape.options[i].coor.encodedData, shape.options[i].coor.startX, shape.options[i].coor.startY);
                if (shape.options[i].type === 9) { shape.options[i].coor.push([-1, -1]); }
            }
        }
    }
    await instance_temp.setData(shape?.options ?? [], true, true);
    await new Promise(requestAnimationFrame);
    setTimeout(() => {
        if (segtempCanvasRef.value && singleImageUrl.value === '') {
            singleImageUrl.value = segtempCanvasRef.value.toDataURL("image/png");
        }
        dialogCanvasVisible.value = true;
    }, 500);
}

function dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

// 下载文件的函数
function downloadFile(file: File) {
    const url = URL.createObjectURL(file);  // 创建一个 URL 对象
    const link = document.createElement('a');  // 创建一个 <a> 标签
    link.href = url;  // 设置下载链接
    link.download = file.name;  // 设置文件名
    document.body.appendChild(link);  // 将 <a> 标签添加到文档中
    link.click();  // 模拟点击 <a> 标签开始下载
    document.body.removeChild(link);  // 下载后移除 <a> 标签
    URL.revokeObjectURL(url);  // 释放 URL 对象
}

async function uploadMaskImage(fileId: string, bucketName: string, fileName: string) {
    instance_temp.setImage(formatUrl(bucketName, fileName, fileId), 0);

    const shape = resultList.find(item => item.fileId === fileId);
    if (shape) {
        // 根据tagId为每个图形设置标签名称和颜色（应对标签修改的情况）
        for (let i = 0; i < shape.options.length; i++) {
            let index = selectItem.findIndex((item: Tag) => item.tagId === shape.options[i].tagId);
            if (index !== -1) {
                shape.options[i].label = '';
                // shape.options[i].strokeStyle = selectItem[index].color;
                shape.options[i].strokeStyle = "rgba(0, 0, 0, 1)";
                shape.options[i].fillStyle = selectItem[index].color;
            } else {
                // 说明该标签已被删除，置空，在handlesave时除掉
                shape.options[i].label = '';
                shape.options[i].strokeStyle = '';
                shape.options[i].fillStyle = '';
            }
            // 对刷子和橡皮檫轨迹进行解码和反压缩
            if ((shape.options[i].type === 9 || shape.options[i].type === 7 || shape.options[i].type === 4) && 'encodedData' in shape.options[i].coor) {
                shape.options[i].coor = decodeAndDecompressPoints(shape.options[i].coor.encodedData, shape.options[i].coor.startX, shape.options[i].coor.startY);
                if (shape.options[i].type === 9) { shape.options[i].coor.push([-1, -1]); }
            }
        }
    }
    await instance_temp.setData(shape?.options ?? [], true, true);
    await new Promise(requestAnimationFrame);

    const imageData = instance_temp.canvas.getContext('2d')!.getImageData(
        instance_temp.originX,
        instance_temp.originY,
        instance_temp.IMAGE_WIDTH,
        instance_temp.IMAGE_HEIGHT
    );

    const { width, height, data } = imageData;

    // for (let i = 0; i < width * height; i++) {
    //   const r = data[i * 4 + 0];
    //   const g = data[i * 4 + 1];
    //   const b = data[i * 4 + 2];
    //   const a = 255;
    //   const key = `${r},${g},${b},${a}`;


    //   // 获取类别编号
    //   let label = indexToColorMap.get(key) ?? 0; // 默认设为0类（背景）
    //   // if (label !== 0) label = 240;

    //   // 将灰度值转为类别编号，并更新 RGBA 数据
    //   data[i * 4 + 0] = label; // R
    //   data[i * 4 + 1] = label; // G
    //   data[i * 4 + 2] = label; // B
    //   data[i * 4 + 3] = 255;   // A (完全不透明)
    // }


    // 创建临时 canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;

    // 设置临时 canvas 的尺寸为原始图像尺寸
    tempCanvas.width = width;
    tempCanvas.height = height;


    tempCtx.putImageData(imageData, 0, 0);

    // 创建新的 canvas 用于缩放
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');
    if (!newCtx) {
        throw new Error('无法获取新 canvas 的 2D 上下文');
    }
    newCanvas.width = instance_temp.IMAGE_ORIGIN_WIDTH;
    newCanvas.height = instance_temp.IMAGE_ORIGIN_HEIGHT;

    // 禁用图像平滑
    newCtx.imageSmoothingEnabled = false;
    // 有些浏览器需要额外设置平滑质量
    newCtx.imageSmoothingQuality = 'high';

    // 将临时 canvas 的内容绘制到新 canvas 并缩放
    newCtx.drawImage(tempCanvas, 0, 0, instance_temp.IMAGE_ORIGIN_WIDTH, instance_temp.IMAGE_ORIGIN_HEIGHT);

    // 导出该区域为 PNG 图片的 dataURL
    const dataURL = newCanvas.toDataURL('image/png');
    const blob = dataURLtoBlob(dataURL);
    const file = new File([blob], fileName.split('.')[0] + '.png', { type: 'image/png' });
    // downloadFile(file);

    const maskBucketName = bucketName.replace(/\/[^\/]*$/, '/') + taskForm.taskName + "/mask";
    console.log("maskBucketName", maskBucketName);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('params', JSON.stringify({
        uploadType: '4',
        dataType: 0,
        bucketName: maskBucketName
    }));

    await upload(formData).then((response) => {
        console.log("response", response);
        // useMessage().success('上传成功！');
    }).catch((err) => {
        useMessage().error('Mask上传失败！');
    });
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

// 单次滚动加载数据
const loadImageList = async () => {
    // 防止重复请求或没有更多数据时的请求
    // if (loading.value || !hasMore.value) return;
    handelLoading.value = true;
    try {
        const response = await fetchBaseImageListNew({
            baseDatasetId: state.queryForm.baseDatasetId,
            current: page.pageNum,
            size: page.pageSize,
            fileName: '',
            isLabeled: state.queryForm.isLabeled,
            tagId: state.queryForm.tagId,
            taskId: state.queryForm.taskId,
            descs: '',
            ascs: '',
        });
        // 每次滚动刷新可以获取page.pageNum页的数据，
        const data = response.data;
        const { current, pages, size, total, records } = data;
        page.pageNum = current;
        page.pageSize = size;
        page.totals = total;
        imageList.value.length = 0;
        imageViewList.value.length = 0;
        resultList.length = 0;
        imageList.value.push(...records);
        imageViewList.value.push(...records.map((item: imageItem) => formatUrl(item.bucketName, item.fileName, item.fileId)));
        for (let i = 0; i < records.length; i++) {
            if (records[i].tagInfoList && records[i].tagInfoList.length > 0) {
                let options: Option[] = [];
                for (let j = 0; j < records[i].tagInfoList.length; j++) {
                    const tagInfo = JSON.parse(records[i].tagInfoList[j].tagInfo);
                    if (tagInfo) {
                        const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.tagId));
                        if (tagMsg) {
                            options.push({
                                label: tagMsg.tagName,
                                tagId: String(tagInfo.tagId),
                                fillStyle: tagInfo.fillStyle,
                                coor: tagInfo.coor,
                                type: tagInfo.type,
                                // ...(tagInfo.boundingRect ? { boundingRect: tagInfo.boundingRect } : {}),
                                ...(tagInfo.encodePixelData ? { encodePixelData: tagInfo.encodePixelData } : {}),
                                ...(tagInfo.startPoint ? { startPoint: tagInfo.startPoint } : {}),
                                ...(tagInfo.width ? { width: tagInfo.width } : {}),
                                ...(tagInfo.height ? { height: tagInfo.height } : {}),
                                ...(tagInfo.lineWidth ? { lineWidth: tagInfo.lineWidth } : {}),
                                ...(tagInfo.iseraser ? { iseraser: tagInfo.iseraser } : {}),
                                ...(tagInfo.radius ? { radius: tagInfo.radius } : {}),
                                active: false,
                                creating: false,
                                dragging: false,
                                hiddening: false,
                                locking: false
                            });
                        }
                    }
                }
                resultList.push({
                    labelId: records[i].labelId,
                    fileId: records[i].fileId,
                    options: options
                });
            }
        }
        // 判断是否存在下一页
        hasMore.value = current < pages;
        // // 在 DOM 更新完成后执行下面的逻辑
        // nextTick(() => {
        //   // 如果是 countMode 模式，跳转到第一张图片
        //   if (!countMode.value) {
        //     imageList.value.forEach((item, index) => {
        //       initializeCanvas(index, item.fileId, item.bucketName, item.fileName);
        //     });
        //   }
        // });
    } catch (error) {
        console.error('Failed to load images', error);
    } finally {
        handelLoading.value = false;
    }
};

const handleOverflow = (index: string) => (el: any) => {
    nextTick(() => {
        if (el.scrollWidth > el.clientWidth) {
            overflowIndexes.value.add(index);
        } else {
            overflowIndexes.value.delete(index);
        }
    });
};

const setImageRef = (el: Element | HTMLElement | ComponentPublicInstance | null, index: number) => {
    if (el instanceof HTMLElement) {
        imageRefs.value[index] = el;
    }
};

const gotoImageFromMutil = async (index: number) => {
    countMode.value = !countMode.value;
    hasMore.value = true;
    // handelLoading.value = true;
    // if (isLabeled.value === '') {
    //   activeName.value = "first";
    // } else if (isLabeled.value === 'false') {
    //   activeName.value = "second";
    // } else {
    //   activeName.value = "third";
    // }
    // isLabeled.value = '';
    // state.queryForm.isLabeled = '';
    // state.queryForm.tagId = '';
    state.queryForm.bucketName = 'dataset/' + route.query.baseDatasetName + '/base';
    await filterbyBucketName(state.pagination!.current, state.pagination!.size, false);
    gotoImage(imageList.value[index].bucketName, imageList.value[index].fileName, imageList.value[index].fileId, index);
    // handelLoading.value = false;
}

const gotoImage = async (bucketName: string, fileName: string, nextfileId: string, index: number, reset: boolean = false) => {
    // 先判断当前图是否有未标注的框（resultMessage记录当前canvas上的图形）
    let allLabeld = true;
    for (let i = 0; i < resultMessage.value.length; i++) {
        if (resultMessage.value[i].tagId === undefined || resultMessage.value[i].tagId === '') {
            allLabeld = false;
            break;
        }
    }
    if (!allLabeld) {
        useMessage().wraning('请为所有标注设置标签！！！');
        return;
    }
    if (!reset && nextfileId === selectedList.value[0] && isSaved(selectedList.value[0]) && resultMessage.value.length !== 0) {
        return;
    }
    // 再判断当前图（跳转前的图）是否需要保存
    if (!havenSaved.value) {
        if (menuVisible) menuVisible.value = false;
        // 如果图片被标注过，比较是否有变化
        if (instance.doneList.length > 1 || havenRemark.value) {
            try {
                await useMessageBox().confirm('当前图片的操作尚未保存，是否保存？');
                await handleSave(true, index);
                return;
            } catch {
                havenSaved.value = true;
            }
        }
    }
    // 最后清理画布，加载新内容，滚动
    havenSaved.value = false;
    // 清空图形
    // instance.deleteAllShape();
    // 重置撤销和重置数组
    instance.hideList.length = 0;
    instance.doneList.length = 0;
    instance.undoList.length = 0;
    hideNum.value = 0;
    showPathMesg.value = false;
    havenRemark.value = false;
    mergeState.value = "";
    objectBarAreaRef.value?.resetObjectBar();
    if (tabBarAreaRef.value?.hidedTags) {
        tabBarAreaRef.value.hidedTags.length = 0;
    }
    // 隐藏标注提示框
    // showPathMesg.value = false;
    // 取消专注模式
    if (isSaved(nextfileId) || selectItem.length === 0) {
        changeMode(2);
        selection.value = '0';
    } else {
        const tool = toolList.find(item => item.subLabelType === route.query.subLabelType);
        drawShapes(tool?.type ?? 1);
    }
    // 更换选中项、图片
    selectedList.value = [];
    currentbucketName.value = bucketName;
    currentfileName.value = fileName;
    // resultMessage_object.value = [];
    needSaveBrush = false;
    // needUpdate.value = true;
    instance_bgimg.setImage(formatUrl(bucketName, fileName, nextfileId));
    instance.setImage(formatUrl(bucketName, fileName, nextfileId), 0);
    instance_temp.setImage(formatUrl(bucketName, fileName, nextfileId));
    selectedList.value.push(nextfileId);
    selectedIndex.value = index;
    if (route.query.subLabelType === '2') {
        instance.dataset = [];
        // brushLineWidth.value = 1;
    }
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
    // changeCheck(-1, '');
    // 查询新图片是否已标注，绘制对应的图形
    if (isSaved(nextfileId)) {
        const shape = resultList.find(item => item.fileId === nextfileId);
        if (shape) {
            // 根据tagId为每个图形设置标签名称和颜色（应对标签修改的情况）
            for (let i = 0; i < shape.options.length; i++) {
                let index = selectItem.findIndex((item: Tag) => item.tagId === shape.options[i].tagId);
                if (index !== -1) {
                    shape.options[i].label = selectItem[index].tagName;
                    // if (shape.options[i].type === 7) {
                    //   shape.options[i].strokeStyle = selectItem[index].color;
                    //   shape.options[i].fillStyle = selectItem[index].color;
                    // } else {
                    shape.options[i].strokeStyle = hexToRgba(selectItem[index].color ?? '', 0.4);
                    shape.options[i].fillStyle = hexToRgba(selectItem[index].color ?? '', 0.4);
                    // }
                    // shape.options[i].textFillStyle = selectItem[index].color;
                } else {
                    // 说明该标签已被删除，置空，在handlesave时除掉
                    // shape.options[i].label = '';
                    // shape.options[i].strokeStyle = '';
                    // shape.options[i].fillStyle = '';
                    // shape.options[i].textFillStyle = '';
                    shape.options.splice(i, 1);
                }
                // 对刷子和橡皮檫轨迹进行解码和反压缩
                if ((shape.options[i].type === 9 || shape.options[i].type === 7 || shape.options[i].type === 4) && 'encodedData' in shape.options[i].coor) {
                    shape.options[i].coor = decodeAndDecompressPoints(shape.options[i].coor.encodedData, shape.options[i].coor.startX, shape.options[i].coor.startY);
                    if (shape.options[i].type === 9) { shape.options[i].coor.push([-1, -1]); }
                }
            }
        }
        currentOptions.value = shape?.options ?? [];
        // instance.setData(shape?.options);
    } else {
        currentOptions.value = [];
        // instance.setData([]);
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
// #endregion

// 切换单图(true)和多图模式(false)*********************************************
const countMode = ref(true);
const countSwitch = async () => {
    if (countMode.value && (instance.doneList.length > 1 || havenRemark.value)) {
        try {
            await useMessageBox().confirm('当前图片标注已做修改，是否保存');
            await handleSave();
        } catch {
            instance.doneList.length = 0;
            havenRemark.value = false;
        }
    }
    countMode.value = !countMode.value;
    // 多——>单
    if (countMode.value) {
        // 跳转到selectedList的第一个选中项
        hasMore.value = true;
        loading.value = true;
        page.pageSize = state.pagination?.size ?? 18;
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
        // page.pageSize = 18;
        // page.pageNum = 2;
        // page.totals = 0;
        showPathMesg.value = false;
        inputFilename.value = '';
        selectLabel.value = '';
        activeName.value = "first";
        state.queryForm.isLabeled = '';
        state.queryForm.tagId = '';
        state.queryForm.bucketName = '';
        // selectedList.value.length = 0;
        imageList.value.length = 0;
        imageViewList.value.length = 0;
        resultList.length = 0;
        // filterbyBucketName();
        // getDataList();
        currentChangeHandle(page.pageNum);
        getLabeledTotal({ taskId: route.query.taskId, bucketName: state.queryForm.bucketName }).then((res) => {
            tagedNumber.value = res.data.total;
        }).catch((err) => {
            useMessage().error(err.msg);
        });
        fileDirTreeRef.value.resetTree();
    }
}


// 单图模式下，图片跳转
const imageRefs = ref<(Element | HTMLElement | null)[]>([]);
const fileSize = ref('');

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
    instance_bgimg.setImage(formatUrl(imageList.value[selectedIndex.value].bucketName,
        imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId));
    instance.setImage(formatUrl(imageList.value[selectedIndex.value].bucketName,
        imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId));
    instance_temp.setImage(formatUrl(imageList.value[selectedIndex.value].bucketName,
        imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId));
}

// #region *****************************获取图片列表(多图)*****************************
const state: BasicTableProps = reactive<BasicTableProps>({
    createdIsNeed: false,
    pagination: {
        size: 18,
        current: 1,
        pageSizes: [9, 12, 15, 18],
        // pageSizes: [12, 16, 20, 24],
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

interface TagInfo {
    confidence: string;
    labelId: string;
    scor: string;
    tagId: string;
    tagInfo: string;
    tagInfoId: string;
}

const pageSize = ref(18);
const pageCurrent = ref(1);
const pageTotal = ref(1);
const tagedNumber = ref(0);
//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle } = useTable(state);

const openCanvas = async (param: any) => {
    loading.value = true;
    try {
        const res = await getDatasetById(param.datasetId);
        if (res && res.data) {
            state.queryForm.baseDatasetId = res.data.baseDatasetId;
            state.queryForm.taskId = route.query.taskId;
            form.datasetId = res.data.datasetId;
            let imageIdString = res.data.imageIds;
            // 精度丢失
            let imageIdStringParse = JSON.parse(imageIdString);
            // const parsedImageIds = imageIdString.slice(1, -1).split(',');
            // selectedImages.value = parsedImageIds.map((id: String) => id.trim());
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

const initializeCanvas = (index: number, fileId: string, bucketName: string, fileName: string) => {
    let id = "#smallcontainer" + index;
    let smallinstance: CanvasSelect;

    smallinstance = new CanvasSelect(id);
    smallinstance.labelFillStyle = 'transparent';
    smallinstance.MIN_LENGTH = 80;
    smallinstance.hideLabel = true;
    smallinstance.setImage(formatUrl(bucketName, fileName, fileId));
    smallinstance.on('fitZoom', () => {
        smallinstance.lock = true;
    });

    if (isSaved(fileId)) {
        const shape = resultList.find(item => item.fileId === fileId);
        if (shape) {
            // 根据tagId为每个图形设置标签名称和颜色（应对标签修改的情况）
            for (let i = 0; i < shape.options.length; i++) {
                let index = selectItem.findIndex((item: Tag) => item.tagId === shape.options[i].tagId);
                if (index !== -1) {
                    // shape.options[i].label = selectItem[index].tagName;
                    // if (shape.options[i].type === 7) {
                    //   shape.options[i].strokeStyle = selectItem[index].color;
                    //   shape.options[i].fillStyle = selectItem[index].color;
                    // } else {
                    shape.options[i].strokeStyle = hexToRgba(selectItem[index].color ?? '', 0.4);
                    shape.options[i].fillStyle = hexToRgba(selectItem[index].color ?? '', 0.4);
                    // }
                    // shape.options[i].textFillStyle = selectItem[index].color;
                } else {
                    // 说明该标签已被删除，置空，在handlesave时除掉
                    shape.options[i].label = '';
                    shape.options[i].strokeStyle = '';
                    shape.options[i].fillStyle = '';
                    // shape.options[i].textFillStyle = '';
                }
                // 对刷子和橡皮檫轨迹进行解码和反压缩
                if ((shape.options[i].type === 9 || shape.options[i].type === 7 || shape.options[i].type === 4) && 'encodedData' in shape.options[i].coor) {
                    shape.options[i].coor = decodeAndDecompressPoints(shape.options[i].coor.encodedData, shape.options[i].coor.startX, shape.options[i].coor.startY);
                    if (shape.options[i].type === 9) { shape.options[i].coor.push([-1, -1]); }

                }
            }
        }
        smallinstance.setData(shape?.options);
    } else {
        smallinstance.setData([]);
    }
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

const showTagName = (image: TagInfo) => {
    return selectItem.find((item: Tag) => item.tagId == String(image.tagId))?.tagName;
}
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
    document.querySelectorAll(".el-checkbox-group .el-checkbox").forEach((node, index) => {
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

// #region *****************************快捷键事件监听********************************
// 键盘监听相关逻辑
const controlKeyDown = ref(false);
const shiftKeyDown = ref(false);
// 右键弹框显示和位置信息
const menuVisible = ref(false);  // 控制菜单是否显示
const menuUuid = ref('');  // 记录哪个uuid的图形弹出菜单
const menuPosition = ref({ x: 0, y: 0 });  // 菜单位置
// 记录当前是否在进行输入操作,有为true,避免输入数字时触发快捷键
const inputVisible = ref(false);

const shortcutData = ref<Record<string, string>>({
    "删除标注": "Delete",
    "保存标注": "Ctrl + S",
    "适配大小": "Ctrl + R",
    "切换单多图": "Ctrl + F",
    "上一张": "A",
    "下一张": "D",
    "撤销": "Ctrl + Z",
    "重做": "Ctrl + X",
    // "直线": "Shift + *",
    "多边形框": "Shift + #",
    // "圆框": "Shift + @",
    "钢笔": "Shift + $",
    "刷子": "Shift + %",
    // "分割一切": "Shift + ^",
    "修订模式": "Shift + ~"
});
const getShortcutList = async (tasktype: string) => {
    if (shortCutKeyRef.value) {
        const res = await shortCutKeyRef.value.getShortcutList(tasktype);
        if (res.data) {
            shortcutData.value = res.data;
        } else {
            shortCutKeyRef.value?.saveToLocalStorage();
        }
        if (route.query.subLabelType === '0') {
            if (shortcutData.value["钢笔"] && shortcutData.value["刷子"]) {
                delete shortcutData.value["钢笔"];
                delete shortcutData.value["刷子"];
            }
        } else if (route.query.subLabelType === '1') {
            if (shortcutData.value["多边形框"] && shortcutData.value["刷子"]) {
                delete shortcutData.value["多边形框"];
                delete shortcutData.value["刷子"];
            }
        } else if (route.query.subLabelType === '2') {
            if (shortcutData.value["多边形框"] && shortcutData.value["钢笔"]) {
                delete shortcutData.value["多边形框"];
                delete shortcutData.value["钢笔"];
            }
        } else {
            return;
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
        if (route.query.subLabelType === '0') {
            if (shortcutData.value["钢笔"] && shortcutData.value["刷子"]) {
                delete shortcutData.value["钢笔"];
                delete shortcutData.value["刷子"];
            }
        } else if (route.query.subLabelType === '1') {
            if (shortcutData.value["多边形框"] && shortcutData.value["刷子"]) {
                delete shortcutData.value["多边形框"];
                delete shortcutData.value["刷子"];
            }
        } else if (route.query.subLabelType === '2') {
            if (shortcutData.value["多边形框"] && shortcutData.value["钢笔"]) {
                delete shortcutData.value["多边形框"];
                delete shortcutData.value["钢笔"];
            }
        } else {
            return;
        }
    } else {
        console.error("shortCutKeyRef is not available yet");
    }
};
const getShortcutKey = (name: string): string => {
    return Object.entries(shortcutData.value).find(([key]) => key === name)?.[1] || "未设置";
};
// 存储鼠标位置
const mousePosition = ref({ x: 0, y: 0 });
// 鼠标移动事件监听器，绘制鼠标坐标轴
const handleMouseMove = (event: MouseEvent) => {
    if (positionList && !countMode.value && event) {
        positionList.end_x = event.clientX;
        positionList.end_y = event.clientY;
    }
    if (event) {
        mousePosition.value.x = event.clientX;
        mousePosition.value.y = event.clientY;
    }
    if (!countMode.value) return;
    if (mode.value === 1 && (toolType.value === 7 || toolType.value === 10) && segcanvasRef.value) {
        // 画笔模式，光标变成圆圈
        const rect = segcanvasRef.value.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 更新自定义光标位置
        customCursorRef.value!.style.left = `${x}px`;
        customCursorRef.value!.style.top = `${y}px`;
        segcanvasRef.value.style.cursor = 'none'; // 隐藏系统光标
        return;
    }
    if (segcanvasRef.value) {
        // 绘制、修订和专注模式
        if (mode.value === 1 || mode.value === 2 || mode.value === 3) {
            const [hitShapeIndex, hitShape] = instance.hitOnShape(instance.mouse);
            if (instance.hitOnShapeVertex()) {
                segcanvasRef.value.style.cursor = instance.hitOnShapeVertex();
            } else if (hitShapeIndex > -1 && mode.value === 2) {
                if (hitShape.type === 3 && ('color' in hitShape) && hitShape.color !== '') {
                    segcanvasRef.value.style.cursor = 'default'; // 设置为默认光标
                } else if (hitShape.type === 7) {
                    if ("iseraser" in hitShape && !hitShape.iseraser) {
                        segcanvasRef.value.style.cursor = 'pointer'; // 设置为默认光标
                    } else {
                        segcanvasRef.value.style.cursor = 'default'; // 设置为默认光标
                    }
                } else if (hitShape.type === 8) {
                    segcanvasRef.value.style.cursor = 'pointer'; // 设置为默认光标
                    instance.highlightMask(hitShapeIndex);
                } else if (hitShape.type === 9) {
                    segcanvasRef.value.style.cursor = 'pointer'; // 设置为默认光标
                } else {
                    segcanvasRef.value.style.cursor = 'move'; // 设置为移动光标
                }
            } else {
                if (mode.value === 1) {
                    segcanvasRef.value.style.cursor = 'crosshair'; // 设置为十字轴
                } else {
                    segcanvasRef.value.style.cursor = 'default'; // 设置为默认光标
                }
            }
        } else {
            segcanvasRef.value.style.cursor = 'default'; // 设置为默认光标
        }
    }

};
const handleMouseDown = (event: MouseEvent) => {
    // mousedown = true;
    if (!positionList || countMode.value) return;
    positionList.is_show_mask = true;
    positionList.start_x = event.clientX;
    positionList.start_y = event.clientY;
    positionList.end_x = event.clientX;
    positionList.end_y = event.clientY;
    document.body.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseup", handleMouseUp);
};
const handleMouseUp = (event: MouseEvent) => {
    event.preventDefault();  // 阻止默认右键菜单
    // mousedown = false;
    if (!positionList || countMode.value) return;
    document.body.removeEventListener("mousemove", handleMouseMove);
    document.body.removeEventListener("mouseup", handleMouseUp);
    positionList.is_show_mask = false;
    handleDomSelect();
    resSetXY();
};
const handleMouseWheel = () => {
    setCursorRadius(instance.brushlineWidth);
};
// 处理右键点击事件
const handleRightClick = (event: MouseEvent) => {
    event.preventDefault();  // 阻止默认右键菜单
    const [hitShapeIndex, hitShape] = instance.hitOnShape(instance.mouse);
    if (hitShapeIndex === -1) {
        return;
    }
    if (hitShape.type === 7 && ('color' in hitShape) && hitShape.color !== '') {
        return; // 智能标注的点不可操作
    }
    if (hitShapeIndex > -1) {
        for (let i = 0; i < instance.dataset.length; i++) {
            if (instance.dataset[i].index === instance.hitOnShape(instance.mouse)[0]) {
                instance.dataset[i].active = true;
                let currItem = selectItem.find(item => item.tagId === instance.dataset[i].tagId);
                instance.activeFillStyle = hexToRgba(currItem?.color ?? '', 0.4) ?? 'transparent';
                instance.activeStrokeStyle = hexToRgba(currItem?.color ?? '', 0.4) ?? 'transparent';
                // instance.textFillStyle = currItem?.color ?? '#F93238';
            } else {
                instance.dataset[i].active = false;
            }
        }
        instance.update();
        // 获取鼠标点击的位置
        const x = event.clientX - 250;
        const y = event.clientY - 160;
        // 更新菜单的位置并显示菜单
        menuPosition.value = { x, y };
        menuVisible.value = true;
        menuUuid.value = instance.activeShape.uuid;
        const itemMsg = resultMessage.value.find(item => item.uuid === menuUuid.value);
        pathTagName.value = itemMsg?.label ?? '';
        pathTagColor.value = rgbaToHex(itemMsg?.strokeStyle ?? '#000000');
        pathRemark.value = itemMsg?.remark ?? '';
        showPathMesg.value = true;
    } else {
        menuVisible.value = false;
        menuUuid.value = '';
    }
};
// 关闭菜单
const handleClickOutside = (event: MouseEvent) => {
    // 确保点击的是菜单或者菜单中的输入框时不关闭菜单
    const contextMenu = document.querySelector('.context-menu');
    const inputField = document.querySelector('.search-input');
    const addTagButton = document.querySelector('.blue-text');

    if (contextMenu && !contextMenu.contains(event.target as Node) &&
        !inputField?.contains(event.target as Node) &&
        !addTagButton?.contains(event.target as Node) && menuUuid.value && menuUuid.value !== instance.activeShape.uuid) {
        menuVisible.value = false;
        menuUuid.value = '';
        searchTerm.value = '';
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
        if (inputVisible.value || filterVisible.value || updateVisible.value || handelLoading.value) { return; }// 后边考虑换成focusedElement全局判断

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
            shortCutKeyRef.value.openDialog(2);
            return; // 直接返回，不执行后续节流的逻辑
        }

        if (event.key === 'Shift') {
            shiftKeyDown.value = true;
        } else if ((event.key === 'Control' && isWin) || (event.key === 'Meta' && isMac)) {
            controlKeyDown.value = true;
        }

        const indexes = Object.entries(shortcutData.value).reduce<number[]>(
            (acc, [_, key], idx) => {
                if (key.toLowerCase() === combinkeys.toLowerCase()) {
                    acc.push(idx);
                    menuVisible.value = false;
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
                // if (!inputVisible.value && !filterVisible.value && !updateVisible.value) {
                let index = parseInt(event.key) - 1;
                if (index < selectItem.length) {
                    selection.value = selectItem[index].tagId;
                    changeCheck(index, "");
                    menuVisible.value = false;
                } else {
                    useMessage().wraning("请选择 1-" + selectItem.length + " 号标签项！！！");
                }
                // }
            }
            return;
        }

        const index = indexes[0];
        const name = Object.keys(shortcutData.value)[index];

        if (name === '切换单多图') {
            countSwitch();
            return;
        } else if (name === '保存标注') {
            handleSave();  // 执行保存操作
            return; // 直接返回，不执行后续节流的逻辑
        } else if (name === '适配大小') {
            instance.fitZoom();
            return; // 直接返回，不执行后续节流的逻辑
        } else if (name === '删除标注') {
            handleDelete();
            return;
        } else if (name === '撤销') {
            undoOperation();
            return;
        } else if (name === '重做') {
            redoOperation();
            return;
        } else if (name === '多边形框') {
            drawShapes(2)
            return;
        } else if (name === '直线') {
            drawShapes(4)
            return;
        } else if (name === '圆框') {
            drawShapes(5)
            return;
        } else if (name === '钢笔') {
            drawShapes(9)
            return;
        } else if (name === '刷子') {
            drawShapes(7)
            return;
        } else if (name === '分割一切') {
            getAllMask()
            return;
        } else if (name === '修订模式') {
            changeMode(2)
            return;
        }

        // 其他键位受节流控制
        if (isThrottled) return;
        isThrottled = true;

        if (name === '上一张') {
            if (!inputVisible.value && !filterVisible.value && !updateVisible.value && !handelLoading.value) {
                event.preventDefault();  // 防止浏览器执行默认的保存操作
                if (countMode.value) {
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
            }
        } else if (name === '下一张') {
            if (!inputVisible.value && !filterVisible.value && !updateVisible.value && !handelLoading.value) {
                event.preventDefault();  // 防止浏览器执行默认的保存操作
                if (countMode.value) {
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
// #endregion

// #region ********************************标签栏************************************
// 定义 Tag 对象的类型
interface Tag {
    tagId: string;
    tagName: string;
    color: string;
}

const selection = ref('0');
const selectItem = reactive<Tag[]>([]);
const referSelectItem = reactive<Tag[]>([]);
const indexToColorMap = new Map<string, number>();
const addValue = ref('');
const addVisible = ref(false);
const filterVisible = ref(false);
const updateVisible = ref(false);
const FilenameRef = ref<InstanceType<typeof ElInput>>()

const searchTerm = ref('');  // 搜索框的内容

const addType = ref(0);

// 过滤后的菜单项
const filteredItems = () => {
    return selectItem.filter(item => item.tagName.toLowerCase().includes(searchTerm.value.toLowerCase()));
};

function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// 新增标签事件
const handleInputConfirm = (label: string) => {
    if (label) {
        const newItem: Tag = {
            tagId: generateRandomString(10),
            tagName: label,
            color: hexToRgba('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), 1)
        };
        selectItem.push(newItem);
    } else if (addValue.value) {
        const newItem: Tag = {
            tagId: generateRandomString(10),
            tagName: label,
            color: hexToRgba('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), 1)
        };
        selectItem.push(newItem);
        addVisible.value = false;
        addValue.value = '';
    } else {
        return;
    }
}

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
        useMessage().success("修改标签成功");
    } catch (err: any) {
        useMessage().error(err.msg);
    }
}

const refreshCanvas = () => {
    // 修改和删除标签时，goto不用保存
    havenSaved.value = true;
    // 当涉及到刷新canvas图片时，gotoImage多传一个reset=true
    gotoImage(imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId, selectedIndex.value, true);
}

const deleteItem = async (value: string) => {
    // 弹窗确认
    await useMessageBox().confirm("确认删除该标签，所有已标注的图片都会被修改");
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
                datasetId: taskForm.datasetId ?? '',
                baseDatasetId: taskForm.baseDatasetId,
                labelType: taskForm.labelType,
                tagIds: JSON.stringify(tagIdsJson),
                groupId: taskForm.groupId,
                groupName: taskForm.groupName,
            }
            // 同步更新labeltask的tagIds
            await updateTagIds(newtaskForm);
            taskForm.tagIds = JSON.stringify(tagIdsJson);
            // 更新selectItem
            index = selectItem.findIndex((item: Tag) => item.tagId === value);
            if (index > -1) {
                selectItem.splice(index, 1);
            }
            selection.value = '0';
            // 更新resultList
            getDataList();
            refreshCanvas();
        } else {
            useMessage().wraning("未找到该标签！！！");
        }
    } catch {
        useMessage().error("删除失败！！！");
    } finally {
        loading.value = true;
        handelLoading.value = true;
    }
};

// alpha在css中最大值为1，在Uint8ClampedArray中最大值为255，所以需要转换
function hexToRgba(color: string, alpha: number = 1): string {
    if (!color) return '';

    // 直接处理 RGBA 格式
    if (color.startsWith('rgba(')) {
        return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, `rgba($1, $2, $3, ${alpha})`);
    }

    // 处理十六进制格式
    let hex = color.replace(/^#/, '');

    // 处理 #RGB 简写格式
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // 确保是正确的 6 位十六进制颜色代码
    if (hex.length !== 6) {
        console.error('Invalid hex color:', hex);
        return '';
    }

    // 解析 RGB 值
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function rgbaToHex(rgba: string, ignoreAlpha: boolean = true): string {
    // 如果已经是 hex 格式，直接返回
    if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(rgba.trim())) {
        return rgba.trim();
    }

    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)?\)/);
    if (!match) {
        console.error("Invalid RGBA format:", rgba);
        return '';
    }

    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');

    let hex = `#${r}${g}${b}`;

    if (!ignoreAlpha && match[4] !== undefined && match[4] !== '') {
        const alpha = Math.round(parseFloat(match[4]) * 255)
            .toString(16)
            .padStart(2, '0');
        hex += alpha;
    }

    return hex;
}



// 选中标签触发事件（点击或快捷键选中）
const changeCheck = (index: number, value: string, operation: string = '') => {
    nextTick(() => {
        // 确保 DOM 和子组件加载完成后访问
        if (tabBarAreaRef.value) {
            // 不选中任一标签项
            if (index === -1 && value === '') {
                selection.value = '0';
                return;
            } else if (index !== -1 && value === '') {
                if (tabBarAreaRef.value.editedItem !== '' && tabBarAreaRef.value.editedItem === value) {
                    return;
                } else if (tabBarAreaRef.value.lockedItem !== '' && tabBarAreaRef.value.lockedItem !== value) {
                    useMessage().wraning("已锁定其他选项！！！");
                    let selectedType = selectItem.find(item => item.tagId === tabBarAreaRef.value.lockedItem);
                    instance.activeStrokeStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
                    instance.activeFillStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
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
                    let selectedType = selectItem.find(item => item.tagId === tabBarAreaRef.value.lockedItem);
                    instance.activeStrokeStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
                    instance.activeFillStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
                    return;
                }
                selection.value = value;
            }
            if (selectedList.value.length !== 0 && selection.value !== '0') {
                let selectedType = selectItem.find(item => item.tagId === selection.value);
                // instance.textFillStyle = selectedType?.color ?? '#F93238';
                // instance.labelFontSize = 15;
                // instance.labelFontFamily = 'sans-serif';

                if ([9, 8, 7, 5, 2].includes(instance.activeShape.type) || [9, 8, 7, 5, 2].includes(instance.createType) || tabBarAreaRef.value.lockedIte !== '') {
                    pathTagName.value = selectedType?.tagName ?? '';
                    pathTagColor.value = rgbaToHex(selectedType?.color ?? '#000000');
                    brushColor.value = rgbaToHex(selectedType?.color ?? '#000000');
                    instance.activeStrokeStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
                    instance.activeFillStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
                }

                if (instance.activeShape.uuid && mode.value !== 0 && operation != 'undore') {
                    // if (instance.activeShape.iseraser === true) {
                    //   // 橡皮檫轨迹不需要标注
                    //   return;
                    // }
                    if (route.query.subLabelType === '2') {
                        const clickedItem = objectBarAreaRef.value.clickedItem;
                        clickedItem.forEach((uuid: string) => {
                            updateResultMessage_object(uuid, 'updateTag', selectedType ?? { tagId: '', tagName: '', color: '' });
                        });
                        instance.activeStrokeStyle = hexToRgba(selectedType?.color ?? '', 1) ?? 'transparent';
                        instance.updateLabelByIndex([...Array(instance.dataset.length).keys()], selectedType?.tagId ?? '', selectedType?.tagName ?? '', hexToRgba(selectedType?.color ?? '', 1) ?? '', ['label', 'tagId', 'strokeStyle', 'fillStyle']);
                    } else {
                        instance.updateLabelByIndex([], selectedType?.tagId ?? '', selectedType?.tagName ?? '', hexToRgba(selectedType?.color ?? '', 0.4) ?? '', ['label', 'tagId', 'strokeStyle', 'fillStyle']);
                    }
                    instance.activeFillStyle = hexToRgba(selectedType?.color ?? '', 0.8) ?? 'transparent';
                    // let index = resultMessage.value.findIndex(item => item.uuid === instance.activeShape.uuid);
                    // resultMessage.value[index].tagId = selection.value;
                }
            }
        }
    });
}

const menuChangeLabel = (tagId: string) => {
    menuVisible.value = false;
    const shape = instance.dataset.find(item => item.uuid === menuUuid.value);
    if (shape?.tagId !== tagId) changeCheck(-1, tagId);
    menuUuid.value = '';
}
// #endregion

// #region *********************************对象栏*************************************

const currentOptions = ref<Option[]>([]);
const currentbucketName = ref('');
const currentfileName = ref('');
type ShapeEventType = "over" | "leave" | "click"; // 定义字符串字面量类型
const handleShapeMouse = (itemMsg: Option, type: ShapeEventType) => {
    console.log("item", itemMsg);
    // 切换到编辑模式
    changeMode(2);
    const shape = resultMessage_object.value.find(item => item.uuid === itemMsg.uuid);
    const clickedItem = objectBarAreaRef.value.clickedItem;
    if (type === "over") {
        // 如果是刷子工具，则先将选中的对象绘制在instance上，再进行修改操作
        if (route.query.subLabelType === '2' && shape) {
            if (clickedItem.includes(itemMsg.uuid)) return;
            if (instance.dataset.find(item => item.uuid === itemMsg.uuid)) return;
            shape.fillStyle = hexToRgba(shape.fillStyle ?? 'transparent', 1);
            instance.dataset.push(shape);
            instance.update();
        } else {
            instance.dataset.forEach(
                (item) => (item.active = item.uuid === itemMsg.uuid)
            );
            instance.activeStrokeStyle = itemMsg.strokeStyle ?? "#000000";
            instance.update();
            if (itemMsg && itemMsg.label) {
                let currItem = selectItem.find(item => item.tagId === itemMsg.tagId);
                instance.activeStrokeStyle = currItem?.color ?? 'transparent';
                instance.activeFillStyle = hexToRgba(currItem?.color ?? 'transparent', 0.8);
                // instance.textFillStyle = currItem?.color ?? '#F93238';
                // props.instance.labelFont = "10px sans-serif";
                // instance.labelFontSize = 15;
                // instance.labelFontFamily = 'sans-serif';
                pathTagName.value = itemMsg.label ?? '';
                pathTagColor.value = rgbaToHex(currItem?.color ?? '#000000');
                pathRemark.value = itemMsg.remark ?? '';
            } else {
                // pathTagName.value = '';
                // pathTagColor.value = '#000000';
                if (itemMsg && tabBarAreaRef.value.lockedItem !== '') {
                    changeCheck(-1, tabBarAreaRef.value.lockedItem)
                }
            }
        }
    } else if (type === "leave") {
        if (route.query.subLabelType === '2') {
            if (clickedItem.includes(itemMsg.uuid)) return;
            instance.dataset.splice(instance.dataset.findIndex(item => item.uuid === itemMsg.uuid), 1);
            instance.update();
        } else {
            instance.dataset.forEach(
                (item) => (item.active = false)
            );
            instance.update();
        }
    } else if (type === "click") {
        if (route.query.subLabelType === '2') {
            instance.dataset = [];
            clickedItem.forEach((uuid: string) => {
                const shape = deepClone(resultMessage_object.value.find(item => item.uuid === uuid));
                if (shape) {
                    // 将选中的图形绘制到instance上
                    shape.fillStyle = hexToRgba(shape.fillStyle ?? 'transparent', 1);
                    shape.active = true;
                    shape.hiddening = false;
                    instance.dataset.push(shape);
                    // 隐藏instance_bgimg上的对应图形
                    const index = instance_bgimg.dataset.findIndex(item => item.uuid === uuid);
                    instance_bgimg.dataset[index].active = true;
                    instance_bgimg.dataset[index].hiddening = true;
                }
                console.log("shape:", shape);
                console.log("resultMessage_object.value:", resultMessage_object.value);
            })
            instance.update();
            instance_bgimg.update();
            // const shape_bgimg: Option[] = [];
            // resultMessage_bgimg.value.forEach(item => {
            //     if (item.uuid === itemMsg.uuid) {
            //         shape_bgimg.push(item);
            //     }
            //     // if (item.uuid === itemMsg.uuid) {
            //     //     item.hiddening = true;
            //     // }
            //     // shape_bgimg.push(item);
            // })
            // instance_bgimg.setData(shape_bgimg);
        } else {
            instance.dataset.forEach(
                (item) => (item.active = item.uuid === itemMsg.uuid)
            );
            instance.activeStrokeStyle = itemMsg.strokeStyle ?? "#000000";
            instance.activeFillStyle = hexToRgba(itemMsg?.fillStyle ?? 'transparent', 0.8);
            instance.update();
            // 显示标注框信息
            showPathMesg.value = true;
            if (itemMsg && itemMsg.label) {
                let currItem = selectItem.find(item => item.tagId === itemMsg.tagId);
                instance.activeStrokeStyle = currItem?.color ?? 'transparent';
                instance.activeFillStyle = hexToRgba(currItem?.color ?? 'transparent', 0.8);
                // instance.textFillStyle = currItem?.color ?? '#F93238';
                // props.instance.labelFont = "10px sans-serif";
                // instance.labelFontSize = 15;
                // instance.labelFontFamily = 'sans-serif';
                pathTagName.value = itemMsg.label ?? '';
                pathTagColor.value = rgbaToHex(currItem?.color ?? '#000000');
                pathRemark.value = itemMsg.remark ?? '';
            } else {
                pathTagName.value = '';
                pathTagColor.value = '#000000';
                if (itemMsg && tabBarAreaRef.value.lockedItem !== '') {
                    changeCheck(-1, tabBarAreaRef.value.lockedItem)
                }
            }
        }
    }
};
let needSaveBrush = false;
const updateResultMessage_object = (uuid: string, opteration: string, tag?: Tag) => {
    const index = resultMessage_object.value.findIndex(item => item.uuid === uuid);
    // 修改标签
    if (opteration === 'updateTag' && tag) {
        resultMessage_object.value[index].label = tag.tagName;
        resultMessage_object.value[index].tagId = tag.tagId;
        resultMessage_object.value[index].fillStyle = modifyRgbaAlpha(tag.color, 1);
        resultMessage_object.value[index].strokeStyle = modifyRgbaAlpha(tag.color, 1);
        instance_bgimg.dataset.forEach(
            (item) => {
                if (item.uuid === uuid) {
                    item.label = tag.tagName;
                    item.tagId = tag.tagId;
                    item.fillStyle = modifyRgbaAlpha(tag.color, 0.4);
                    item.strokeStyle = modifyRgbaAlpha(tag.color, 0.4);
                }
            }
        )
    } else if (opteration === 'hide') {
        // 隐藏图形 
        if (uuid) {
            instance_bgimg.dataset.forEach(
                (item) => {
                    if (item.uuid === uuid) {
                        item.hiddening = true;
                    }
                }
            )
        } else {
            instance_bgimg.dataset.forEach(
                (item) => {
                    item.hiddening = true;
                }
            )
        }
    } else if (opteration === 'unhide') {
        // 隐藏图形 
        if (uuid) {
            instance_bgimg.dataset.forEach(
                (item) => {
                    if (item.uuid === uuid) {
                        item.hiddening = false;
                    }
                }
            )
        } else {
            instance_bgimg.dataset.forEach(
                (item) => {
                    item.hiddening = false;
                }
            )
        }
    }
    else if (opteration === 'delete') {
        // 删除 
        instance_bgimg.dataset.splice(instance_bgimg.dataset.findIndex(item => item.uuid === uuid), 1);
        resultMessage_object.value.splice(resultMessage_object.value.findIndex(item => item.uuid === uuid), 1);
    }
    instance_bgimg.update();
    needSaveBrush = true;
}
// #endregion

// #region *********************************筛选*************************************
const activeName = ref('first');  // 设置默认选中的tab为第一个（name="first"）
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
const inputFilename = ref('');
const selectLabel = ref('');

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
    inputVisible.value = true
    nextTick(() => {
        FilenameRef.value!.input!.focus()
    })
};
// 名称检索事件
const handleSelectConfirm = () => {
    if (inputFilename.value) {
        // 执行按名称检索
        state.queryForm.fileName = inputFilename.value;
        // selectLabel.value = '';
        nextTick(() => {
            FilenameRef.value!.input!.blur()
        })
    } else {
        if (state.queryForm.fileName === '') return;
        state.queryForm.fileName = ''
        // return;
    }
    loading.value = true;
    page.pageNum = 2;
    selectedList.value.length = 0;
    imageList.value.length = 0;
    getDataList();
    inputVisible.value = false;
}

const isSaved = (val: string) => {
    return resultList.some(item => item.fileId === val);
};

// #endregion

// #region ********************************工具栏************************************
interface EncodedMsg {
    encodedData: string;
    startX: number;
    startY: number;
}
interface Option {
    uuid?: string;
    index?: number;
    label?: string;
    tagId: string;
    labelFillStyle?: string;
    strokeStyle?: string;
    textFillStyle?: string;
    fillStyle?: string;
    coor?: [number, number][] | [number, number] | EncodedMsg | EncodedMsg[];
    encodePixelData?: number[];
    startPoint?: [number, number];
    width?: number;
    height?: number;
    boundingRect?: [number, number, number, number];
    lineWidth?: number | number[];
    brushWidth?: number;
    iseraser?: boolean;
    type: number;
    labelType?: number;
    radius?: number;
    active?: boolean;
    creating?: boolean;
    dragging?: boolean;
    hiddening?: boolean;
    locking?: boolean;
    remark?: string;
}
interface OutputOption {
    tagId: string;
    type: number;
    fillStyle?: string;
    strokeStyle?: string;
    coor?: [number, number][] | [number, number] | EncodedMsg;
    encodePixelData?: number[];
    startPoint?: [number, number];
    width?: number;
    height?: number;
    boundingRect?: [number, number, number, number];
    radius?: number;
    lineWidth?: number;
    brushWidth?: number;
    iseraser?: boolean;
}
interface ResultShape {
    labelId: string;
    fileId: string;
    // type: string;
    options: Option[];
}
const toolList = [
    { label: "多边形框", type: 2, icon: Crop, subLabelType: "0" },
    { label: "钢笔", type: 9, icon: EditPen, subLabelType: "1" },
    { label: "刷子", type: 7, icon: Brush, subLabelType: "2" },
    { label: "刷子Mask", type: 10, icon: Brush, subLabelType: "3" },
];
// 记录当前canvas上的图形
const needUpdate = ref(true);
const resultMessage = ref<Option[]>([]);
const resultMessage_bgimg = ref<Option[]>([]);
const resultMessage_object = ref<Option[]>([]);
const outputMessage = ref<OutputOption[]>([]);
// 记录已保存的图形列表
const resultList = reactive<ResultShape[]>([]);

/**
 * 将坐标数组进行差分编码、压缩和 Base64 编码
 * @param points 坐标数组
 * @returns 编码后的字符串
 */
function compressAndEncodePoints(points: [number, number][]): { encodedData: string, startX: number, startY: number } {
    const [startX, startY] = points[0]; // 保存初始点
    // 1. 差分编码
    const differentialPoints: [number, number][] = points.slice(1).map(([x, y], index) => {
        const [prevX, prevY] = points[index];
        return [x - prevX, y - prevY]; // 计算差分
    });

    // console.log('Differential Points:', differentialPoints);  // 打印差分编码的结果

    // 2. 转换为二进制数据
    const binaryData = new Int8Array(differentialPoints.flat());

    // 3. 压缩算法
    const compressedData = pako.gzip(binaryData);

    // 4. Base64 编码
    const base64String = btoa(String.fromCharCode(...compressedData));

    return { encodedData: base64String, startX, startY };
}

/**
 * 将编码后的字符串进行 Base64 解码、解压和差分解码
 * @param encodedData 编码后的字符串
 * @param startX 初始横坐标
 * @param startY 初始纵坐标
 * @returns 解码后的坐标数组
 */
function decodeAndDecompressPoints(encodedData: string, startX: number, startY: number): [number, number][] {
    // Base64 解码
    const base64String = atob(encodedData);
    const compressedData = new Uint8Array(base64String.split('').map(char => char.charCodeAt(0)));

    // 解压算法
    const binaryData = pako.ungzip(compressedData);

    // 3. 差分解码
    const points: [number, number][] = [[startX, startY]];

    for (let i = 0; i < binaryData.length; i += 2) {
        const [prevX, prevY] = points[points.length - 1];
        let dx = binaryData[i];
        let dy = binaryData[i + 1];

        // 修正差分值
        if (dx > 127) dx -= 256;
        if (dy > 127) dy -= 256;

        points.push([Math.round(prevX + dx), Math.round(prevY + dy)]);
    }

    return points;
}

// 记录当前图片是否已保存
const havenSaved = ref(false);

// 保存标签功能
const handleSave = async (gotoNext: boolean = false, nextindex: number = -1) => {
    // 先判断当前图是否有未标注的框（resultMessage记录当前canvas上的图形）
    let allLabeld = true;
    for (let i = 0; i < resultMessage.value.length; i++) {
        if (resultMessage.value[i].iseraser) continue;
        if (resultMessage.value[i].tagId === undefined || resultMessage.value[i].tagId === '') {
            allLabeld = false;
            break;
        }
    }
    if (!allLabeld) {
        useMessage().wraning('请为所有标注设置标签！！！');
        return;
    }
    let brushMask: Option = { tagId: '', type: 0 };
    // 若未保存过
    if (!isSaved(selectedList.value[0])) {
        if (instance.dataset.length === 0) {
            if (gotoNext && nextindex > -1) {
                instance.doneList.length = 0; // 避免goto后再次handleSave，避免重复保存
                gotoImage(imageList.value[nextindex].bucketName, imageList.value[nextindex].fileName, imageList.value[nextindex].fileId, nextindex);
            } else {
                useMessage().wraning('当前图片无标注，无需保存！！！');
            }
            return;
        } else {
            handelLoading.value = true;
            outputMessage.value.length = 0;
            // 刷子
            if (route.query.subLabelType === '2') {
                brushMask = instance.mergeToBrushMask();
                for (let i = 0; i < instance_bgimg.dataset.length; i++) {
                    outputMessage.value.push({
                        tagId: instance_bgimg.dataset[i].tagId,
                        type: instance_bgimg.dataset[i].type,
                        fillStyle: instance_bgimg.dataset[i].fillStyle ?? "",
                        strokeStyle: instance_bgimg.dataset[i].strokeStyle ?? "",
                        encodePixelData: instance_bgimg.dataset[i].encodePixelData,
                        startPoint: instance_bgimg.dataset[i].startPoint,
                        width: instance_bgimg.dataset[i].width,
                        height: instance_bgimg.dataset[i].height,
                    });
                }
                if (brushMask.tagId !== '') {
                    outputMessage.value.push({
                        tagId: brushMask.tagId,
                        type: brushMask.type,
                        fillStyle: modifyRgbaAlpha(brushMask.fillStyle ?? "", 0.4),
                        strokeStyle: brushMask.strokeStyle ?? "",
                        encodePixelData: brushMask.encodePixelData,
                        startPoint: brushMask.startPoint,
                        width: brushMask.width,
                        height: brushMask.height,
                    });
                }
            } else {
                for (let i = 0; i < resultMessage.value.length; i++) {
                    resultMessage.value[i].active = false;
                    resultMessage.value[i].creating = false;
                    resultMessage.value[i].dragging = false;
                    resultMessage.value[i].hiddening = false;
                    resultMessage.value[i].locking = false;
                    // resultMessage.value[i].label = '';
                    // resultMessage.value[i].strokeStyle = '';
                    resultMessage.value[i].textFillStyle = '';
                    outputMessage.value.push({
                        tagId: resultMessage.value[i].tagId,
                        type: resultMessage.value[i].type,
                        fillStyle: resultMessage.value[i].fillStyle ?? "",
                        coor: deepClone(resultMessage.value[i].coor),
                        // ...(resultMessage.value[i].boundingRect ? { boundingRect: resultMessage.value[i].boundingRect } : {}),
                        ...(resultMessage.value[i].strokeStyle ? { strokeStyle: resultMessage.value[i].strokeStyle } : {}),
                        ...(resultMessage.value[i].brushWidth ? { brushWidth: resultMessage.value[i].brushWidth } : {}),
                        ...(resultMessage.value[i].lineWidth ? { lineWidth: resultMessage.value[i].lineWidth } : {}),
                        ...(resultMessage.value[i].iseraser ? { iseraser: resultMessage.value[i].iseraser } : {}),
                        ...(resultMessage.value[i].radius ? { radius: resultMessage.value[i].radius } : {}),
                    });
                    // 对多边形、直线、刷子和橡皮檫轨迹压缩和编码
                    if ((resultMessage.value[i].type === 4 && resultMessage.value[i].coor.length > 3) || resultMessage.value[i].type === 9) {
                        if (resultMessage.value[i].type === 9) {
                            outputMessage.value[outputMessage.value.length - 1].coor.pop();
                        }
                        outputMessage.value[outputMessage.value.length - 1].coor = compressAndEncodePoints(outputMessage.value[outputMessage.value.length - 1].coor);
                    } else if (resultMessage.value[i].type === 8) {
                        outputMessage.value[outputMessage.value.length - 1].pixels = [];
                        outputMessage.value[outputMessage.value.length - 1].canvasData = null;
                        outputMessage.value[outputMessage.value.length - 1].magicPoints = [];
                    }
                }
            }
            // 调接口保存json数据
            await addLabelObj({
                labelId: "",
                labelType: taskForm.labelType,
                subLabelType: route.query.subLabelType,
                fileId: selectedList.value[0],
                labelFileName: "",
                taskId: taskForm.taskId,
                tagId: [...new Set(resultMessage.value.map(item => item.tagId))].join(','),
                tagInfo: JSON.stringify(outputMessage.value),
            }).then((res) => {
                // 更新resultList
                resultList.push({ labelId: res.data, fileId: selectedList.value[0], options: deepClone(outputMessage.value) });
                instance.doneList.length = 0;
                // 更新resultList_object
                // needUpdate.value = true;
                if (brushMask.tagId !== '') {
                    brushMask.fillStyle = modifyRgbaAlpha(brushMask.fillStyle ?? "", 0.4);
                    instance_bgimg.dataset.push(brushMask);
                }
                instance_bgimg.update();
                if (resultList.length > 0) {
                    tagedNumber.value++;
                    useMessage().success('已完成标注数量:' + tagedNumber.value);
                } else {
                    useMessage().wraning('标注异常！！！');
                }
                if ((selectedIndex.value + 1 + page.pageSize * (page.pageNum - 1)) === selectedImageTotal.value) {
                    useMessage().wraning('已是最后一张图片！！！');
                    handelLoading.value = false;
                    return;
                }
                if (selectedIndex.value + 1 >= imageList.value.length) {
                    // useMessage().wraning('已是最后一张图片！！！');
                    havenSaved.value = true;
                    scrollRight();
                    return;
                }
                havenSaved.value = true;
                if (gotoNext) {
                    if (nextindex > -1) {
                        gotoImage(imageList.value[nextindex].bucketName, imageList.value[nextindex].fileName, imageList.value[nextindex].fileId, nextindex);
                    } else {
                        gotoImage(imageList.value[selectedIndex.value + 1].bucketName, imageList.value[selectedIndex.value + 1].fileName, imageList.value[selectedIndex.value + 1].fileId, selectedIndex.value + 1);
                    }
                }
            }).catch((err) => {
                useMessage().error(err.msg);
                handelLoading.value = false;
                return;
            });
            // 保存上传Mask
            await uploadMaskImage(imageList.value[selectedIndex.value].fileId, imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName);
        }
    } else {
        // 如果已经标注过，就先查再修改
        const findindex = resultList.findIndex(item => item.fileId === selectedList.value[0]);
        let labelId = resultList[findindex].labelId;
        if ((route.query.subLabelType !== '2' && instance.doneList.length <= 1 && !havenRemark.value) || (route.query.subLabelType === '2' && !needSaveBrush && instance.dataset.length === 0)) {
            useMessage().wraning('当前图片标注未修改，无需保存！！！');
        } else {
            handelLoading.value = true;
            const clickedItem = objectBarAreaRef.value.clickedItem;
            if (resultMessage.value.length === 0 && route.query.subLabelType !== '2') {
                await delLabelObj([labelId]).then(() => {
                    useMessage().success("修改成功");
                    // 更新resultList
                    resultList.splice(findindex, 1);
                    tagedNumber.value--;
                }).catch((err) => {
                    useMessage().error(err.msg);
                });
            } else if (resultMessage_object.value.length === 0 && route.query.subLabelType === '2') {
                await delLabelObj([labelId]).then(() => {
                    useMessage().success("修改成功");
                    // 更新resultList
                    resultList.splice(findindex, 1);
                    tagedNumber.value--;
                }).catch((err) => {
                    useMessage().error(err.msg);
                });
            } else {
                handelLoading.value = true;
                outputMessage.value.length = 0;
                if (route.query.subLabelType === '2') {
                    brushMask = instance.mergeToBrushMask();
                    // 橡皮擦完全擦除执行删除操作
                    if (brushMask.encodePixelData && brushMask.encodePixelData.length === 1 && clickedItem.length === 1) {
                        // if (clickedItem.length === 0) {
                        //     useMessage().wraning("当前图片标注未修改，无需保存！！！");
                        //     handelLoading.value = false;
                        //     return;
                        // }
                        // instance.dataset.length = 0;
                        // console.log("******clickedItem", clickedItem);
                        updateResultMessage_object(clickedItem[0], 'delete');
                        // clickedItem.length = 0;
                    }
                    clickedItem.forEach((uuid: string) => {
                        const index = instance_bgimg.dataset.findIndex(item => item.uuid === uuid);
                        if (index !== -1) {
                            instance_bgimg.dataset.splice(index, 1);
                        }
                    });
                    objectBarAreaRef.value.clickedItem = [];
                    for (let i = 0; i < instance_bgimg.dataset.length; i++) {
                        outputMessage.value.push({
                            tagId: instance_bgimg.dataset[i].tagId,
                            type: instance_bgimg.dataset[i].type,
                            fillStyle: instance_bgimg.dataset[i].fillStyle ?? "",
                            strokeStyle: instance_bgimg.dataset[i].strokeStyle ?? "",
                            encodePixelData: instance_bgimg.dataset[i].encodePixelData,
                            startPoint: instance_bgimg.dataset[i].startPoint,
                            width: instance_bgimg.dataset[i].width,
                            height: instance_bgimg.dataset[i].height,
                        });
                    }
                    if (brushMask.tagId !== '' && brushMask.encodePixelData && brushMask.encodePixelData.length > 1) {
                        outputMessage.value.push({
                            tagId: brushMask.tagId,
                            type: brushMask.type,
                            fillStyle: modifyRgbaAlpha(brushMask.fillStyle ?? "", 0.4),
                            strokeStyle: brushMask.strokeStyle ?? "",
                            encodePixelData: brushMask.encodePixelData,
                            startPoint: brushMask.startPoint,
                            width: brushMask.width,
                            height: brushMask.height,
                        });
                    }
                } else {
                    for (let i = 0; i < resultMessage.value.length; i++) {
                        resultMessage.value[i].active = false;
                        resultMessage.value[i].creating = false;
                        resultMessage.value[i].dragging = false;
                        resultMessage.value[i].hiddening = false;
                        resultMessage.value[i].locking = false;
                        // resultMessage.value[i].label = '';
                        // resultMessage.value[i].strokeStyle = '';
                        resultMessage.value[i].textFillStyle = '';

                        outputMessage.value.push({
                            tagId: resultMessage.value[i].tagId,
                            type: resultMessage.value[i].type,
                            fillStyle: resultMessage.value[i].fillStyle ?? "",
                            coor: deepClone(resultMessage.value[i].coor),
                            // ...(resultMessage.value[i].boundingRect ? { boundingRect: resultMessage.value[i].boundingRect } : {}),
                            ...(resultMessage.value[i].strokeStyle ? { strokeStyle: resultMessage.value[i].strokeStyle } : {}),
                            ...(resultMessage.value[i].brushWidth ? { brushWidth: resultMessage.value[i].brushWidth } : {}),
                            ...(resultMessage.value[i].lineWidth ? { lineWidth: resultMessage.value[i].lineWidth } : {}),
                            ...(resultMessage.value[i].iseraser ? { iseraser: resultMessage.value[i].iseraser } : {}),
                            ...(resultMessage.value[i].radius ? { radius: resultMessage.value[i].radius } : {}),
                        });
                        // 对刷子和橡皮檫轨迹压缩和编码
                        if (resultMessage.value[i].type === 7 || (resultMessage.value[i].type === 4 && resultMessage.value[i].coor.length > 3) || resultMessage.value[i].type === 9) {
                            if (resultMessage.value[i].type === 9) {
                                outputMessage.value[outputMessage.value.length - 1].coor.pop();
                            }
                            outputMessage.value[outputMessage.value.length - 1].coor = compressAndEncodePoints(outputMessage.value[outputMessage.value.length - 1].coor);
                        } else if (resultMessage.value[i].type === 8) {
                            outputMessage.value[outputMessage.value.length - 1].pixels = [];
                            outputMessage.value[outputMessage.value.length - 1].canvasData = null;
                            outputMessage.value[outputMessage.value.length - 1].magicPoints = [];
                        }
                    }
                }
                await putLabelObj({
                    labelId: labelId,
                    labelType: taskForm.labelType,
                    fileId: selectedList.value[0],
                    labelFileName: "",
                    taskId: taskForm.taskId,
                    tagId: [...new Set(resultMessage.value.map(item => item.tagId))].join(','),
                    tagInfo: JSON.stringify(outputMessage.value),
                }).then(() => {
                    useMessage().success("修改成功");
                    // 更新resultList
                    resultList[findindex].options = deepClone(outputMessage.value);
                    // 更新resultList_object
                    // needUpdate.value = true;
                    if (brushMask.tagId !== '' && brushMask.encodePixelData && brushMask.encodePixelData.length > 1) {
                        brushMask.fillStyle = modifyRgbaAlpha(brushMask.fillStyle ?? "", 0.4);
                        instance_bgimg.dataset.push(brushMask);
                    }
                    instance.doneList.length = 0;
                    instance_bgimg.update();
                }).catch((err) => {
                    useMessage().error(err.msg);
                    handelLoading.value = false;
                    return;
                });
                // 保存上传Mask
                await uploadMaskImage(imageList.value[selectedIndex.value].fileId, imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName);
            }
            if ((selectedIndex.value + 1 + page.pageSize * (page.pageNum - 1)) === selectedImageTotal.value) {
                useMessage().wraning('已是最后一张图片！！！');
                instance.doneList.length = 0;
                handelLoading.value = false;
                return;
            }
            if (selectedIndex.value + 1 >= imageList.value.length) {
                // useMessage().wraning('已是最后一张图片！！！');
                havenSaved.value = true;
                scrollRight();
                return;
            }
            havenSaved.value = true;
            if (gotoNext) {
                if (nextindex > -1) {
                    gotoImage(imageList.value[nextindex].bucketName, imageList.value[nextindex].fileName, imageList.value[nextindex].fileId, nextindex);
                } else {
                    gotoImage(imageList.value[selectedIndex.value + 1].bucketName, imageList.value[selectedIndex.value + 1].fileName, imageList.value[selectedIndex.value + 1].fileId, selectedIndex.value + 1);
                }
            }
        }
    }
    handelLoading.value = false;
};
//清空选中项
const clearSelectedList = () => {
    if (countMode.value) {
        useMessage().wraning("仅在多图模式下支持！！！");
    } else {
        selectedList.value = [];
    }
}
// 删除标签功能
const handleDelete = async () => {
    if (!isSaved(selectedList.value[0]) && resultMessage.value.length === 0) {
        useMessage().wraning('当前图片未被标注，无需清除！！！');
        return;
    }
    if (instance.activeShape.index) {
        instance.deleteByIndex(instance.activeShape.index);
    } else {
        try {
            await useMessageBox().confirm('确认删除当前图片的所有标注框');
            instance.deleteAllShape();
            instance_bgimg.deleteAllShape();
            needSaveBrush = true;
            // resultMessage_object.value.length = 0;
            // handleSave(false);
        } catch {
            return; // 取消删除则直接跳过此方法
        }
    }
};

// 提交表单数据
interface Task {
    taskId: string;
    taskName: string;
    datasetId: string;
    baseDatasetId: string;
    labelType: string;
    subLabelType?: string;
    tagIds: string;
    groupId: string;
    groupName: string;
}
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

// canvas事件*********************************************
const segcanvasRef = ref<HTMLCanvasElement | null>(null);
const imageCanvasRef = ref<HTMLCanvasElement | null>(null);
const segtempCanvasRef = ref<HTMLCanvasElement | null>(null);
const mode = ref(0);
const selectedIndex = ref(-1); //记录单图下，选中图片的index
const hideNum = ref(0);
const customCursorRef = ref<HTMLElement | null>(null);
const toolType = ref(0);
const brushColor = ref("#000000");
const brushLineWidth = ref(1);

// 画不同图形
const drawShapes = (num: number): void => {
    if (selectItem.length === 0) {
        useMessage().wraning('暂无标签，请先添加标签或标签组！！！');
        return;
    }
    instance.isEraser = false;
    iserase.value = false;
    instance.createType = num;
    toolType.value = num;
    if (num === 7 && brushLineWidth.value < 5) {
        console.log("instance.brushlineWidth", instance.brushlineWidth);
        brushLineWidth.value = 10;
        instance.brushlineWidth = Math.floor(brushLineWidth.value / instance.scale);
        setCursorRadius(brushLineWidth.value);
    } else if (num === 9) {
        instance.pencillineWidth = Math.floor(1 / instance.scale) * 5;
    }
    showPathMesg.value = false;
    instance.activeShape.active = false;
    instance.update();
    changeMode(1);
    stopMagicDrawing();
    if (selection.value === '0' && tabBarAreaRef.value.lockedItem === '') {
        changeCheck(0, '');
    }
    // objectBarAreaRef.value.changeSelectShape('');
    // if (route.query.subLabelType === '2') {
    //   instance.dataset = [];
    //   instance.update();
    // }
};

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Canvas to Blob conversion failed"));
            }
        });
    });
}

async function blobToByteArray(blob: Blob): Promise<Uint8Array> {
    const arrayBuffer = await new Response(blob).arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

const hideLabel = ref(false);
// 隐藏标签名
const handlehide = () => {
    instance.hideLabel = !instance.hideLabel;
    hideLabel.value = !hideLabel.value;
    instance.update();
}

//撤销
const undoOperation = () => {
    if (instance.magicPoints.length > 0) {
        magicToolHandler(null, true);
    } else if (instance.doneList.length === 1) {
        useMessage().wraning('无可撤销记录！！！');
    } else if (instance.focusMode) {
        useMessage().wraning('当前为专注模式，无法撤销或重做！！！');
    } else if (hideNum.value > 0) {
        useMessage().wraning('当前有标注被隐藏，无法撤销或重做！！！');
    } else {
        instance.undo();
        // // 撤销后若无选中项，则标签默认选第一个
        // if (instance.activeShape.uuid) {
        //     let currItem = selectItem.find(item => item.tagId === instance.activeShape.tagId);
        //     changeCheck(-1, currItem?.tagId ?? '', 'undore');
        // } else {
        //     changeCheck(0, '', 'undore');
        // }
    }
}

//重做
const redoOperation = () => {
    if (instance.undoList.length === 0) {
        useMessage().wraning('无可重做记录！！！');
    } else if (instance.focusMode) {
        useMessage().wraning('当前为专注模式，无法撤销或重做！！！');
    } else if (hideNum.value > 0) {
        useMessage().wraning('当前有标注被隐藏，无法撤销或重做！！！');
    } else {
        instance.redo();
        // if (instance.activeShape.uuid) {
        //     let currItem = selectItem.find(item => item.tagId === instance.activeShape.tagId);
        //     changeCheck(-1, currItem?.tagId ?? '', 'undore');
        // } else {
        //     changeCheck(0, '', 'undore');
        // }
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
const showReferLabel = async () => {
    if (selectedTaskId.value === '') {
        useMessage().wraning('请先右键图标进行配置！！！');
        return;
    } else if (showReference.value === '0') {
        if (objectBarAreaRef.value.hidedStatus) {
            currentOptions.value.forEach((item: Option) => {
                item.hiddening = false;
            });
            instance.setData(currentOptions.value);
        }
    }
    else if (showReference.value === '1') {
        // useMessage().wraning('当前配置仅显示标注标签，可右键图标进行修改！！！');
        instance_bgimg.deleteAllShape();
        if (objectBarAreaRef.value.hidedStatus) {
            currentOptions.value.forEach((item: Option) => {
                item.hiddening = false;
            });
            instance.setData(currentOptions.value);
        }
        return;
    } else if (showReference.value === '2') {
        // useMessage().wraning('当前配置仅显示参考标签，可右键图标进行修改！！！');
        let status = false;
        currentOptions.value.forEach((item: Option) => {
            if (!item.hiddening) {
                item.hiddening = true;
                status = true;
            }
        });
        if (status) {
            instance.setData(currentOptions.value);
        }
    }
    else if (referSelectItem.length === 0) {
        useMessage().wraning('当前配置无参考标签，请先右键图标进行配置！！！');
        return;
    }
    referToolVisible.value = false;
    const res = await getLabelObjDetails({
        fileId: selectedList.value[0],
        taskId: selectedTaskId.value,
    });
    let options: Option[] = [];
    if (res && res.data) {
        for (let j = 0; j < res.data.tagInfoList.length; j++) {
            const tagInfo = JSON.parse(res.data.tagInfoList[j].tagInfo);
            if (tagInfo) {
                // 矩形框
                if ('bbox_label' in tagInfo) {
                    const tagMsg = referSelectItem.find((item: Tag) => item.tagId == String(tagInfo.bbox_label));
                    if (tagMsg) {
                        options.push({
                            label: tagMsg.tagName,
                            tagId: String(tagInfo.bbox_label),
                            strokeStyle: tagMsg.color,
                            textFillStyle: tagMsg.color,
                            coor: [[tagInfo.bbox.xmin, tagInfo.bbox.ymin], [tagInfo.bbox.xmax, tagInfo.bbox.ymax]],
                            remark: tagInfo.remark ?? '',
                            type: 1,
                            labelType: 1,
                            active: false,
                            creating: false,
                            dragging: false,
                            hiddening: false
                        });
                    }
                } else if ('line_label' in tagInfo) {
                    // 直线
                    const tagMsg = referSelectItem.find((item: Tag) => item.tagId == String(tagInfo.line_label));
                    if (tagMsg) {
                        options.push({
                            label: tagMsg.tagName,
                            tagId: String(tagInfo.line_label),
                            strokeStyle: tagMsg.color,
                            textFillStyle: tagMsg.color,
                            coor: [[tagInfo.line.xmin, tagInfo.line.ymin], [tagInfo.line.xmax, tagInfo.line.ymax]],
                            remark: tagInfo.remark ?? '',
                            type: 4,
                            labelType: 1,
                            active: false,
                            creating: false,
                            dragging: false,
                            hiddening: false
                        });
                    }
                } else if ('circle_label' in tagInfo) {
                    // 圆框
                    const tagMsg = referSelectItem.find((item: Tag) => item.tagId == String(tagInfo.circle_label));
                    if (tagMsg) {
                        options.push({
                            label: tagMsg.tagName,
                            tagId: String(tagInfo.circle_label),
                            strokeStyle: tagMsg.color,
                            textFillStyle: tagMsg.color,
                            coor: [tagInfo.coor.x, tagInfo.coor.y],
                            radius: tagInfo.radius,
                            remark: tagInfo.remark ?? '',
                            type: 5,
                            labelType: 1,
                            active: false,
                            creating: false,
                            dragging: false,
                            hiddening: false
                        });
                    }
                }
            }
        }
    }
    if (options.length !== 0) {
        instance_bgimg.setData(options);
    }
}
const focusMode = ref(false);
const changeMode = (num: number) => {
    if (num === -1) {
        mode.value++;
    } else {
        mode.value = num;
    }
    if (mode.value === 4) {
        mode.value = 0;
    }
    if (mode.value === 0) {
        // 只读模式：可以选中，不能进行任何操作
        instance.readonly = true;
        instance.setFocusMode(false);
        focusMode.value = false;
    } else if (mode.value === 1) {
        // 绘制模式：可以绘制图形，只能修改当前正在创建的图形
        instance.readonly = false;
    } else if (mode.value === 2) {
        // 修订模式：可以修改任何图形
        instance.readonly = false;
        instance.setFocusMode(false);
        focusMode.value = false;
        instance.createType = 0;
        selection.value = '0';
    } else {
        // 专注模式：只显示所选中图形，其它隐藏
        instance.readonly = false;
        instance.setFocusMode(!instance.focusMode);
        focusMode.value = true;
    }
};

// 设置自定义光标初始样式
const setCursorRadius = (newRadius: number) => {
    if (customCursorRef.value) {
        customCursorRef.value!.style.width = `${newRadius * instance.scale}px`;
        customCursorRef.value!.style.height = `${newRadius * instance.scale}px`;
    }
}

const iserase = ref(false);
const eraser = () => {
    const clickedItem = objectBarAreaRef.value.clickedItem;
    if (clickedItem.length === 0) {
        useMessage().wraning("请先选择要擦除的标注对象！！！");
        return;
    }
    instance.isEraser = !instance.isEraser;
    iserase.value = instance.isEraser;
    if (iserase.value) {
        changeMode(1);
        toolType.value = 10;
        instance.createType = 7;
    }
}

// 显示图形的标签信息
// const showPathMesg = ref(false);
const pathTagName = ref('');
const pathTagColor = ref('');
const showPathMesg = ref(false);
const switchPathMesg = ref(true);
const switchToolBar = ref(true);
const pathRemark = ref('');
const havenRemark = ref(false);
const magicTagName = ref('');
const magicTagColor = ref('');

// 参考标签
const referToolVisible = ref(false);
const selectedTaskId = ref('');
const taskList = ref<Task[]>([]);
const showReference = ref('0'); // 0：都显示 1：只标注标签 2：只参考标签
const getTaskList = async () => {
    referToolVisible.value = !referToolVisible.value;
    if (taskList.value.length > 0) {
        return;
    }
    const res = await fetchTaskList({ baseDatasetId: taskForm.baseDatasetId, labelType: taskForm.labelType, subLabelType: route.query.subLabelType });
    if (res && res.data) {
        taskList.value = res.data.records[0].labelTaskList;
        taskList.value = taskList.value.filter(item => item.taskId !== taskForm.taskId);
    }
}

// 用来控制图片/画布的显示
const imageVisibility = ref(imageList.value.map(() => true)); // 默认每个项显示图片
// 切换显示图片/画布
const toggleImageCanvas = (index: number) => {
    // 切换当前项的显示状态
    imageVisibility.value[index] = !imageVisibility.value[index];
}
// 刷子图形合并
const brushMerge = (uuids: string[]) => {
    if (uuids.length <= 1) {
        useMessage().wraning('请选择要合并的图形！！！');
        return;
    }
    let tagId = '';
    // 若页面存在多种类型图形时，还需判断图形类型是否一致
    resultMessage.value.forEach((item, index) => {
        if (item.uuid && uuids.includes(item.uuid)) {
            if (tagId !== '' && tagId !== item.tagId) {
                useMessage().wraning('合并的图形类型不一致，请重新选择！！！');
                return;
            }
            tagId = item.tagId;
        }
    });
    handleSave();
}

// 钢笔图形融合
const mergeState = ref("");
const editPencilShape = (item: Option) => {
    mergeState.value = item.uuid;
    if (item.type === 9) {
        drawShapes(9);
        const selectedType = selectItem.find(i => i.tagId === item.tagId);
        pathTagName.value = selectedType?.tagName ?? '';
        pathTagColor.value = rgbaToHex(selectedType?.color ?? '#000000');
        brushColor.value = rgbaToHex(selectedType?.color ?? '#000000');
    }
};
const closePolygon = (poly: any[]) => {
    const closedPoly = poly.filter(point => point[0] !== -1 || point[1] !== -1); // 去掉 (-1, -1)
    if (closedPoly.length > 0) {
        closedPoly.push(closedPoly[0]); // 添加首点以闭合路径
    }
    return [closedPoly]; // 返回二维数组，符合 martinez 格式
}

const mergeShape = (Poly1: [number, number][], Poly2: [number, number][]): { hasMerge: boolean; points: [number, number][] } => {
    const closedPoly1 = closePolygon(JSON.parse(JSON.stringify(Poly1)));
    const closedPoly2 = closePolygon(JSON.parse(JSON.stringify(Poly2)));
    const intersectionResult = martinez.intersection(closedPoly1, closedPoly2);
    if (!intersectionResult || intersectionResult.length === 0) {
        // 如果没有交集，return
        console.log('无交集，返回');
        return { hasMerge: false, points: [] };
    } else {
        // 如果有交集，计算并集
        let unionResult = martinez.union(closedPoly1, closedPoly2);
        console.log('并集轨迹点数组:', unionResult[0][0]);
        return { hasMerge: true, points: unionResult[0][0] };
    }
}

function modifyRgbaAlpha(rgbaString: string, newAlpha: number): string {
    // 使用正则表达式匹配rgba格式的颜色字符串
    const rgbaRegex = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/;
    const match = rgbaString.match(rgbaRegex);

    if (match) {
        // 提取红、绿、蓝三个颜色通道的值，并转换为数字类型
        const red = parseInt(match[1], 10);
        const green = parseInt(match[2], 10);
        const blue = parseInt(match[3], 10);

        // 确保newAlpha是一个有效的alpha值（0到1之间）
        if (newAlpha < 0 || newAlpha > 1) {
            throw new Error("Alpha value must be between 0 and 1.");
        }

        // 构造新的rgba字符串，使用新的alpha值
        return `rgba(${red}, ${green}, ${blue}, ${newAlpha.toFixed(1)})`;
    } else {
        // 如果字符串不匹配rgba格式，则抛出错误
        throw new Error(`Invalid RGBA string: ${rgbaString}`);
    }
}

// #endregion

// #region ********************************计算变化后canvas的大小*************************
const leftTopDiv = ref<HTMLElement | null>(null);  // 用于引用 class="left-top" 的 div
const leftBottomDiv = ref<HTMLElement | null>(null);
const rightDiv = ref<HTMLElement | null>(null);
const mainDiv = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
// let mousedown = false;

const handleResize = () => {
    if (!mode.value) {
        return;
    }
    const mianHeight = mainDiv.value?.offsetHeight ?? 775;
    const mianWidth = mainDiv.value?.offsetWidth ?? 1670;
    const rightWidth = rightDiv.value?.offsetWidth ?? 272;
    const leftBottomHeight = leftBottomDiv.value?.offsetHeight ?? 145;
    const height = mianHeight - leftBottomHeight - 66;
    const width = mianWidth - rightWidth - 28;

    if (selectedIndex.value >= 0 && imageList.value.length !== 0) {
        instance.resize(width, height, 1, formatUrl(imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId));
        instance_bgimg.resize(width, height, 1, formatUrl(imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId));
        instance_temp.resize(width, height, 1, formatUrl(imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId))
        gotoImage(imageList.value[selectedIndex.value].bucketName, imageList.value[selectedIndex.value].fileName, imageList.value[selectedIndex.value].fileId, selectedIndex.value);
    }
};

// #endregion

// #region ********************************刷子图层转rel编码*************************
function encodeRle(arr: number[], wordsize = 8, rleSizes = [3, 4, 8, 16]): number[] {
    const num = arr.length;
    const numbits = num.toString(2).padStart(32, '0');

    const wordsizeBits = (wordsize - 1).toString(2).padStart(5, '0');
    const rleBits = rleSizes.map(x => (x - 1).toString(2).padStart(4, '0')).join('');

    let baseStr = numbits + wordsizeBits + rleBits;
    let outStr = '';

    let index = 0;
    while (index < arr.length) {
        let value = arr[index];
        let runLength = 1;

        // Count the length of the series
        while (index + runLength < arr.length && arr[index + runLength] === value) {
            runLength++;
        }

        if (runLength === 1) {
            outStr += '0';
            outStr += '00';
            outStr += '000';
            outStr += value.toString(2).padStart(8, '0');
        } else {
            outStr += '1';
            if (runLength <= 8) {
                outStr += '00';
                outStr += (runLength - 1).toString(2).padStart(3, '0');
                outStr += value.toString(2).padStart(8, '0');
            } else if (runLength <= 16) {
                outStr += '01';
                outStr += (runLength - 1).toString(2).padStart(4, '0');
                outStr += value.toString(2).padStart(8, '0');
            } else if (runLength <= 256) {
                outStr += '10';
                outStr += (runLength - 1).toString(2).padStart(8, '0');
                outStr += value.toString(2).padStart(8, '0');
            } else {
                let lengthTemp = runLength;
                while (lengthTemp > 65535) {
                    outStr += '1';
                    outStr += '11';
                    outStr += '1111111111111111'; // Max 16 bit length
                    outStr += value.toString(2).padStart(8, '0');
                    lengthTemp -= 65535;
                }

                outStr += '1';
                outStr += '11';
                outStr += (lengthTemp - 1).toString(2).padStart(16, '0');
                outStr += value.toString(2).padStart(8, '0');
            }
        }

        index += runLength;
    }

    const totalStr = baseStr + outStr;
    const nzFill = 8 - totalStr.length % 8;
    const paddedStr = totalStr + '0'.repeat(nzFill);
    return bits2byte(paddedStr);
}

function bits2byte(arrStr: string, n = 8): number[] {
    const rle: number[] = [];
    const numbers = arrStr.match(new RegExp(`.{1,${n}}`, 'g')) || [];
    numbers.forEach(num => rle.push(parseInt(num, 2)));
    return rle;
}

// The mask2rle function that converts the mask to run-length encoding
function mask2rle(mask: number[][]): number[] {
    const flattened = mask.flat(); // Flatten the 2D array into a 1D array
    return encodeRle(flattened);
}

// Function to convert canvas content to a mask
function canvasToMask(canvas: HTMLCanvasElement, imgWidth: number, imgHeight: number): number[][] {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context.');

    // Create a mask (2D array) of the same size as the image
    const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
    const mask: number[][] = [];

    // Extract the alpha channel to create a binary mask
    for (let y = 0; y < imgHeight; y++) {
        const row: number[] = [];
        for (let x = 0; x < imgWidth; x++) {
            const index = (y * imgWidth + x) * 4; // RGBA format
            const alpha = imageData.data[index + 3]; // Alpha channel
            row.push(alpha > 128 ? 1 : 0); // 1 for visible (non-transparent), 0 for transparent
        }
        mask.push(row);
    }

    return mask;
}

const saveMaskbyRle = () => {
    if (instance.canvas && instance.dataset.length > 0) {
        const mask = canvasToMask(instance.canvas, instance.canvas.width, instance.canvas.height);
        const rle = mask2rle(mask);
        console.log('RLE:', rle); // 打印RLE编码
        // 这里可以将rle发送到服务器或进行其他处理
    }
}

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
    // 判断taskId是否存在
    if (route.query.taskId && typeof route.query.taskId === 'string') {
        try {
            handelLoading.value = true;
            const res = await getTaskObj(route.query.taskId);
            state.queryForm.baseDatasetId = res.data.baseDatasetId;
            state.queryForm.taskId = route.query.taskId;
            taskForm.taskId = res.data.taskId;
            taskForm.taskName = res.data.taskName;
            taskForm.datasetId = res.data.datasetId;
            taskForm.baseDatasetId = res.data.baseDatasetId;
            taskForm.labelType = res.data.labelType;
            taskForm.subLabelType = res.data.subLabelType;
            taskForm.tagIds = res.data.tagIds || "[]";
            // 初始化标签列表
            selectItem.length = 0;
            if (res.data.tagList && res.data.tagList.length > 0) {
                res.data.tagList.forEach((tag: Tag) => {
                    selectItem.push({
                        tagId: tag.tagId,
                        tagName: tag.tagName,
                        color: hexToRgba(tag.color ?? '', 1) ?? 'rgba(0, 0, 0, 255)'
                    });
                });
            }
        } catch (err) {
            useMessage().error(err.msg);
        } finally {
            handelLoading.value = false;
        }
        // 加载完标签项和任务信息后再加载图片数据，避免gotoImage出问题
        if (taskForm.datasetId) {
            form.datasetId = taskForm.datasetId;
            openCanvas(form);
        } else {
            getDataList();
        }
    } else {
        useMessageBox().error("未获取到baseDatasetId")
        backIndex();
    }
    // 初始设置 canvas 尺寸
    instance = new CanvasSelect('.seg-canvas-container');
    instance_bgimg = new CanvasSelect('.bgimage');
    instance_temp = new CanvasSelect('.segtempcanvas');
    // instance.setImage('', 0);
    // instance_bgimg.setImage('');
    // instance.resize(800, 554, 0.5);
    // instance_bgimg.resize(800, 554);
    instance.readonly = true; //初始为查看模式
    // instance.labelUp = true;
    instance.activeStrokeStyle = hexToRgba(selectItem[0]?.color ?? '', 0.4) ?? '#00FF00';
    instance.activeFillStyle = hexToRgba(selectItem[0]?.color ?? '', 0.4) ?? '#00FF00';
    instance.labelFillStyle = 'transparent';
    instance.MAX_LENGTH = 30;
    instance.MIN_LENGTH = 250;
    instance_bgimg.MIN_LENGTH = 250;
    instance_temp.MIN_LENGTH = 250;
    instance_temp.labelFillStyle = 'transparent';
    // instance.labelFont = "12px sans-serif";
    instance.labelFontSize = 15;
    instance_temp.labelFontSize = 15;
    instance.labelFontFamily = 'sans-serif';
    instance.brushstrokeStyle = hexToRgba(selectItem[0]?.color ?? '', 1) ?? '#00FF00';
    instance.pencilstrokeStyle = hexToRgba(selectItem[0]?.color ?? '', 0.4) ?? '#00FF00';
    pathTagName.value = selectItem[0]?.tagName ?? '';
    pathTagColor.value = rgbaToHex(selectItem[0]?.color ?? '#000000');
    brushColor.value = rgbaToHex(selectItem[0]?.color ?? '#000000');
    // brushLineWidth.value = instance.brushlineWidth;
    const bucketNameParam = 'dataset/' + route.query.baseDatasetName + '/base/images';
    getFileDir(bucketNameParam);
    detectKey();
    handlehide();
    // 监听变化，调整canvas尺寸
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
    loading.value = false;
    handelLoading.value = false;
    instance.on('load', (src: string) => {
        console.log('图片加载完成', src);
        if (route.query.subLabelType === '2') {
            // needUpdate.value = true;
            instance_bgimg.setData(currentOptions.value);
            // instance.brushlineWidth = Math.floor(Number(brushLineWidth.value) / instance.scale);
            // setCursorRadius(instance.brushlineWidth);
        } else {
            instance.setData(currentOptions.value);
        }
        handelLoading.value = false;
    });
    instance_bgimg.on('load', (src: string) => {
        console.log('图片加载完成Image', src);
        // instance.setImage(formatUrl(currentbucketName.value, currentfileName.value), 0);
    });

    instance.on('scale', (info: any) => {
        // console.log('缩放', instance.scale);
        instance_bgimg.mouse = instance.mouse;
        if (info.type) {
            instance_bgimg.scaleStep = instance.scaleStep - 1;
        } else {
            instance_bgimg.scaleStep = instance.scaleStep + 1;
        }
        instance_bgimg.textscaleStep = instance.textscaleStep;
        instance_bgimg.setScale(info.type, info.byMouse, info.pure);
        instance_temp.setScale(info.type, info.byMouse, info.pure);
    });

    instance.on('dragimg', () => {
        instance_bgimg.originX = instance.originX;
        instance_bgimg.originY = instance.originY;
        instance_bgimg.update();
    });
    instance.on('fitZoom', () => {
        instance_bgimg.fitZoom();
    });
    instance.on("add", (info: any) => {
        if (info && tabBarAreaRef.value.lockedItem !== '') {
            changeCheck(-1, tabBarAreaRef.value.lockedItem)
        } else if (info && [9, 7, 5, 4, 2].includes(info.type) && !info.iseraser && pathTagName.value !== '') {
            let currItem = selectItem.find(item => item.tagName === pathTagName.value);
            if (currItem) {
                changeCheck(-1, currItem?.tagId);
            }
        }
        if (tabBarAreaRef.value.lockedItem == '') {
            if (info.type === 7 && info.iseraser) return;
            // 更新菜单的位置并显示菜单
            menuPosition.value = { x: mousePosition.value.x - 240, y: mousePosition.value.y - 160 };
            menuVisible.value = true;
            menuUuid.value = instance.activeShape.uuid;
        }
    });
    instance.on("updateLabel", (info: any) => {
        if (info.type === 9 && mergeState.value !== "") {
            // 检测是否有重叠的相同颜色的区域，有就合并
            let state = [];
            // for (let i = 0; i < instance.dataset.length - 1; i++) { //只有是有交集就合并
            //   if (instance.dataset[i].type === 9 && instance.dataset[i].fillStyle === info.fillStyle && instance.dataset[i].uuid !== info.uuid) {
            //     const { hasMerge, points } = mergeShape(instance.dataset[i].coor, info.coor);
            //     const minx = Math.min(instance.dataset[i].boundingRect[0], info.boundingRect[0]);
            //     const miny = Math.min(instance.dataset[i].boundingRect[1], info.boundingRect[1]);
            //     const maxx = Math.max(instance.dataset[i].boundingRect[2], info.boundingRect[2]);
            //     const maxy = Math.max(instance.dataset[i].boundingRect[3], info.boundingRect[3]);
            //     if (hasMerge) {
            //       state.push(i);
            //       info.coor = points;
            //       info.coor[info.coor.length - 1] = [-1, -1];
            //       info.boundingRect = [minx, miny, maxx, maxy];
            //     }
            //   }
            // }
            // 只考虑合并新创建和指定的图形
            // const index = instance.dataset.findIndex(item => item.uuid === mergeState.value);
            // if (index > 0 && instance.dataset[index].type === 9 && instance.dataset[index].fillStyle === info.fillStyle && instance.dataset[index].uuid !== info.uuid) {
            //   const { hasMerge, points } = mergeShape(instance.dataset[index].coor, info.coor);
            //   if (hasMerge) {
            //     const minx = Math.min(instance.dataset[index].boundingRect[0], info.boundingRect[0]);
            //     const miny = Math.min(instance.dataset[index].boundingRect[1], info.boundingRect[1]);
            //     const maxx = Math.max(instance.dataset[index].boundingRect[2], info.boundingRect[2]);
            //     const maxy = Math.max(instance.dataset[index].boundingRect[3], info.boundingRect[3]);
            //     state.push(index);
            //     info.coor = points;
            //     info.coor[info.coor.length - 1] = [-1, -1];
            //     info.boundingRect = [minx, miny, maxx, maxy];
            //   }
            // }
            // if (state.length > 0) {
            //   for (let i = state.length - 1; i >= 0; i--) {
            //     instance.dataset.splice(state[i], 1);
            //     instance.dataset.forEach((item, i) => { item.index = i; });
            //   }
            // }
        }
    });
    instance.on("select", (info: any) => {
        if (info && info.uuid) {
            showPathMesg.value = true;
            // objectBarAreaRef.value.changeSelectShape(info.uuid);
        } else {
            showPathMesg.value = false;
            if (mode.value === 1 && route.query.subLabelType === '2') {
                return;
            }
            objectBarAreaRef.value.changeSelectShape("");
            if (route.query.subLabelType === '2') {
                instance.dataset = [];
                instance.update();
            }
        }
        if (info && info.label) {
            let currItem = selectItem.find(item => item.tagName === info.label);
            instance.activeStrokeStyle = hexToRgba(currItem?.color ?? '', 0.8) ?? 'transparent';
            instance.activeFillStyle = hexToRgba(currItem?.color ?? '', 0.8) ?? 'transparent';
            // instance.textFillStyle = currItem?.color ?? '#F93238';
            // instance.labelFontSize = 15;
            // instance.labelFontFamily = 'sans-serif';
            pathTagName.value = info.label;
            pathTagColor.value = rgbaToHex(currItem?.color ?? '#000000');
            pathRemark.value = info.remark ?? '';
        } else {
            // pathTagName.value = '';
            // pathTagColor.value = '#000000';
            // if (info && tabBarAreaRef.value.lockedItem !== '') {
            //   changeCheck(-1, tabBarAreaRef.value.lockedItem)
            // }
        }
    });
    instance.on("delete", (info: any) => {
        console.log("delete", info);
        menuVisible.value = false;
        menuUuid.value = '';
    });
    instance.on("updated", (result: any) => {
        const list = [...result];
        list.sort((a: any, b: any) => a.index - b.index);
        resultMessage.value = list;
        console.log("resultMessage", resultMessage.value);
        if (instance.activeShape.creating) menuVisible.value = false;
    });
    instance_bgimg.on("updated", (result: any) => {
        if (route.query.subLabelType !== '2') {
            return;
        }
        const list = [...result];
        list.sort((a: any, b: any) => a.index - b.index);
        resultMessage_bgimg.value = list;
        // if (list.length > 0 && needUpdate.value) {
        // needUpdate.value = false;
        resultMessage_object.value = deepClone(list);
        // }
        console.log("resultMessage_bgimg", resultMessage_bgimg.value);
    });
    // instance_temp.on("updated", () => {
    //     // if (segtempCanvasRef.value && singleImageUrl.value === '') {
    //     // singleImageUrl.value = segtempCanvasRef.value.toDataURL("image/png");
    //     // }
    //     if (segtempCanvasRef.value && singleImageUrl.value === '') {
    //         console.log("update", segtempCanvasRef.value.toDataURL("image/png"));
    //     }
    // });

    // 设置AI工具中默认选择的标签和模型为列表的第一项
    if (selectItem.length > 0) {
        magicLabel.value = selectItem[0].tagId;
        magicTagName.value = selectItem[0].tagName
        magicTagColor.value = selectItem[0].color
    }
    if (modelItem.length > 0) {
        modelLabel.value = modelItem[0].modelId;
    }
    xscrollContainer.value?.addEventListener("wheel", handleWheelScroll);
    if (segcanvasRef.value) {
        // 监听鼠标移动事件
        segcanvasRef.value.addEventListener('contextmenu', handleRightClick);
        segcanvasRef.value.addEventListener('mousemove', handleMouseMove);
        segcanvasRef.value.addEventListener('mousedown', handleMouseDown);
        segcanvasRef.value.addEventListener('mouseup', handleMouseUp);
        segcanvasRef.value.addEventListener('mousewheel', handleMouseWheel);
        // 添加全局点击事件监听器，用于点击其他区域时关闭菜单
        document.addEventListener('click', handleClickOutside);
    }

})
onBeforeUnmount(() => {
    // 组件卸载时移除事件监听器
    if (resizeObserver && leftTopDiv.value) {
        resizeObserver.unobserve(leftTopDiv.value);
        resizeObserver.disconnect(); // 完全释放资源
        resizeObserver = null; // 避免悬空引用
    }
    window.onkeydown = null;
    window.onkeyup = null;
    instance.destroy();
    instance_bgimg.destroy();
    instance_temp.destroy();
});
// 注销时打印
onUnmounted(() => {
    xscrollContainer.value?.removeEventListener("wheel", handleWheelScroll);
    // 在组件销毁时移除事件监听器
    if (segcanvasRef.value) {
        segcanvasRef.value.removeEventListener('contextmenu', handleRightClick);
        segcanvasRef.value.removeEventListener('mousemove', handleMouseMove);
        segcanvasRef.value.removeEventListener('mousedown', handleMouseDown);
        segcanvasRef.value.removeEventListener('mouseup', handleMouseUp);
        segcanvasRef.value.removeEventListener('mousewheel', handleMouseWheel);
        document.removeEventListener('click', handleClickOutside);
    }
})



// 智能标注功能
interface ApiResponse {
    code: number;
    message: string;
    data_list: RectOption[] | CircleOption[] | LineOption[];
}
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
    labelType: 2,
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
        smartForm.subLabelType = taskForm.subLabelType ?? '';
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
            // const apiUrl = smartURL.value;
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
                }
                let options: Option[] = [];
                for (let j = 0; j < result.data_list.length; j++) {
                    // 矩形框
                    if (route.query.subLabelType === '0') {
                        const tagInfo = result.data_list[j] as RectOption;
                        const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.bbox_label));
                        if (tagMsg) {
                            options.push({
                                label: tagMsg.tagName,
                                tagId: String(tagInfo.bbox_label),
                                strokeStyle: tagMsg.color,
                                coor: [[tagInfo.bbox.xmin, tagInfo.bbox.ymin], [tagInfo.bbox.xmax, tagInfo.bbox.ymax]],
                                remark: tagInfo.remark ?? '',
                                type: 1,
                                active: false,
                                creating: false,
                                dragging: false,
                                hiddening: false
                            });
                        }
                    } else if (route.query.subLabelType === '1') {
                        // 直线
                        const tagInfo = result.data_list[j] as LineOption;
                        const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.line_label));
                        if (tagMsg) {
                            options.push({
                                label: tagMsg.tagName,
                                tagId: String(tagInfo.line_label),
                                strokeStyle: tagMsg.color,
                                coor: [[tagInfo.line.xmin, tagInfo.line.ymin], [tagInfo.line.xmax, tagInfo.line.ymax]],
                                remark: tagInfo.remark ?? '',
                                type: 4,
                                active: false,
                                creating: false,
                                dragging: false,
                                hiddening: false
                            });
                        }
                    } else if (route.query.subLabelType === '2') {
                        // 圆框
                        const tagInfo = result.data_list[j] as CircleOption;
                        const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.circle_label));
                        if (tagMsg) {
                            options.push({
                                label: tagMsg.tagName,
                                tagId: String(tagInfo.circle_label),
                                strokeStyle: tagMsg.color,
                                coor: [tagInfo.coor.x, tagInfo.coor.y],
                                radius: tagInfo.radius,
                                remark: tagInfo.remark ?? '',
                                type: 5,
                                active: false,
                                creating: false,
                                dragging: false,
                                hiddening: false
                            });
                        }
                    }
                }
                currentOptions.value = options;
                instance.setData(currentOptions.value);
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
const openFullScreen = () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    return loading;
}
const upLoadImage = async () => {
    // useMessage().wraning("接口尚未开发！！！");
    // throw new Error("接口尚未开发");
    // return;
    let loading: any;
    try {
        // 显示加载状态
        loading = openFullScreen();

        const tmp_canvas = document.createElement('canvas');
        tmp_canvas.width = instance.WIDTH;
        tmp_canvas.height = instance.HEIGHT;

        // if (maskCanvasRef.value) {
        //   maskCanvasRef.value.width = instance.WIDTH;
        //   maskCanvasRef.value.height = instance.HEIGHT;
        // }

        // const imageBlob = await canvasToBlob(tmp_canvas);
        // const imageByteArray = await blobToByteArray(imageBlob);

        // const formData = new FormData();
        // formData.append("imagesrc", new Blob([imageByteArray]), "image.png");
        // const response = await fetch("http://0.0.0.0:7860/image", {
        //   method: "POST",
        //   body: formData,
        // });
        const response = await fetch("http://0.0.0.0:7860/imagesrc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // 设置请求头为 JSON
            },
            body: JSON.stringify({
                url: instance.image.src,  // 传递包含 URL 的 JSON 数据
            }),
        });
        if (!response.ok) {
            isMagicToolActive.value = false;
            magicToolVisible.value = false;
            stopMagicDrawing();
            throw new Error("Network response was not ok");
        }

        // 解析 JSON 数据
        const data = await response.json();
        console.log("Success:", data);
        useMessage().success("预处理成功");
    } catch (error) {
        // isMagicToolActive.value = false;
        // magicToolVisible.value = false;
        // stopMagicDrawing();
        console.log("Error:", error);
        useMessage().wraning("预处理失败");
    } finally {
        // 确保加载状态在请求结束后关闭
        if (loading) {
            loading.close(); // 关闭 loading
        }
        console.log("finally");
    }
};
const havedMask = ref(false);
const getAllMask = async () => {
    if (havedMask.value) {
        instance_bgimg.deleteAllShape();
        havedMask.value = false;
        return;
    }
    try {
        if (magicingImage.value !== selectedList.value[0]) {
            try {
                await upLoadImage(); // 调用上传图片的函数
            } catch (error) {
                // 在外部捕获上层函数的错误
                console.error("处理上传时发生的错误:", error.message);
                return;
                // 在这里可以执行一些额外的错误处理，如显示通知或提示用户
            }
            magicingImage.value = selectedList.value[0];
        }
        havedMask.value = true;
        changeMode(2); // 切换为修订模式
    } catch (error) {
        console.error('获取掩码时发生错误:', error);
        return;
        // 可以在这里添加更多的错误处理逻辑
    }
    let loading: any;
    try {
        // 显示加载状态
        loading = openFullScreen();
        // 调用接口
        const response = await fetch("http://0.0.0.0:7860/everything", {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        let option = [
            {
                maskBase64: data.masks,
                type: 8,
                maskType: 'everything',
                // promptPoints: promptPoints,
            }
        ];

        instance_bgimg.setData(option);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        // 确保加载状态在请求结束后关闭
        if (loading) {
            loading.close(); // 关闭 loading
        }
    }
};

const magicToolVisible = ref(false);
const isMagicToolActive = ref(false);
const modelUrl = ref('');
const maskToPolygon = ref(false);
const magicingImage = ref('');
const magicLabel = ref("");
const modelLabel = ref("");
interface Model {
    modelId: string;
    modelName: string;
}
const modelItem = reactive<Model[]>([
    { modelName: 'Segment Anything 2.0', modelId: '1', }
]);
const pointsSlider = ref(0.25);

const magicTool = async () => {
    if (segcanvasRef.value) {
        segcanvasRef.value.style.cursor = "crosshair";
        segcanvasRef.value.addEventListener("mousedown", magicToolHandler);
        try {
            if (magicingImage.value !== selectedList.value[0]) {
                try {
                    await upLoadImage(); // 调用上传图片的函数
                } catch (error) {
                    // 在外部捕获上层函数的错误
                    console.error("处理上传时发生的错误:", error.message);
                    return;
                    // 在这里可以执行一些额外的错误处理，如显示通知或提示用户
                }
                magicingImage.value = selectedList.value[0];
            }
            changeMode(2); // 切换为修订模式
            isMagicToolActive.value = true;
            const magicTag = selectItem.find(item => item.tagId === magicLabel.value);
            magicTagName.value = magicTag?.tagName ?? '';
            magicTagColor.value = magicTag?.color ?? 'red';
            instance.activeStrokeStyle = hexToRgba(magicTag?.color ?? '', 0.4) ?? 'transparent';
            instance.activeFillStyle = hexToRgba(magicTag?.color ?? '', 0.4) ?? 'transparent';
        } catch (error) {
            console.error('获取掩码时发生错误:', error);
            isMagicToolActive.value = false;
            return;
            // 可以在这里添加更多的错误处理逻辑
        }
    } else {
        stopMagicDrawing();
    }
};
const stopMagicDrawing = () => {
    isMagicToolActive.value = false;
    if (segcanvasRef.value) {
        segcanvasRef.value.removeEventListener("mousedown", magicToolHandler);
        segcanvasRef.value.style.cursor = "default";
    }
};

interface PromptPoint {
    type: boolean; // true for left click, false for right click
    origPoint: [number, number];
    scaledPoint: [number, number];
}
let promptPoints: PromptPoint[] = [];
const magicToolHandler = (event: MouseEvent | null, undo: boolean = false): void => {
    if (event !== null) {
        event.preventDefault();
        if (!isMagicToolActive.value) return;
        console.log("magic tool handler");
        if (!instance.isInBackground(event)) return;
        console.log("dot in background");
    }

    const magicTag = selectItem.find(item => item.tagId === magicLabel.value);

    let loading: any;
    let option = {
        maskBase64: '',
        pixels: [],
        height: 0,
        weight: 0,
        type: 8,
        tagId: magicTag?.tagId,
        label: magicTag?.tagName,
        fillStyle: hexToRgba(magicTag?.color ?? '', 0.4),
        strokeStyle: hexToRgba(magicTag?.color ?? '', 0.4),
        maskType: 'click',
        maskToPolygon: maskToPolygon.value,
        magicPoints: [] as { coor: number[]; color: string }[],
    };
    loading = openFullScreen();

    if (event !== null && !undo) {
        // Step 1: Get starting point
        promptPoints.push({
            type: event.button === 0, // 0: left button, 1: middle button, 2: right button
            origPoint: [event.offsetX, event.offsetY],
            scaledPoint: instance_bgimg.getscaledPoint(event),
        });
    } else {
        promptPoints.pop();
    }


    const formData = new FormData();
    const typeList: number[] = [];
    const clickList: number[] = [];

    for (const thisPrompt of promptPoints) {
        typeList.push(thisPrompt.type ? 1 : 0);
        clickList.push(thisPrompt.scaledPoint[0]);
        clickList.push(thisPrompt.scaledPoint[1]);
        option.magicPoints.push({
            coor: [thisPrompt.scaledPoint[0], thisPrompt.scaledPoint[1]],
            color: thisPrompt.type ? 'green' : 'red'
        });
    }
    // instance.setData(option_Dots);

    formData.append("type", typeList);
    formData.append("click_list", clickList);

    // Send a POST request to the server API
    fetch("http://0.0.0.0:7860/click", {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            // const pixels: number[] = [];
            option.maskBase64 = data.masks;
            instance.setData([option]);
        })
        .catch((error) => {
            console.error("Error:", error);
        })
        .finally(() => {
            // 确保加载状态在请求结束后关闭
            if (loading) {
                loading.close(); // 关闭 loading
            }
        });
};
// const downLoadImage = () => {
//   if (segcanvasRef.value && imageCanvasRef.value) {
//     // 创建一个新的 canvas 元素
//     const compositeCanvas = document.createElement('canvas');
//     compositeCanvas.width = segcanvasRef.value.width;
//     compositeCanvas.height = segcanvasRef.value.height;

//     // 获取新的 canvas 的 2D 渲染上下文
//     const compositeCtx = compositeCanvas.getContext('2d');

//     if (compositeCtx) {
//       // 将背景 canvas 的内容绘制到新的 canvas 上
//       compositeCtx.drawImage(imageCanvasRef.value, 0, 0);

//       // 将前景 canvas 的内容绘制到新的 canvas 上
//       compositeCtx.drawImage(segcanvasRef.value, 0, 0);

//       // 将新的 canvas 内容转换为 Blob
//       compositeCanvas.toBlob((blob) => {
//         if (blob) {
//           // 创建一个下载链接
//           const downloadLink = document.createElement('a');
//           const url = URL.createObjectURL(blob); // 创建临时 URL
//           downloadLink.href = url;
//           downloadLink.download = 'composite_image.png'; // 文件名
//           downloadLink.click();

//           // 释放内存
//           URL.revokeObjectURL(url);
//         }
//       }, 'image/png'); // 生成 PNG 图像
//     }
//   }
// };

const donePoints = () => {
    stopMagicDrawing();
    if (instance.magicPoints.length > 0) {
        instance.endMagicTool();
    }
    promptPoints = [];
    instance.activeCanvasData = null;
    instance.activePolygon = '';
    instance.densityFactor = 0.5;
    instance.magicPoints = [];
};

watch(selectItem, () => {
    selectItem.forEach((item, index) => {
        const rgbaMatch = item.color.match(/rgba?\(([^)]+)\)/);
        if (rgbaMatch) {
            const [r, g, b] = rgbaMatch[1].split(',').slice(0, 3).map(s => s.trim());
            const key = `${r},${g},${b},255`;  // 只把 alpha 改为 255
            indexToColorMap.set(key, index + 1); // 下标从 1 开始，0 通常留给背景
        }
    });
});

// 监听 brushColor 的变化
watch(brushColor, (newColor, oldColor) => {
    console.log(`颜色变化: ${oldColor} -> ${newColor}`);
    // 在这里可以添加逻辑来处理颜色变化
    instance.brushstrokeStyle = hexToRgba(newColor ?? '', 1);
    instance.pencilstrokeStyle = hexToRgba(newColor ?? '', 0.4);
});


// 监听 brushLineWidth 的变化
watch(brushLineWidth, (newWidth, oldWidth) => {
    console.log(`线条宽度变化: ${oldWidth}px -> ${newWidth}px`);
    // 在这里可以添加逻辑来处理线条宽度变化
    instance.brushlineWidth = Math.floor(Number(newWidth) / instance.scale);
    console.log("instance.brushlineWidth", instance.brushlineWidth);
    setCursorRadius(instance.brushlineWidth);
});

// 监听 pointsSlider 的变化
watch(pointsSlider, (newWidth) => {
    instance.densityFactor = newWidth;
    if (instance.activeCanvasData && instance.activePolygon) {
        instance.changeMaskPolygon(newWidth);
    }
});

// 用于检测并等待子组件挂载成功
function waitForTabBarMounted(maxRetry = 10, delay = 100): Promise<void> {
    return new Promise((resolve, reject) => {
        const check = (retry = 0) => {
            if (countMode && tabBarAreaRef.value && objectBarAreaRef.value && fileDirTreeRef.value && shortCutKeyRef.value) resolve();
            else if (retry < maxRetry) setTimeout(() => check(retry + 1), delay);
            else reject('Ref 未挂载');
        };
        check();
    });
}

// 监控state.dataList变化
watch(() => state.dataList, async (newVal) => {
    console.log("state", newVal);
    console.log("state.pagination", state.pagination);
    if (state.dataList && state.dataList.length > 0) {
        if (existsFile.value === null) {
            const filePath = `${currentFileUrl.value}thumbnails/${state.dataList[0].bucketName}/${state.dataList[0].fileName}`;
            existsFile.value = await checkFileExists(filePath);
        }
        imageList.value.length = 0;
        imageViewList.value.length = 0;
        imageList.value.push(...(state.dataList ?? []));
        imageViewList.value.push(...(state.dataList ?? []).map((item: imageItem) => formatUrl(item.bucketName, item.fileName, item.fileId)));
        // 在 DOM 更新完成后执行下面的逻辑

        try {
            await waitForTabBarMounted(); // 等待 tabBarAreaRef 挂载完成
        } catch (e) {
            console.warn(e);
            return;
        }
        nextTick(() => {
            // 如果是 countMode 模式，跳转到第一张图片
            if (countMode.value) {
                gotoImage(imageList.value[0].bucketName, imageList.value[0].fileName, imageList.value[0].fileId, 0);
            } else {
                // 初始化前 12 张图片的 canvas
                state.dataList?.forEach((item, index) => {
                    initializeCanvas(index, item.fileId, item.bucketName, item.fileName);
                });
            }
        });
    }
    if (state.dataList && state.dataList.length > 0) {
        resultList.length = 0;
        for (let i = 0; i < state.dataList.length; i++) {
            if (state.dataList[i].tagInfoList && state.dataList[i].tagInfoList.length > 0) {
                let options: Option[] = [];
                for (let j = 0; j < state.dataList[i].tagInfoList.length; j++) {
                    const tagInfo = JSON.parse(state.dataList[i].tagInfoList[j].tagInfo);
                    if (tagInfo) {
                        const tagMsg = selectItem.find((item: Tag) => item.tagId == String(tagInfo.tagId));
                        if (tagMsg) {
                            options.push({
                                label: tagMsg.tagName,
                                tagId: String(tagInfo.tagId),
                                fillStyle: tagInfo.fillStyle,
                                coor: tagInfo.coor,
                                type: tagInfo.type,
                                // ...(tagInfo.boundingRect ? { boundingRect: tagInfo.boundingRect } : {}),
                                ...(tagInfo.encodePixelData ? { encodePixelData: tagInfo.encodePixelData } : {}),
                                ...(tagInfo.startPoint ? { startPoint: tagInfo.startPoint } : {}),
                                ...(tagInfo.width ? { width: tagInfo.width } : {}),
                                ...(tagInfo.height ? { height: tagInfo.height } : {}),
                                ...(tagInfo.lineWidth ? { lineWidth: tagInfo.lineWidth } : {}),
                                ...(tagInfo.iseraser ? { iseraser: tagInfo.iseraser } : {}),
                                ...(tagInfo.radius ? { radius: tagInfo.radius } : {}),
                                active: false,
                                creating: false,
                                dragging: false,
                                hiddening: false,
                                locking: false
                            });
                        }
                    }
                }
                resultList.push({
                    labelId: state.dataList[i].labelId,
                    fileId: state.dataList[i].fileId,
                    // type: state.dataList[i].labelFileName,
                    options: options
                });
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
    pageSize.value = state.pagination?.size ?? 18;
    getLabeledTotal({ taskId: route.query.taskId }).then((res) => {
        tagedNumber.value = res.data.total;
    }).catch((err) => {
        useMessage().error(err.msg);
    });
    selectedList.value = [];
}, { deep: true, immediate: true });

watch(() => state.pagination?.size, () => {
    pageSize.value = state.pagination?.size ?? 18;
}, { deep: true, immediate: true });

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
        z-index: 3;
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

.box-img {
    display: flex;
    flex-wrap: wrap;
    /* 允许子元素换行 */
    align-content: flex-start;
    /* 控制行的对齐方式，从顶部开始 */
    justify-content: flex-start;
    /* 控制项目在主轴的对齐方式，从左侧开始 */
    gap: 10px;
    /* 设置子元素之间的间距 */
    position: relative;
    flex: 1;
    /* flex布局，占据剩余空间 */
    // padding-top: 50px;
    // padding-right: 50px;
    // background-color: #f0f0f0;
    transition: all 0.3s;
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

/* 左边部分，占70%宽度，高度100% */
.left {
    flex: 80%;
    /* 左边占70% */
    display: flex;
    flex-direction: column;
    /* 使用列布局 */
    // background-color: lightblue;
    height: 100%;
}

.left-top {
    flex-grow: 8;
    /* 左边上部分占80%高度 */
    width: 100%;
    height: 100%;
    z-index: 2;
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
    margin-top: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    // max-width: 1370px;
    /* 左边下部分占20%高度 */
}

/* 右边部分，占30%宽度，高度100% */
.right {
    flex: 20%;
    /* 右边占30% */
    // background-color: lightgray;
    width: 100%;
    height: 100%;
    min-width: 272px;
    margin-left: 4px;
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

.seg-canvas-container {
    position: absolute;
    background-color: transparent;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.bgimage {
    position: absolute;
    background-color: #F7F7F7;
    width: 100%;
    height: 100%;
    z-index: -1;
}

.segtempcanvas {
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 100%;
    z-index: -2;
}

.smallcontainer {
    width: 100%;
    height: 160px;
    z-index: 2;
    position: relative;
    background-color: aliceblue;
}

.context-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    padding: 0;
    margin: 0;
    width: 180px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.context-menu li {
    padding: 8px 12px;
    cursor: pointer;
}

.context-menu li:hover {
    background-color: #f0f0f0;
}

.menu-item-label {
    display: block;
    width: 100%;
    white-space: nowrap;
    /* 防止换行 */
    overflow: hidden;
    /* 隐藏溢出内容 */
    text-overflow: ellipsis;
    /* 超出部分显示省略号 */
}

.search-input {
    width: 100%;
    padding: 4px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    margin-bottom: 8px;
}

.menu-list {
    max-height: 150px;
    /* 最大高度 */
    overflow-y: auto;
    /* 超过最大高度时显示滚动条 */
    padding: 0;
    margin: 0;
    list-style: none;
}

.blue-text {
    color: blue;
    /* 改变文本颜色为蓝色 */
    cursor: pointer;
    /* 使得文本看起来可点击 */
}

.blue-text:hover {
    text-decoration: underline;
    /* 鼠标悬停时添加下划线 */
}

.toolBar {
    position: absolute;
    /* 绝对定位 */
    top: 45px;
    /* 距离 canvas 顶部 10px */
    right: 0px;
    /* 距离 canvas 左侧 10px */
    background-color: rgba(255, 255, 255, 0.8);
    /* 半透明背景，便于看清 */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.colorSelect .el-input__wrapper {
    padding: 0;
    /* 仅影响 id 为 colorSelect 的 el-input */
}

.pathMesg {
    position: absolute;
    /* 设置子元素为绝对定位 */
    bottom: 0;
    /* 顶部距离 */
    right: 0;
    /* 右侧距离 */
    background-color: rgba(255, 255, 255, 0.8);
    padding: 10px;
    /* 内边距 */
    border: 1px solid #ccc;
    border-radius: 5px;
    user-select: none;
}

.cursor {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    width: 50%;
    height: 50%;
    /* 禁用鼠标事件以确保不会影响画布的其他操作 */
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

/* 自定义圆形光标 */
#customCursor {
    position: absolute;
    pointer-events: none;
    /* 禁止光标捕获点击事件 */
    border-radius: 50%;
    /* 圆形 */
    background-color: rgba(0, 0, 0, 0.5);
    /* 半透明黑色 */
    transform: translate(-50%, -50%);
    /* 将光标居中 */
    z-index: 10;
    /* 确保光标位于画布上方 */
}

.el-tabs--border-card {
    border: none;
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

.icon-pagination-container {
    display: flex;
    align-items: flex-end;
    /* 垂直居中对齐 */
    justify-content: flex-end;
    /* 水平右对齐 */
    gap: 10px;
    margin-bottom: 10px;
    /* 调整图标与分页组件之间的间距 */
}

// 树形目录结构
.filter-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    overflow: hidden;
    padding: 5px 5px 5px 3px;
    background-color: rgba(255, 255, 255, 0.8);
    /* 设置透明背景色 */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    /* 添加阴影 */
    transition: width 0.3s ease;
    /* 添加动画效果 */
    width: 300px;
    /* 默认宽度 */
}

.filter-container.collapsed {
    width: 100%;
    /* 收缩时的宽度 */
}

.filter-input {
    width: 100%;
    min-width: 200px;
    padding: 0 0 5px 5px;
    background-color: rgba(255, 255, 255, 0.6);
    /* 设置透明背景色 */
    border-radius: 4px;
}

.filter-tree {
    max-height: 500px;
    margin-bottom: 10px;
    margin-right: 5px;
    /* 设置树形控件最大高度 */
    overflow-y: auto;
    /* 设置超出内容显示滚动条 */
    background-color: rgba(255, 255, 255, 0.6);
    /* 设置透明背景色 */
    border-radius: 4px;
}

.collapsed-content {
    padding: 5px;
    text-align: center;
    color: #333;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
}

.collapse-icon {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    /* 水平居中 */
    cursor: pointer;
    font-size: 20px;
    z-index: 100;
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


.el-collapse-item:hover>.el-collapse-item__header {
    background-color: #f5f5f5;
}

.el-collapse-item:hover>.el-collapse-item__wrap {
    background-color: #fafafa;
}

.el-collapse-item__header {
    padding-left: 20px;
}

.el-collapse-item__content {
    padding-bottom: 5px;
}


@media (max-width: 1600px) {

    .file-size {
        display: none;
    }
}

@media (max-width: 1345px) {

    .tab-pane {
        display: none;
    }
}

@media (max-width: 780px) {

    .file-name {
        display: none;
    }

    .page-info {
        display: none;
    }
}


@media (max-width: 1470px) {

    .filter-msg {
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