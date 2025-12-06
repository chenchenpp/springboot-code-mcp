# 消费打卡API接口说明

## 接口列表

### 1. 消费打卡频道页

**接口描述**: 线上打卡频道页

**Path**: `/clockInActivity/channelPage/{version}`

#### 请求参数

| 参数名 | 是否必须 | 类型 | 说明 |
|--------|----------|------|------|
| storeId | 是 | String | 门店编号 |

#### 响应参数

| 属性 | 类型 | 是否必有字段 | 说明 |
|------|------|--------------|------|
| bgImg | String | 否 | 背景图 |
| activityRule | String | 是 | 活动规则 |
| activityId | String | 是 | 活动id |
| activityTime | String | 是 | 活动时间 |
| clockInList | List<Object> | 是 | 打卡窗格列表 |
| -imgUrl | String | 是 | 打卡背景图 |
| -statusImgUrl | String | 是 | 打卡状态水印图 |
| -status | Int | 是 | 打卡状态0-未打卡，1-已打卡 |
| -title | String | 是 | 打卡窗格标题 |
| -tag | String | 否 | 打卡窗格左上角标签 |
| -desc | String | 是 | 打卡窗格说明 |
| activityTips | String | 否 | 每次打卡奖励提示 |
| activityLeftTime | Int | 是 | 剩余打卡次数 |
| imgList | List<Object> | 是 | 图片组件列表 |
| -linkUrl | String | 是 | 跳转链接 |
| -imgUrl | String | 否 | 图片链接 |
| share | Object | 是 | 分享信息 |
| -image | String | 是 | 分享图 |
| -content | String | 是 | 分享文案 |
| -smallTalkId | String | 是 | 小程序appid |
| -smallTalkPath | String | 是 | 分享落地页链接 |

### 2. 打卡接口

**接口描述**: 线上打卡接口

**Path**: `/clockInActivity/clockIn/{version}`

#### 请求参数

| 参数名 | 是否必须 | 类型 | 说明 |
|--------|----------|------|------|
| storeId | 是 | String | 门店编号 |
| activityId | 是 | String | 活动id |

#### 响应参数

| 属性 | 类型 | 是否必有字段 | 说明 |
|------|------|--------------|------|
| tips | String | 是 | 成功提示，打卡成功返回 |

## 特殊状态码及消息说明

### 频道页接口

| 状态码 | 消息 | 场景 |
|--------|------|------|
| 0 | 成功 |  |
| 8001 | 无活动，展示容错页 |  |

### 打卡接口

| 状态码 | 消息 | 场景 |
|--------|------|------|
| 0 | 打卡成功 | toast tips |
| 1000 | 打卡失败 | toast errorDesc |

## Host定义

| 环境 | 地址 |
|------|------|
| beta | http://member-yxapp.beta1.fn |
| preview | https://preview-member-yxapp.feiniu.com |
| online | https://member-yxapp.feiniu.com |