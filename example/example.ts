import { BilibiliClient, DanmakuMessage, LiveClient } from '../src';

// import {LiveClient, BilibiliClient, DanmakuMessage} from 'bili-live-danmaku'
async function main() {
  const bilibiliClient = new BilibiliClient();
  bilibiliClient.loginResponse = 'true';
  const liveClient = new LiveClient(bilibiliClient, 102);
  liveClient.onClose = (reason) => {
    console.log('');
    console.log('Closed: ');
    console.log(reason.message);
  };
  liveClient.onConnect = () => {
    console.log('connected');
  };
  liveClient.onPopularityPacket = (popularity) => {
    console.log(`人气值: ${popularity}`);
  };
  liveClient.onCommandPacket = (command) => {
    if (command.cmd === 'DANMU_MSG') {
      const dmk = new DanmakuMessage(command);
      const outs
      = `${dmk.hasFansMedal ? `[${dmk.fansMedalName} ${dmk.fansMedalLevel}] ` : ''} ${dmk.nickname}: ${dmk.message}`;
      console.log(outs);
    }
  };
  await liveClient.launch();
}

main();
