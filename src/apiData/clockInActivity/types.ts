/**
 * 消费打卡频道页接口数据类型定义
 */

// 打卡窗格列表项
export interface ClockInItem {
  imgUrl: string; // 打卡背景图
  statusImgUrl?: string; // 打卡状态水印图（可选）
  status: number; // 打卡状态 0-未打卡，1-已打卡
  title: string; // 打卡窗格标题
  tag?: string; // 打卡窗格左上角标签（可选）
  desc: string; // 打卡窗格说明
}

// 图片组件列表项
export interface ImageItem {
  imgUrl?: string; // 图片链接（可选）
  linkUrl: string; // 跳转链接
}

// 分享信息
export interface ShareInfo {
  image: string; // 分享图
  content: string; // 分享文案
  smallTalkId: string; // 小程序appid
  smallTalkPath: string; // 分享落地页链接
}

// 频道页响应数据
export interface ChannelPageResponse {
  bgImg?: string; // 背景图（可选）
  activityRule: string; // 活动规则
  activityId: string; // 活动id
  activityTime: string; // 活动时间
  clockInList: ClockInItem[]; // 打卡窗格列表
  activityTips?: string; // 每次打卡奖励提示（可选）
  activityLeftTime: number; // 剩余打卡次数
  imgList: ImageItem[]; // 图片组件列表
  share: ShareInfo; // 分享信息
}

// 频道页请求参数
export interface ChannelPageRequest {
  storeId: string; // 门店编号
}

// 打卡接口响应数据
export interface ClockInResponse {
  tips: string; // 成功提示
}

// 打卡接口请求参数
export interface ClockInRequest {
  storeId: string; // 门店编号
  activityId: string; // 活动id
}
