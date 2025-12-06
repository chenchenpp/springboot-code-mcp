# POM依赖注入工具使用指南

## 功能概述

POM依赖注入工具可以帮助你快速向Spring Boot项目的pom.xml文件中添加Maven依赖，特别是SSO和Feign等常用依赖。

## 核心功能

### 1. 注入预定义依赖

支持快速注入以下预定义依赖：

#### SSO依赖
```xml
<dependency>
  <groupId>com.feiniu</groupId>
  <artifactId>ssospring</artifactId>
  <version>1.0.0-SNAPSHOT</version>
</dependency>
```

**用途**: 单点登录认证

**使用示例**:
```java
import com.feiniu.sso.SsoAuth;

@Autowired
private SsoAuth ssoAuth;

public String getEmployeeId(String token) {
    String empId = ssoAuth.authLogined(token);
    return empId;
}
```

#### Feign依赖
```xml
<dependency>
  <groupId>com.feiniu.fnemp</groupId>
  <artifactId>fnemp-apiclient</artifactId>
  <version>1.2.4-SNAPSHOT</version>
</dependency>
```

**用途**: 微服务间HTTP调用

**使用示例**:
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

### 2. 注入自定义依赖

支持注入任意Maven依赖，只需提供groupId、artifactId和version。

### 3. 智能检测

- 自动检测依赖是否已存在
- 避免重复注入
- 保持pom.xml格式整洁

## 使用方法

### 方法1: 注入SSO依赖

**命令**:
```
请向./pom.xml文件中注入SSO依赖
```

**或者**:
```
请帮我在项目的pom.xml中添加SSO认证依赖
```

### 方法2: 注入Feign依赖

**命令**:
```
请向./pom.xml文件中注入Feign依赖
```

### 方法3: 同时注入SSO和Feign

**命令**:
```
请向./pom.xml文件中注入SSO和Feign依赖
```

**或者**:
```
请在pom.xml中添加SSO和Feign的依赖
```

### 方法4: 注入自定义依赖

**命令**:
```
请向./pom.xml文件中注入依赖：
groupId为org.springframework.boot
artifactId为spring-boot-starter-redis
版本为2.7.0
```

### 方法5: 查看预定义依赖

**命令**:
```
请列出所有预定义的Maven依赖
```

**或者**:
```
有哪些可用的预定义依赖？
```

## 工具返回信息

### 成功注入示例

```
成功处理pom.xml文件：/path/to/pom.xml

✅ 已注入的依赖 (2):
  - com.feiniu:ssospring
  - com.feiniu.fnemp:fnemp-apiclient

📝 下一步操作:
  1. 执行 mvn clean install 更新依赖
  2. 刷新IDE项目

=== SSO使用示例 ===
[代码示例...]

=== Feign使用示例 ===
[代码示例...]
```

### 依赖已存在示例

```
成功处理pom.xml文件：/path/to/pom.xml

⏭️  已存在跳过的依赖 (1):
  - com.feiniu:ssospring

✅ 已注入的依赖 (1):
  - com.feiniu.fnemp:fnemp-apiclient
```

## 注意事项

1. **文件路径**: 确保提供正确的pom.xml文件路径
2. **备份建议**: 首次使用建议先备份pom.xml文件
3. **格式要求**: pom.xml必须包含`<dependencies></dependencies>`标签
4. **更新依赖**: 注入后需要执行`mvn clean install`来下载新依赖
5. **IDE刷新**: 注入后需要刷新IDE项目以识别新依赖

## 常见问题

### Q1: 如何指定pom.xml的路径？

A: 可以使用相对路径或绝对路径：
- 相对路径: `./pom.xml` 或 `pom.xml`
- 绝对路径: `/Users/username/project/pom.xml`

### Q2: 依赖注入后不生效怎么办？

A: 按以下步骤操作：
1. 执行 `mvn clean install`
2. 在IDE中刷新Maven项目（IDEA: 右键项目 -> Maven -> Reload Project）
3. 检查Maven仓库配置是否正确

### Q3: 可以修改依赖版本吗？

A: 可以，使用自定义依赖注入功能，指定你需要的版本号。

### Q4: 如何批量注入多个依赖？

A: 对于预定义依赖，使用`dependencyTypes: ['BOTH']`参数。对于自定义依赖，可以多次调用工具。

### Q5: 工具会覆盖已有依赖吗？

A: 不会。工具会自动检测依赖是否已存在，已存在的依赖会被跳过。

## 技术实现

- **语言**: TypeScript
- **框架**: MCP (Model Context Protocol)
- **验证**: Zod schema validation
- **文件操作**: Node.js fs模块
- **XML处理**: 字符串匹配和插入

## 扩展性

如需添加新的预定义依赖，可以在以下文件中配置：
- `src/apiData/pomDependency/predefined.ts` - 添加依赖定义
- `src/tools/pomDependency.ts` - 更新工具逻辑

## 示例项目

项目中包含了一个示例pom.xml文件（`example-pom.xml`），你可以用它来测试工具功能：

```bash
# 测试注入SSO依赖
请向./example-pom.xml文件中注入SSO依赖
```

## 总结

POM依赖注入工具让Maven依赖管理变得简单高效：
- ✅ 快速注入常用依赖
- ✅ 智能检测避免重复
- ✅ 提供使用示例代码
- ✅ 支持自定义依赖
- ✅ 保持文件格式整洁

开始使用吧！🚀
