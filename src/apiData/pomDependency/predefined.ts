/**
 * 预定义的Maven依赖
 */
import { MavenDependency } from './types.js';

// SSO依赖
export const SSO_DEPENDENCY: MavenDependency = {
  groupId: 'com.feiniu',
  artifactId: 'ssospring',
  version: '1.0.0-SNAPSHOT',
};

// Feign依赖
export const FEIGN_DEPENDENCY: MavenDependency = {
  groupId: 'com.feiniu.fnemp',
  artifactId: 'fnemp-apiclient',
  version: '1.2.4-SNAPSHOT',
};

// 常用依赖集合
export const COMMON_DEPENDENCIES = {
  SSO: SSO_DEPENDENCY,
  FEIGN: FEIGN_DEPENDENCY,
};
