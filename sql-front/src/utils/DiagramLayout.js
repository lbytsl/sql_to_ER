/**
 * ER图布局工具类
 * 用于处理ER图表的自动布局算法
 */
import * as go from 'gojs'

export default class DiagramLayout {
  /**
   * 执行自动布局
   * @param {go.Diagram} diagram - GoJS图表实例
   * @param {Object} options - 布局配置选项
   * @returns {boolean} - 布局是否成功
   */
  static autoLayout(diagram, options) {
    if (!diagram || !diagram.nodes.count) {
      console.error('图表未初始化或没有节点')
      return false
    }

    const {
      entitySpacing = 180,
      attributeSpacing = 100,
      fontSize = 16,
      backgroundColor = '#ffffff',
      borderColor = '#1890ff',
      textColor = '#333333'
    } = options || {}

    diagram.startTransaction("自动排版")
    
    try {
      // 将所有节点数据分类为实体和属性
      const entityNodes = []
      const attributeNodesByEntity = {}

      diagram.nodes.each(node => {
        if (node.category === "Entity") {
          entityNodes.push(node)
          attributeNodesByEntity[node.key] = []
        }
      })

      // 为每个实体收集其相关属性
      diagram.links.each(link => {
        const fromNode = link.fromNode
        const toNode = link.toNode
        
        if (fromNode.category === "Entity" && toNode.category === "Attribute") {
          attributeNodesByEntity[fromNode.key].push(toNode)
        }
      })

      // 应用样式到所有节点
      this.applyStylesToNodes(diagram, {
        fontSize,
        backgroundColor,
        borderColor,
        textColor
      })

      // 对每个实体应用放射状布局
      entityNodes.forEach(entityNode => {
        const attributes = attributeNodesByEntity[entityNode.key]
        if (attributes.length > 0) {
          this.applyRadialLayout(entityNode, attributes, attributeSpacing)
        }
      })

      // 当实体节点数量大于1时，使用圆形布局
      if (entityNodes.length > 1) {
        this.applyCircularLayout(entityNodes, entitySpacing, attributeNodesByEntity, attributeSpacing)
      }

      diagram.commitTransaction("自动排版")
      
      // 缩放到适合视图
      diagram.zoomToFit()
      diagram.contentAlignment = go.Spot.Center
      
      return true
    } catch (error) {
      console.error('布局过程中发生错误:', error)
      diagram.rollbackTransaction("自动排版")
      return false
    }
  }

  /**
   * 应用样式到图表节点和连线
   * @param {go.Diagram} diagram - GoJS图表实例
   * @param {Object} styles - 样式配置
   */
  static applyStylesToNodes(diagram, styles) {
    const { fontSize, backgroundColor, borderColor, textColor } = styles
    
    // 应用样式到所有节点
    diagram.nodes.each(node => {
      try {
        diagram.model.setDataProperty(node.data, "fontSize", fontSize)
        diagram.model.setDataProperty(node.data, "background", backgroundColor)
        diagram.model.setDataProperty(node.data, "border", borderColor)
        diagram.model.setDataProperty(node.data, "textColor", textColor)
      } catch (error) {
        console.error('应用节点样式时出错:', error)
      }
    })
    
    // 应用样式到所有连接线
    diagram.links.each(link => {
      try {
        diagram.model.setDataProperty(link.data, "linkColor", borderColor)
        diagram.model.setDataProperty(link.data, "linkTextColor", textColor)
      } catch (error) {
        console.error('应用连接线样式时出错:', error)
      }
    })
  }

