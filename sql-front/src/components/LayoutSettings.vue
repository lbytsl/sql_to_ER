<template>
  <div class="layout-controls" v-if="modelValue">
    <div class="controls-header">
      <span>布局设置</span>
      <el-button type="text" size="small" @click="close">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
    <div class="slider-container">
      <span class="slider-label">实体间距:</span>
      <el-slider v-model="entitySpacingModel" :min="100" :max="500" :step="10" @change="handleSpacingChange" />
    </div>
    <div class="slider-container">
      <span class="slider-label">属性间距:</span>
      <el-slider v-model="attributeSpacingModel" :min="50" :max="250" :step="5" @change="handleSpacingChange" />
    </div>
    <div class="slider-container">
      <span class="slider-label">字体大小:</span>
      <el-slider v-model="fontSizeModel" :min="10" :max="24" :step="1" @change="handleStyleChange" />
    </div>
    <div class="color-container">
      <span class="slider-label">背景颜色:</span>
      <el-color-picker v-model="backgroundColorModel" @change="handleStyleChange" show-alpha size="small" />
    </div>
    <div class="color-container">
      <span class="slider-label">框线颜色:</span>
      <el-color-picker v-model="borderColorModel" @change="handleStyleChange" size="small" />
    </div>
    <div class="color-container">
      <span class="slider-label">字体颜色:</span>
      <el-color-picker v-model="textColorModel" @change="handleStyleChange" size="small" />
    </div>
    <div class="button-container">
      <el-button size="small" type="primary" @click="applyStyles">应用样式</el-button>
      <el-button size="small" @click="resetStyles">重置</el-button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'

export default {
  name: 'LayoutSettings',
  components: {
    Close
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    entitySpacing: {
      type: Number,
      default: 180
    },
    attributeSpacing: {
      type: Number,
      default: 100
    },
    fontSize: {
      type: Number,
      default: 16
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    borderColor: {
      type: String,
      default: '#1890ff'
    },
    textColor: {
      type: String,
      default: '#333333'
    }
  },
  emits: ['update:modelValue', 'apply-styles', 'reset-styles', 'spacing-change', 'style-change'],
  setup(props, { emit }) {
    // 使用计算属性创建双向绑定
    const entitySpacingModel = computed({
      get: () => props.entitySpacing,
      set: (value) => emit('update:entitySpacing', value)
    })

    const attributeSpacingModel = computed({
      get: () => props.attributeSpacing,
      set: (value) => emit('update:attributeSpacing', value)
    })

    const fontSizeModel = computed({
      get: () => props.fontSize,
      set: (value) => emit('update:fontSize', value)
    })

    const backgroundColorModel = computed({
      get: () => props.backgroundColor,
      set: (value) => emit('update:backgroundColor', value)
    })

    const borderColorModel = computed({
      get: () => props.borderColor,
      set: (value) => emit('update:borderColor', value)
    })

    const textColorModel = computed({
      get: () => props.textColor,
      set: (value) => emit('update:textColor', value)
    })

    const close = () => {
      emit('update:modelValue', false)
    }

    const handleSpacingChange = () => {
      emit('spacing-change')
    }

    const handleStyleChange = () => {
      emit('style-change')
    }

    const applyStyles = () => {
      emit('apply-styles')
    }

    const resetStyles = () => {
      emit('reset-styles')
    }

    return {
      entitySpacingModel,
      attributeSpacingModel,
      fontSizeModel,
      backgroundColorModel,
      borderColorModel,
      textColorModel,
      close,
      handleSpacingChange,
      handleStyleChange,
      applyStyles,
      resetStyles
    }
  }
}
</script>

<style lang="scss" scoped>
.layout-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 280px;
  
  .controls-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 8px;
    
    span {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }
  
  .slider-container {
    margin-bottom: 16px;
    
    .slider-label {
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
      color: #606266;
    }
  }
  
  .color-container {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .slider-label {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .button-container {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
  }
}
</style> 