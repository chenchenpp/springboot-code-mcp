/*
 * @Author: peng.chen2 peng.chen2@rt-mart.com
 * @Date: 2025-12-06 14:26:58
 * @LastEditors: peng.chen2 peng.chen2@rt-mart.com
 * @LastEditTime: 2025-12-06 14:31:51
 * @FilePath: /rt-api-mcp/src/apiData/queryEmpTree/templates.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Spring Boot代码模板生成器
 */
import { SpringBootCodeConfig } from './types.js';

/**
 * 生成Controller代码
 */
export function generateController(config: SpringBootCodeConfig): string {
  const { packageName, author = 'System' } = config;

  return `package ${packageName}.controller;

import ${packageName}.dto.QueryEmpTreeRequest;
import ${packageName}.dto.QueryEmpTreeResponse;
import ${packageName}.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

/**
 * 员工管理Controller
 * @author ${author}
 */
@Api(tags = "员工管理")
@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    /**
     * 查询员工树
     */
    @ApiOperation("查询员工树")
    @PostMapping("/queryEmpTree")
    public QueryEmpTreeResponse queryEmpTree(@RequestBody QueryEmpTreeRequest request) {
        return employeeService.queryEmpTree(request);
    }
}`;
}

/**
 * 生成Service接口代码
 */
export function generateServiceInterface(config: SpringBootCodeConfig): string {
  const { packageName, author = 'System' } = config;

  return `package ${packageName}.service;

import ${packageName}.dto.QueryEmpTreeRequest;
import ${packageName}.dto.QueryEmpTreeResponse;

/**
 * 员工服务接口
 * @author ${author}
 */
public interface EmployeeService {
    
    /**
     * 查询员工树
     * @param request 查询请求
     * @return 员工树数据
     */
    QueryEmpTreeResponse queryEmpTree(QueryEmpTreeRequest request);
}`;
}

/**
 * 生成Service实现类代码
 */
export function generateServiceImpl(config: SpringBootCodeConfig): string {
  const { packageName, author = 'System' } = config;

  return `package ${packageName}.service.impl;

import ${packageName}.dto.QueryEmpTreeRequest;
import ${packageName}.dto.QueryEmpTreeResponse;
import ${packageName}.entity.Employee;
import ${packageName}.repository.EmployeeRepository;
import ${packageName}.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 员工服务实现类
 * @author ${author}
 */
@Slf4j
@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public QueryEmpTreeResponse queryEmpTree(QueryEmpTreeRequest request) {
        try {
            // 查询员工信息
            Employee employee = employeeRepository.findByEmpId(request.getEmpId());
            
            if (employee == null) {
                return QueryEmpTreeResponse.error(1001, "员工不存在");
            }
            
            // 构建员工树
            EmployeeTreeNode treeNode = buildEmployeeTree(employee, request);
            
            return QueryEmpTreeResponse.success(treeNode);
        } catch (Exception e) {
            log.error("查询员工树失败", e);
            return QueryEmpTreeResponse.error(500, "系统错误");
        }
    }
    
    /**
     * 构建员工树
     */
    private EmployeeTreeNode buildEmployeeTree(Employee employee, QueryEmpTreeRequest request) {
        EmployeeTreeNode node = new EmployeeTreeNode();
        node.setEmpId(employee.getEmpId());
        node.setEmpName(employee.getEmpName());
        node.setEmpCode(employee.getEmpCode());
        node.setDeptId(employee.getDeptId());
        node.setDeptName(employee.getDeptName());
        node.setPosition(employee.getPosition());
        node.setLevel(1);
        
        // 如果需要查询下属
        if (Boolean.TRUE.equals(request.getIncludeSubordinates())) {
            int maxDepth = request.getMaxDepth() != null ? request.getMaxDepth() : 3;
            List<Employee> subordinates = employeeRepository.findByParentEmpId(employee.getEmpId());
            node.setChildren(subordinates.stream()
                .map(sub -> buildSubordinateTree(sub, 2, maxDepth))
                .collect(Collectors.toList()));
        }
        
        return node;
    }
    
    /**
     * 递归构建下属树
     */
    private EmployeeTreeNode buildSubordinateTree(Employee employee, int currentLevel, int maxDepth) {
        EmployeeTreeNode node = new EmployeeTreeNode();
        node.setEmpId(employee.getEmpId());
        node.setEmpName(employee.getEmpName());
        node.setEmpCode(employee.getEmpCode());
        node.setDeptId(employee.getDeptId());
        node.setDeptName(employee.getDeptName());
        node.setPosition(employee.getPosition());
        node.setLevel(currentLevel);
        node.setParentEmpId(employee.getParentEmpId());
        
        // 如果未达到最大层级，继续查询下属
        if (currentLevel < maxDepth) {
            List<Employee> subordinates = employeeRepository.findByParentEmpId(employee.getEmpId());
            node.setChildren(subordinates.stream()
                .map(sub -> buildSubordinateTree(sub, currentLevel + 1, maxDepth))
                .collect(Collectors.toList()));
        }
        
        return node;
    }
}`;
}

/**
 * 生成Entity实体类代码
 */
