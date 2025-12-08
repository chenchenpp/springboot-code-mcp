/**
 * 查询员工树API接口示例数据
 */
import { QueryEmpTreeRequest, QueryEmpTreeResponse, EmployeeTreeNode } from './types.js';

// 查询员工树请求示例
export const queryEmpTreeRequestExample: QueryEmpTreeRequest = {
  empId: 'EMP001',
  includeSubordinates: true,
  maxDepth: 3,
};

// 员工树节点示例
export const employeeTreeNodeExample: EmployeeTreeNode = {
  empId: 'EMP001',
  empName: '杨力生',
  empCode: 'E001',
  deptId: 'DEPT001',
  deptName: '技术部',
  position: '技术总监',
  level: 1,
  children: [
    {
      empId: 'EMP002',
      empName: '叶岭',
      empCode: 'E002',
      deptId: 'DEPT002',
      deptName: '研发一组',
      position: '高级开发经理',
      level: 2,
      parentEmpId: 'EMP001',
      children: [
        {
          empId: 'EMP003',
          empName: '李阳阳',
          empCode: 'E003',
          deptId: 'DEPT002',
          deptName: '研发一组',
          position: '高级工程师',
          level: 3,
          parentEmpId: 'EMP002',
        },
        {
          empId: 'EMP004',
          empName: '周凡皓',
          empCode: 'E004',
          deptId: 'DEPT002',
          deptName: '研发一组',
          position: '高级工程师',
          level: 3,
          parentEmpId: 'EMP002',
        },
        {
          empId: 'EMP005',
          empName: '陈澎',
          empCode: 'E005',
          deptId: 'DEPT002',
          deptName: '研发一组',
          position: '高级工程师',
          level: 3,
          parentEmpId: 'EMP002',
        },
      ],
    },
  ],
};

// 查询员工树响应示例
export const queryEmpTreeResponseExample: QueryEmpTreeResponse = {
  data: employeeTreeNodeExample,
  code: 0,
  message: '查询成功',
};

// 错误响应示例
export const queryEmpTreeErrorExample: QueryEmpTreeResponse = {
  data: {} as EmployeeTreeNode,
  code: 1001,
  message: '员工不存在',
};
