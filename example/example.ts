// import { BilibiliClient } from "../src/BilibiliClient";
// import {LiveClient} from "../src/live/websocket/LiveClient";
// import {DanmakuMessage} from "../src/live/websocket/Parser";

import {LiveClient, BilibiliClient, DanmakuMessage} from 'bili-live-danmaku'
async function main() {
  const bilibiliClient = new BilibiliClient()
  bilibiliClient.loginResponse = 'true'
  const liveClient = new LiveClient(bilibiliClient, 3)
  liveClient.onClose = reason => {
    console.log('')
    console.log('Closed: ')
    console.log(reason.message)
  }
  liveClient.onConnect = () => {
    console.log('connected')
  }
  liveClient.onPopularityPacket = popularity => {
    console.log(`人气值: ${popularity}`)
  }
  liveClient.onCommandPacket = command => {
    if (command.cmd == 'DANMU_MSG') {
      const dmk = new DanmakuMessage(command)
      const outs = `${
        dmk.hasFansMedal ? `[${dmk.fansMedalName} ${dmk.fansMedalLevel}] ` : ''
      } ${dmk.nickname}: ${dmk.message}`
      console.log(outs)
    }
  }
  await liveClient.launch()
}

main()
