<!--
 * @Author: peng.chen2 peng.chen2@rt-mart.com
 * @Date: 2025-12-05 18:59:00
 * @LastEditors: peng.chen2 peng.chen2@rt-mart.com
 * @LastEditTime: 2025-12-06 14:28:27
 * @FilePath: /rt-api-mcp/readme.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# Spring Boot API代码生成MCP工具

接口文档：<http://yundocv6.idc1.fn/weboffice/l/cejZ1Nrq2ld2>

## 项目简介

本项目是一个基于MCP（Model Context Protocol）的Spring Boot代码生成工具。通过调用MCP工具，可以根据API接口文档自动生成符合Spring Boot规范的Java代码模板，包括Controller、Service、Entity、DTO、Repository等完整的分层架构代码。

## 可用工具

### 1. 消费打卡API工具

#### `getClockInChannelPage`
获取消费打卡频道页数据
- 参数: `storeId` (门店编号)
- 返回: 频道页数据包括背景图、活动规则、打卡窗格列表等

#### `performClockIn`
执行消费打卡操作
- 参数: `storeId` (门店编号), `activityId` (活动ID)
- 返回: 打卡结果提示信息

### 2. 员工树查询API工具

#### `queryEmployeeTree`
查询员工组织树结构
- 参数:
  - `empId` (员工ID) - 必填
  - `includeSubordinates` (是否包含下属) - 可选，默认false
  - `maxDepth` (查询最大层级) - 可选，默认3
- 返回: 员工及其下属的树形结构数据

#### `generateEmployeeSpringBootCode`
生成员工树查询接口的完整Spring Boot代码
- 参数:
  - `packageName` (包名) - 必填，例如：com.company.employee
  - `moduleName` (模块名) - 必填，例如：employee
  - `author` (作者) - 可选
  - `generateController` (是否生成Controller) - 可选，默认true
  - `generateService` (是否生成Service) - 可选，默认true
  - `generateEntity` (是否生成Entity) - 可选，默认true
  - `generateDto` (是否生成DTO) - 可选，默认true
  - `generateRepository` (是否生成Repository) - 可选，默认true
- 返回: 完整的Spring Boot分层架构代码

#### `generateEmployeeComponent`
生成员工树查询接口的单个组件代码
- 参数:
  - `packageName` (包名) - 必填
  - `moduleName` (模块名) - 必填
  - `author` (作者) - 可选
  - `componentType` (组件类型) - 必填，可选值：Controller/Service/Entity/DTO/Repository
- 返回: 指定组件的Java代码

## 使用示例

### 查询员工树数据
```
请帮我查询员工ID为EMP001的员工树，包含下属，最多3层
```

### 生成完整Spring Boot代码
```
请为员工树查询接口生成完整的Spring Boot代码，包名为com.company.employee，模块名为employee
```

### 生成单个组件代码
```
请为员工树查询接口生成Controller代码，包名为com.company.employee
```

## 项目结构

```
src/
├── apiData/              # API数据定义
│   ├── clockInActivity/  # 消费打卡API
│   │   ├── docs.md       # 接口文档
│   │   ├── types.ts      # 类型定义
│   │   ├── examples.ts   # 示例数据
│   │   └── index.ts      # 导出文件
│   └── queryEmpTree/     # 员工树查询API
│       ├── docs.md       # 接口文档
│       ├── types.ts      # 类型定义
│       ├── examples.ts   # 示例数据
│       ├── templates.ts  # Spring Boot代码模板
│       └── index.ts      # 导出文件
├── tools/                # MCP工具实现
│   ├── clockInActivity.ts
│   ├── queryEmpTree.ts
│   └── index.ts
└── index.ts              # 主入口

```

## 技术特点

1. **符合MCP规范**: 严格按照Model Context Protocol规范实现工具注册和调用
2. **完整的分层架构**: 生成的代码包含Controller、Service、Entity、DTO、Repository完整分层
3. **符合Spring Boot规范**: 生成的代码符合Spring Boot最佳实践和Java编码规范
4. **灵活的代码生成**: 支持生成完整代码包或单个组件代码
5. **类型安全**: 使用TypeScript和Zod进行类型定义和验证