export function generateEntity(config: SpringBootCodeConfig): string {
  const { packageName, author = 'System' } = config;

  return `package ${packageName}.entity;

import lombok.Data;
import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

/**
 * 员工实体类
 * @author ${author}
 */
@Data
@Entity
@Table(name = "t_employee")
public class Employee implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 员工ID
     */
    @Column(name = "emp_id", nullable = false, unique = true, length = 50)
    private String empId;

    /**
     * 员工姓名
     */
    @Column(name = "emp_name", nullable = false, length = 100)
    private String empName;

    /**
     * 员工编号
     */
    @Column(name = "emp_code", nullable = false, length = 50)
    private String empCode;

    /**
     * 部门ID
     */
    @Column(name = "dept_id", nullable = false, length = 50)
    private String deptId;

    /**
     * 部门名称
     */
    @Column(name = "dept_name", nullable = false, length = 100)
    private String deptName;

    /**
     * 职位
     */
    @Column(name = "position", length = 100)
    private String position;

    /**
     * 上级员工ID
     */
    @Column(name = "parent_emp_id", length = 50)
    private String parentEmpId;

    /**
     * 创建时间
     */
    @Column(name = "create_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createTime;

    /**
     * 更新时间
     */
    @Column(name = "update_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updateTime;
}`;
}

/**
 * 生成DTO代码 - 请求对象
 */
export function generateRequestDto(config: SpringBootCodeConfig): string {
  const { packageName, author = 'System' } = config;

  return `package ${packageName}.dto;

import lombok.Data;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import javax.validation.constraints.NotBlank;

/**
 * 查询员工树请求DTO
 * @author ${author}
 */
@Data
@ApiModel("查询员工树请求")
public class QueryEmpTreeRequest {

    /**
     * 员工ID
     */
    @ApiModelProperty(value = "员工ID", required = true, example = "EMP001")
    @NotBlank(message = "员工ID不能为空")
    private String empId;

    /**
     * 是否包含下属
     */
    @ApiModelProperty(value = "是否包含下属", example = "true")
    private Boolean includeSubordinates;

    /**
     * 查询最大层级
     */
    @ApiModelProperty(value = "查询最大层级", example = "3")
    private Integer maxDepth;
}`;
}

/**
 * 生成DTO代码 - 响应对象
 */
export function generateResponseDto(config: SpringBootCodeConfig): string {
  const { packageName, author = 'System' } = config;

  return `package ${packageName}.dto;

import lombok.Data;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.util.List;

/**
 * 查询员工树响应DTO
 * @author ${author}
 */
@Data
@ApiModel("查询员工树响应")
public class QueryEmpTreeResponse {

    /**
     * 状态码
     */
    @ApiModelProperty("状态码")
    private Integer code;

    /**
     * 消息
     */
    @ApiModelProperty("消息")
    private String message;

    /**
     * 员工树数据
     */
    @ApiModelProperty("员工树数据")
    private EmployeeTreeNode data;

    /**
     * 成功响应
     */
    public static QueryEmpTreeResponse success(EmployeeTreeNode data) {
        QueryEmpTreeResponse response = new QueryEmpTreeResponse();
        response.setCode(0);
        response.setMessage("查询成功");
        response.setData(data);
        return response;
    }

    /**
     * 错误响应
     */
    public static QueryEmpTreeResponse error(Integer code, String message) {
        QueryEmpTreeResponse response = new QueryEmpTreeResponse();
        response.setCode(code);
        response.setMessage(message);
        return response;
    }
}

/**
 * 员工树节点DTO
 */
@Data
@ApiModel("员工树节点")
class EmployeeTreeNode {

    @ApiModelProperty("员工ID")
    private String empId;

    @ApiModelProperty("员工姓名")
    private String empName;

    @ApiModelProperty("员工编号")
    private String empCode;

    @ApiModelProperty("部门ID")
    private String deptId;

    @ApiModelProperty("部门名称")
    private String deptName;

    @ApiModelProperty("职位")
    private String position;

    @ApiModelProperty("层级")
    private Integer level;

    @ApiModelProperty("上级员工ID")
    private String parentEmpId;

    @ApiModelProperty("下属员工列表")
    private List<EmployeeTreeNode> children;
}`;
}

/**
 * 生成Repository接口代码
 */
export function generateRepository(config: SpringBootCodeConfig): string {
  const { packageName, author = 'System' } = config;

  return `package ${packageName}.repository;

import ${packageName}.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 员工Repository接口
 * @author ${author}
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * 根据员工ID查询
     * @param empId 员工ID
     * @return 员工信息
     */
    Employee findByEmpId(String empId);

    /**
     * 根据上级员工ID查询下属列表
     * @param parentEmpId 上级员工ID
     * @return 下属员工列表
     */
    List<Employee> findByParentEmpId(String parentEmpId);

    /**
     * 根据部门ID查询员工列表
     * @param deptId 部门ID
     * @return 员工列表
     */
    List<Employee> findByDeptId(String deptId);
}`;
}

/**
 * 生成完整的Spring Boot代码包
 */
export function generateSpringBootCode(config: SpringBootCodeConfig): Record<string, string> {
  const codeMap: Record<string, string> = {};

  if (config.generateController !== false) {
    codeMap['Controller'] = generateController(config);
  }

  if (config.generateService !== false) {
    codeMap['ServiceInterface'] = generateServiceInterface(config);
    codeMap['ServiceImpl'] = generateServiceImpl(config);
  }

  if (config.generateEntity !== false) {
    codeMap['Entity'] = generateEntity(config);
  }

  if (config.generateDto !== false) {
    codeMap['RequestDto'] = generateRequestDto(config);
    codeMap['ResponseDto'] = generateResponseDto(config);
  }

  if (config.generateRepository !== false) {
    codeMap['Repository'] = generateRepository(config);
  }

  return codeMap;
}
