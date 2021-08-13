/**
 * 用于解析DANMU_MSG的工具类
 */
export class DanmakuMessage {
  constructor(public data: any) { }

  get info(): any[] {
    return this.data.info
  }

  get basicInfo(): any[] {
    return this.info[0]
  }

  get pool(): number {
    return this.basicInfo[0]
  }

  /**
   * 弹幕模式
   * (1从右至左滚动弹幕|6从左至右滚动弹幕|5顶端固定弹幕|4底端固定弹幕|7高级弹幕|8脚本弹幕)
   */
  get mode(): number {
    return this.basicInfo[1]
  }

  get fontSize(): number {
    return this.basicInfo[2]
  }

  get color(): number {
    return this.basicInfo[3]
  }

  /** 发送时间 */
  get timestamp(): number {
    return this.basicInfo[4]
  }

  /** 进入直播间时间(若来自Android客户端，则为随机数) */
  get enterRoomTime(): number {
    return this.basicInfo[5]
  }

  /** 用户ID的CRC32校验和(不需要用此字段来得到用户 ID) */
  get userIdCrc32(): string {
    return this.basicInfo[7]
  }

  /** 内容 */
  get message(): string {
    return this.info[1]
  }

  get userInfo(): any[] {
    return this.info[2]
  }

  get userId(): number {
    return this.userInfo[0]
  }

  get nickname(): string {
    return this.userInfo[1]
  }

  get isAdmin(): number {
    return this.userInfo[2]
  }

  get isVip(): number {
    return this.userInfo[3]
  }

  get isSVip(): number {
    return this.userInfo[4]
  }

  /**
   * 粉丝勋章信息
   * 注意, 如果弹幕发送者没有佩戴勋章则该字段为一个空 JsonArray
   * 未佩戴粉丝勋章时, 下面几个字段都会返回 null
   */
  get fansMedalInfo(): any[] {
    return this.info[3]
  }

  get hasFansMedal(): boolean {
    return this.fansMedalInfo.length > 0
  }

  get fansMedalLevel(): number | undefined {
    return this.hasFansMedal ? this.fansMedalInfo[0] : undefined
  }

  get fansMedalName(): string | undefined {
    return this.hasFansMedal ? this.fansMedalInfo[1] : undefined
  }

  /** 粉丝勋章对应主播用户名 */
  get fansMedalAnchorNickName(): string | undefined {
    return this.hasFansMedal ? this.fansMedalInfo[2] : undefined
  }

  /** 粉丝勋章对应主播直播间号码 */
  get fansMedalAnchorRoomId(): number | undefined {
    return this.hasFansMedal ? this.fansMedalInfo[3] : undefined
  }

  /** 粉丝勋章背景颜色 */
  get fansMedalBackgroundColor(): number | undefined {
    return this.hasFansMedal ? this.fansMedalInfo[4] : undefined
  }

  get userLevelInfo(): any[] {
    return this.info[4]
  }

  /**
   * UL, 发送者的用户等级, 非主播等级
   */
  get userLevel(): number {
    return this.userLevelInfo[0]
  }

  /**
   * 用户等级标识的边框的颜色, 通常为最后一个佩戴的粉丝勋章的颜色
   */
  get userLevelBorderColor(): number {
    return this.userLevelInfo[2]
  }
  /**
   * 用户排名, 可能为数字, 也可能是 ">50000"
   */
  get userRank(): string {
    return this.userLevelInfo[3]
  }

  /**
   * 用户头衔
   * 可能为空列表, 也可能是值为 "" 的列表
   * 可能有两项, 两项的值可能一样
   */
  get userTitles(): string[] {
    return this.info[5]
  }

  /**
   * 校验信息
   * {
   *  "ts": 1553368447,
   *  "ct": "98688F2F"
   * }
   */
  get checkInfo(): any {
    return this.info[9]
  }
}
