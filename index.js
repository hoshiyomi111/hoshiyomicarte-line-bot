require('dotenv').config();
const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const ADMIN_ID = process.env.ADMIN_LINE_USER_ID;
const app = express();
const client = new line.Client(config);
const sessions = new Map();
const STEPS = { NAME:'name', BIRTHDAY:'birthday', TIMEOF:'timeOfDay', BIRTHPLACE:'birthplace', CONFIRM:'confirm', DONE:'done' };

app.post('/webhook', line.middleware(config), async (req, res) => {
  res.sendStatus(200);
  await Promise.all(req.body.events.map(handleEvent));
});
app.get('/', (_, res) => res.send('星読みカルテ LINE Bot 稼働中'));

async function handleEvent(event) {
  if (event.type === 'follow') { await sendWelcome(event.source.userId); return; }
  if (event.type !== 'message' || event.message.type !== 'text') return;
  const userId = event.source.userId;
  const text = event.message.text.trim();
  const session = sessions.get(userId) || { step: null };
  if (!session.step || session.step === STEPS.DONE) {
    if (/診断|スタート|start|始め|はじめ/i.test(text)) await sendWelcome(userId);
    return;
  }
  await handleStep(userId, text, session);
}

async function handleStep(userId, text, session) {
  switch (session.step) {
    case STEPS.NAME:
      if (!text || text.length > 20) { await push(userId, '1〜20文字で入力してください'); break; }
      session.name = text; session.step = STEPS.BIRTHDAY; sessions.set(userId, session);
      await push(userId, text + 'さん、ありがとうございます！\n生年月日を教えてください（例：1997/10/06）');
      break;
    case STEPS.BIRTHDAY:
      const date = parseBirthday(text);
      if (!date) { await push(userId, '例：1997/10/06 の形式で入力してください'); break; }
      session.birthday = date; session.zodiac = getZodiac(date.month, date.day); session.step = STEPS.TIMEOF; sessions.set(userId, session);
      await pushQR(userId, date.year + '年' + date.month + '月' + date.day + '日（' + session.zodiac + '）\n出生時間帯は？', [
        {label:'🌅 朝',text:'朝'},{label:'☀️ 昼',text:'昼'},{label:'🌙 夜',text:'夜'},{label:'わからない',text:'わからない'},{label:'スキップ',text:'スキップ'}]);
      break;
    case STEPS.TIMEOF:
      session.timeOfDay = ['朝','昼','夜','わからない','スキップ'].includes(text) ? text : 'スキップ';
      session.step = STEPS.BIRTHPLACE; sessions.set(userId, session);
      await pushQR(userId, '出生地を教えてください（例：東京、石川県）', [{label:'スキップ',text:'スキップ'}]);
      break;
    case STEPS.BIRTHPLACE:
      session.birthplace = text; session.step = STEPS.CONFIRM; sessions.set(userId, session);
      const d = session.birthday;
      await pushQR(userId, '確認\nお名前：' + session.name + '\n生年月日：' + d.year + '/' + pad(d.month) + '/' + pad(d.day) + '（' + session.zodiac + '）\n時間帯：' + session.timeOfDay + '\n出生地：' + session.birthplace + '\n\nよろしいですか？',
        [{label:'✓ 送信する',text:'送信する'},{label:'✏️ やり直す',text:'やり直す'}]);
      break;
    case STEPS.CONFIRM:
      if (text === '送信する') {
        session.step = STEPS.DONE; sessions.set(userId, session);
        await push(userId, 'ありがとうございます🌙\n星読みカルテをお届けします。\n通常2〜3日以内にご連絡します🔮');
        if (ADMIN_ID) {
          const d = session.birthday;
          await client.pushMessage(ADMIN_ID, {type:'text', text:'📋 新しい診断申込\n名前：' + session.name + '\n生年月日：' + d.year + '/' + pad(d.month) + '/' + pad(d.day) + '\n星座：' + session.zodiac + '\n時間帯：' + session.timeOfDay + '\n出生地：' + session.birthplace});
        }
      } else { sessions.delete(userId); await sendWelcome(userId); }
      break;
  }
}

async function sendWelcome(userId) {
  sessions.set(userId, { step: STEPS.NAME });
  await push(userId, '✨ 星読みカルテへようこそ🌙\nお名前またはニックネームを教えてください😊');
}
async function push(userId, text) { return client.pushMessage(userId, {type:'text', text}); }
async function pushQR(userId, text, buttons) {
  return client.pushMessage(userId, {type:'text', text, quickReply:{items:buttons.map(b=>({type:'action',action:{type:'message',label:b.label,text:b.text}}))}});
}
function parseBirthday(text) {
  const c = text.replace(/[年月\/\-\.]/g,'/').replace(/日/g,'');
  const p = c.split('/').filter(Boolean);
  let y,m,d;
  if (p.length===3){[y,m,d]=p.map(Number);}
  else if(/^\d{8}$/.test(c)){y=+c.slice(0,4);m=+c.slice(4,6);d=+c.slice(6,8);}
  else return null;
  if(!y||y<1900||y>2020||!m||m<1||m>12||!d||d<1||d>31) return null;
  return {year:y,month:m,day:d};
}
function getZodiac(m,d) {
  const s=[[[3,21],[4,19],'牡羊座'],[[4,20],[5,20],'牡牛座'],[[5,21],[6,21],'双子座'],[[6,22],[7,22],'蟹座'],[[7,23],[8,22],'獅子座'],[[8,23],[9,22],'乙女座'],[[9,23],[10,23],'天秤座'],[[10,24],[11,22],'蠍座'],[[11,23],[12,21],'射手座'],[[12,22],[1,19],'山羊座'],[[1,20],[2,18],'水瓶座'],[[2,19],[3,20],'魚座']];
  for(const [[sm,sd],[em,ed],n] of s){if((m===sm&&d>=sd)||(m===em&&d<=ed)) return n;}
  return '山羊座';
}
function pad(n){return String(n).padStart(2,'0');}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot起動 port:' + PORT));
