/**
 * 查询员工树接口数据类型定义
 */

// 员工树节点
export interface EmployeeTreeNode {
  empId: string; // 员工ID
  empName: string; // 员工姓名
  empCode: string; // 员工编号
  deptId: string; // 部门ID
  deptName: string; // 部门名称
  position?: string; // 职位（可选）
  level: number; // 层级
  parentEmpId?: string; // 上级员工ID（可选）
  children?: EmployeeTreeNode[]; // 下属员工列表（可选，递归结构）
}

// 查询员工树请求参数
export interface QueryEmpTreeRequest {
  empId: string; // 员工ID
  includeSubordinates?: boolean; // 是否包含下属，默认false
  maxDepth?: number; // 查询最大层级，默认3
}

// 查询员工树响应数据
export interface QueryEmpTreeResponse {
  data: EmployeeTreeNode; // 员工树数据
  code: number; // 状态码
  message: string; // 消息
}

// Spring Boot代码生成配置
export interface SpringBootCodeConfig {
  packageName: string; // 包名
  moduleName: string; // 模块名
  author?: string; // 作者
  generateController?: boolean; // 是否生成Controller
  generateService?: boolean; // 是否生成Service
  generateEntity?: boolean; // 是否生成Entity
  generateDto?: boolean; // 是否生成DTO
  generateRepository?: boolean; // 是否生成Repository
}