  /**
   * 圆形布局算法 - 将实体节点均匀分布在圆上
   * @param {Array} entityNodes - 实体节点列表
   * @param {number} entitySpacing - 实体间距
   * @param {Object} attributeNodesByEntity - 每个实体的属性节点映射
   * @param {number} attributeSpacing - 属性间距
   */
  static applyCircularLayout(entityNodes, entitySpacing, attributeNodesByEntity, attributeSpacing) {
    // 使用实体间距设置圆的半径
    const layoutRadius = Math.max(150, entityNodes.length * 50, entitySpacing)
    
    // 在圆上均匀分布实体节点
    entityNodes.forEach((node, index) => {
      const angle = (index * 2 * Math.PI) / entityNodes.length
      const x = layoutRadius * Math.cos(angle)
      const y = layoutRadius * Math.sin(angle)
      
      // 设置实体节点位置
      node.location = new go.Point(x, y)
      
      // 更新该实体的属性节点位置
      const attributes = attributeNodesByEntity[node.key]
      if (attributes && attributes.length > 0) {
        this.applyRadialLayout(node, attributes, attributeSpacing)
      }
    })
  }
  
  /**
   * 放射状布局算法 - 将属性围绕实体均匀分布
   * @param {go.Node} entityNode - 实体节点
   * @param {Array} attributeNodes - 属性节点列表
   * @param {number} attributeSpacing - 属性间距
   */
  static applyRadialLayout(entityNode, attributeNodes, attributeSpacing) {
    if (!entityNode || !attributeNodes || attributeNodes.length === 0) return

    const entityPos = entityNode.location
    
    // 计算合适的半径 - 考虑属性名称长度
    let maxLabelLength = 0
    attributeNodes.forEach(node => {
      maxLabelLength = Math.max(maxLabelLength, node.data.name.length)
    })
    
    // 使用属性间距计算基础半径
    const baseRadius = Math.max(80, attributeSpacing + attributeNodes.length * 5 + maxLabelLength * 2)
    
    // 计算每个节点占用的角度空间
    const angleStep = (2 * Math.PI) / attributeNodes.length
    
    // 为每个属性计算位置，防止交叉
    const positions = []
    
    // 第一次尝试放置所有节点，计算初始位置
    attributeNodes.forEach((attrNode, index) => {
      // 计算角度 (均匀分布在圆周上)
      const angle = index * angleStep
      
      // 为文本长度较长的节点增加半径
      const textLengthFactor = attrNode.data.name.length / maxLabelLength
      const nodeRadius = baseRadius * (1 + 0.2 * textLengthFactor)
      
      // 计算初始位置
      const x = entityPos.x + nodeRadius * Math.cos(angle)
      const y = entityPos.y + nodeRadius * Math.sin(angle)
      
      positions.push({
        node: attrNode,
        angle: angle,
        radius: nodeRadius,
        x: x,
        y: y,
        index: index
      })
    })
    
    // 检测并解决冲突
    this.resolveCollisions(positions, entityPos)
    
    // 应用最终位置
    positions.forEach(pos => {
      pos.node.location = new go.Point(pos.x, pos.y)
    })
  }

  /**
   * 解决节点位置冲突
   * @param {Array} positions - 节点位置列表
   * @param {go.Point} entityPos - 实体节点位置
   */
  static resolveCollisions(positions, entityPos) {
    let hasCollision = true
    let iterations = 0
    const maxIterations = 5
    
    while (hasCollision && iterations < maxIterations) {
      hasCollision = false
      iterations++
      
      // 检查每对节点是否冲突
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const pos1 = positions[i]
          const pos2 = positions[j]
          
          // 计算两点之间的距离
          const dx = pos1.x - pos2.x
          const dy = pos1.y - pos2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // 判断是否发生冲突 (考虑节点大小)
          const minDistance = 60 + 5 * (pos1.node.data.name.length + pos2.node.data.name.length) / 2
          
          if (distance < minDistance) {
            hasCollision = true
            
            // 增加两个点的半径，使它们分开
            pos1.radius += 20
            pos2.radius += 20
            
            // 重新计算位置
            pos1.x = entityPos.x + pos1.radius * Math.cos(pos1.angle)
            pos1.y = entityPos.y + pos1.radius * Math.sin(pos1.angle)
            pos2.x = entityPos.x + pos2.radius * Math.cos(pos2.angle)
            pos2.y = entityPos.y + pos2.radius * Math.sin(pos2.angle)
          }
        }
      }
    }
  }
} 