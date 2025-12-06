# 查询员工树API接口说明

## 接口列表

### 1. 查询员工树

**接口描述**: 根据员工ID查询员工组织树结构

**Path**: `/api/employee/queryEmpTree`

**Method**: POST

#### 请求参数

| 参数名 | 是否必须 | 类型 | 说明 |
|--------|----------|------|------|
| empId | 是 | String | 员工ID |
| includeSubordinates | 否 | Boolean | 是否包含下属，默认false |
| maxDepth | 否 | Integer | 查询最大层级，默认3 |

#### 响应参数

| 属性 | 类型 | 是否必有字段 | 说明 |
|------|------|--------------|------|
| empId | String | 是 | 员工ID |
| empName | String | 是 | 员工姓名 |
| empCode | String | 是 | 员工编号 |
| deptId | String | 是 | 部门ID |
| deptName | String | 是 | 部门名称 |
| position | String | 否 | 职位 |
| level | Integer | 是 | 层级 |
| parentEmpId | String | 否 | 上级员工ID |
| children | List<Object> | 否 | 下属员工列表（递归结构） |

## 特殊状态码及消息说明

| 状态码 | 消息 | 场景 |
|--------|------|------|
| 0 | 成功 | 查询成功 |
| 1001 | 员工不存在 | 员工ID无效 |
| 1002 | 无权限查询 | 无查询权限 |
| 1003 | 参数错误 | 请求参数不合法 |

## Host定义

| 环境 | 地址 |
|------|------|
| dev | http://api-dev.company.com |
| test | http://api-test.company.com |
| prod | https://api.company.com |

## Spring Boot代码生成说明

本接口支持生成以下Spring Boot代码模板：
- Controller层代码
- Service层代码
- Entity实体类
- DTO数据传输对象
- Repository接口
