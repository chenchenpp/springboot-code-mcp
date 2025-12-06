<!--
 * @Author: peng.chen2 peng.chen2@rt-mart.com
 * @Date: 2025-12-06 15:17:00
 * @LastEditors: peng.chen2 peng.chen2@rt-mart.com
 * @LastEditTime: 2025-12-06 15:17:54
 * @FilePath: /rt-api-mcp/src/apiData/pomDependency/docs.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# POM依赖注入工具说明

## 功能描述

本工具用于向Spring Boot项目的pom.xml文件中注入Maven依赖，支持SSO、Feign等常用依赖的快速注入。

## 预定义依赖

### 1. SSO依赖

用于单点登录认证功能。

```xml
<dependency>
  <groupId>com.feiniu</groupId>
  <artifactId>ssospring</artifactId>
  <version>1.0.0-SNAPSHOT</version>
</dependency>
```

**使用示例：**
```java
import com.feiniu.sso.SsoAuth;

@Autowired
private SsoAuth ssoAuth;

public String getEmployeeId(String token) {
    String empId = ssoAuth.authLogined(token);
    return empId;
}
```

### 2. Feign依赖

用于微服务间的HTTP调用。

```xml
<dependency>
  <groupId>com.feiniu.fnemp</groupId>
  <artifactId>fnemp-apiclient</artifactId>
  <version>1.2.4-SNAPSHOT</version>
</dependency>
```

**使用示例：**
```java
import com.feiniu.fnemp.api.EmployeeApi;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## 工具特性

1. **智能检测**: 自动检测依赖是否已存在，避免重复注入
2. **批量注入**: 支持一次性注入多个依赖
3. **格式保持**: 保持原有pom.xml的格式和缩进
4. **安全操作**: 注入前会验证pom.xml格式的正确性
5. **详细反馈**: 返回注入成功和跳过的依赖列表

## 使用场景

- 新项目初始化时快速添加常用依赖
- 为现有项目添加SSO认证功能
- 为现有项目添加Feign微服务调用能力
- 批量管理项目依赖

## 注意事项

1. 使用前请确保pom.xml文件格式正确
2. 建议在注入前备份pom.xml文件
3. 注入后需要执行 `mvn clean install` 更新依赖
4. 版本号可能需要根据实际情况调整
