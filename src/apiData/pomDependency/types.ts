/**
 * POM依赖注入相关类型定义
 */

// Maven依赖定义
export interface MavenDependency {
  groupId: string;
  artifactId: string;
  version: string;
  scope?: string;
  type?: string;
}

// 依赖注入请求参数
export interface InjectDependencyRequest {
  pomFilePath: string; // pom.xml文件路径
  dependencies: MavenDependency[]; // 要注入的依赖列表
}

// 依赖注入响应
export interface InjectDependencyResponse {
  success: boolean;
  message: string;
  injectedDependencies: string[]; // 已注入的依赖
  skippedDependencies: string[]; // 已存在跳过的依赖
}

// 预定义的依赖类型
export enum DependencyType {
  SSO = 'SSO',
  FEIGN = 'FEIGN',
  CUSTOM = 'CUSTOM',
}
