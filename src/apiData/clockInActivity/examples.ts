/**
 * 消费打卡API接口示例数据
 */
import {
  ChannelPageResponse,
  ClockInResponse,
  ChannelPageRequest,
  ClockInRequest,
} from './types.js';

// 频道页请求示例
export const channelPageRequestExample: ChannelPageRequest = {
  storeId: '1001',
};

// 频道页响应示例
export const channelPageResponseExample: ChannelPageResponse = {
  bgImg:
    'http://img.beta1.fn/pic/7ee2134710b418d0cfad/h262TT5T_nfdBlZdVT/1ioyoRXygaf9Qy/Csq5Zl_YYz6AK8PFAAAzQtewj_k520.jpg',
  activityRule: 'http://XXX',
  activityTime: '活动时间：12/1 15:21:21-12/10 00:00:00',
  activityId: 'activity_001',
  clockInList: [
    {
      imgUrl:
        'http://img.beta1.fn/pic/c5d21347107320c60215/Bn82TTs2FTflBdUdUn/5xoGoR3yMatiJa/Csq5Zl_YYz6AK8PFAAAzQtewj_k520.jpg',
      status: 1,
      title: '第1次',
      tag: '惊喜加赠',
      desc: '成功打卡可获得【XXX】,并且额外获得【YYY】',
    },
  ],
  activityTips: '活动时间内每次打卡可获得xx',
  activityLeftTime: 3,
  imgList: [
    {
      imgUrl:
        'http://img.beta1.fn/pic/c5d21347107320c60215/Bn82TTs2FTflBdUdUn/5xoGoR3yMatiJa/Csq5Zl_YYz6AK8PFAAAzQtewj_k520.jpg',
      linkUrl: 'fnfresh://xxx',
    },
  ],
  share: {
    image: 'http://xxx',
    content: '消费后打卡，惊喜好礼等您领~',
    smallTalkId: 'xxx',
    smallTalkPath: '/pkg-activity/pages/xxx',
  },
};

// 打卡接口请求示例
export const clockInRequestExample: ClockInRequest = {
  storeId: '1001',
  activityId: 'activity_001',
};

// 打卡接口响应示例
export const clockInResponseExample: ClockInResponse = {
  tips: '恭喜获得【XXX】，并且额外获得【YYY】，请稍后至优惠卡券列表查看',
};
