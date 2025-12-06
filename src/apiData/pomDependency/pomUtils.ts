/**
 * POM文件操作工具类
 */
import { MavenDependency } from './types.js';

/**
 * 生成依赖XML字符串
 */
export function generateDependencyXml(dependency: MavenDependency): string {
  let xml = '    <dependency>\n';
  xml += `      <groupId>${dependency.groupId}</groupId>\n`;
  xml += `      <artifactId>${dependency.artifactId}</artifactId>\n`;
  xml += `      <version>${dependency.version}</version>\n`;
  
  if (dependency.scope) {
    xml += `      <scope>${dependency.scope}</scope>\n`;
  }
  
  if (dependency.type) {
    xml += `      <type>${dependency.type}</type>\n`;
  }
  
  xml += '    </dependency>';
  
  return xml;
}

/**
 * 检查依赖是否已存在
 */
export function isDependencyExists(
  pomContent: string,
  dependency: MavenDependency,
): boolean {
  const groupIdPattern = `<groupId>${dependency.groupId}</groupId>`;
  const artifactIdPattern = `<artifactId>${dependency.artifactId}</artifactId>`;
  
  // 简单检查：如果groupId和artifactId都存在，认为依赖已存在
  return pomContent.includes(groupIdPattern) && pomContent.includes(artifactIdPattern);
}

/**
 * 注入依赖到POM文件内容
 */
export function injectDependencies(
  pomContent: string,
  dependencies: MavenDependency[],
): {
  updatedContent: string;
  injected: string[];
  skipped: string[];
} {
  const injected: string[] = [];
  const skipped: string[] = [];
  let updatedContent = pomContent;

  // 查找 </dependencies> 标签位置
  const dependenciesEndTag = '</dependencies>';
  const dependenciesEndIndex = updatedContent.indexOf(dependenciesEndTag);

  if (dependenciesEndIndex === -1) {
    throw new Error('未找到 </dependencies> 标签，请确保pom.xml格式正确');
  }

  // 收集要注入的依赖XML
  const dependenciesToInject: string[] = [];

  for (const dependency of dependencies) {
    const dependencyKey = `${dependency.groupId}:${dependency.artifactId}`;
    
    if (isDependencyExists(updatedContent, dependency)) {
      skipped.push(dependencyKey);
      continue;
    }

    const dependencyXml = generateDependencyXml(dependency);
    dependenciesToInject.push(dependencyXml);
    injected.push(dependencyKey);
  }

  // 如果有需要注入的依赖，插入到 </dependencies> 之前
  if (dependenciesToInject.length > 0) {
    const injectContent = '\n' + dependenciesToInject.join('\n\n') + '\n  ';
    updatedContent =
      updatedContent.slice(0, dependenciesEndIndex) +
      injectContent +
      updatedContent.slice(dependenciesEndIndex);
  }

  return {
    updatedContent,
    injected,
    skipped,
  };
}

/**
 * 生成SSO使用示例代码
 */
export function generateSsoUsageExample(): string {
  return `// SSO使用示例
import com.feiniu.sso.SsoAuth;

@Autowired
private SsoAuth ssoAuth;

public String getEmployeeId(String token) {
    // 从token中获取员工ID
    String empId = ssoAuth.authLogined(token);
    return empId;
}`;
}

/**
 * 生成Feign使用示例代码
 */
export function generateFeignUsageExample(): string {
  return `// Feign使用示例
import com.feiniu.fnemp.api.EmployeeApi;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

@RestController
public class EmployeeController {
    
    @Autowired
    private EmployeeApi employeeApi;
    
    @GetMapping("/employee/{empId}")
    public Employee getEmployee(@PathVariable String empId) {
        return employeeApi.getEmployeeById(empId);
    }
}`;
}
