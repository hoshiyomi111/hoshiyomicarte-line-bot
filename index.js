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

// ============================================================
// 星読みカルテ システムプロンプト（Claude API連携用）
// ============================================================
const SYSTEM_PROMPT = `
【あなたの存在定義】
あなたは年間売上1億円を超える占星術師です。
クライアントの9割がリピーターになる理由はただ一つ——「初めて自分のことを本当に理解してもらえた」という体験を届けるからです。
人類が何千年もかけて積み重ねてきた人間観察の記号体系——占星術——を使い、目の前の人が「なぜ自分はこうなのか」を腑に落とすための鏡となります。
予言者でも宗教家でもなく、人間の構造を言語化する天才です。
【絶対ルール】断定的な予言をしない。不安を煽らない。弱点は「成長の余地」として表現する。基本トーン：「〜という傾向があります」。必ず【肯定→矛盾・逆説→問い】の順で構成する。
`;

// 7軸プロンプト（Claude API連携用）
const ANALYSIS_PROMPTS = {
  axis1:(n,z,b)=>`【軸1】幼少期の文脈デコーダー：${n}さん(${b}・${z})の幼少期に形成された根本的な気質を「〜という傾向があります」トーンで400字以内`,
  axis2:(n,z)=>`【軸2】性格進化の地図：${n}さん(${z})の内面の矛盾・逆説を言語化。「これは〜の問題ではなく〜という構造的な傾向です」と補足。300字以内`,
  axis3:(n,z)=>`【軸3】プロフェッショナル・コンパス：${n}さん(${z})の仕事・才能における強みとつまずきを言語化。「この才能があるから〜できる」という希望で終わる。300字以内`,
  axis4:(n,z,ms)=>`【軸4】関係パターン分析：${n}さんの月星座(${ms||'算出中'})から人間関係の傾向を言語化。太陽星座(${z})との内的葛藤も描写。350字以内`,
  axis5:(n,asc)=>`【軸5】隠れた闘争の検出器：${n}さんのアセンダント(${asc||'出生時刻が必要'})から盲点と他者印象を言語化。300字以内`,
  axis6:(n,z)=>`【軸6】財務・意思決定マインドセット：${n}さん(${z})のお金・リスク・決断における才能を言語化。「これがあるからあなたの人生は〜になれる」で終わる。300字以内`,
  axis7:(n,b,t)=>`【軸7】人生のロードマップ：${n}さん(${b})の今この時期(${t})のテーマを言語化。「今のあなたに問いかけたいのは〜」で終わる。300字以内`,
};

const MSG = {
  welcome:()=>`✨ 星読みカルテへようこそ🌙\n\nあなたの生年月日から、\n「なぜ自分はこうなのか」を言語化します。\n\nホロスコープなし。タロットなし。\nただ純粋な星の記号体系で。\n\nまずはお名前またはニックネームを教えてください😊`,
  askBirthday:(name)=>`${name}さん、ありがとうございます🌟\n\n次に生年月日を教えてください。\n\n例：1997/10/06`,
  askTime:(label)=>`${label} ですね🌙\n\n出生時間帯がわかれば、より深く読み解けます。\nわからない場合はスキップでも大丈夫です。`,
  askBirthplace:`出生地を教えてください🗾\n（例：東京、石川県）\nわからない場合はスキップでも大丈夫です。`,
  confirm:(s)=>{const d=s.birthday;return `📋 入力内容の確認\n\nお名前：${s.name}\n生年月日：${d.year}/${pad(d.month)}/${pad(d.day)}（${s.zodiac}）\n時間帯：${s.timeOfDay}\n出生地：${s.birthplace}\n\nこの内容で送信しますか？`;},
  done:(name)=>`${name}さん、ありがとうございます🌙\n\n星読みカルテを丁寧に鑑定します✨\n\n通常2〜3日以内にこちらからメッセージをお送りします🔮\n\n楽しみに待っていてください🌟`,
  invalidName:`1〜20文字でお名前を入力してください😊`,
  invalidBirthday:`生年月日の形式が違います💦\n\n例：1997/10/06 や 19971006 のように入力してください`,
};

app.post('/webhook', line.middleware(config), async (req, res) => {
  res.sendStatus(200);
  await Promise.all(req.body.events.map(handleEvent));
});
app.get('/', (_, res) => res.send('星読みカルテ LINE Bot 稼働中🌙'));

async function handleEvent(event) {
  if (event.type === 'follow') { await sendWelcome(event.source.userId); return; }
  if (event.type !== 'message' || event.message.type !== 'text') return;
  const userId = event.source.userId;
  const text = event.message.text.trim();
  const session = sessions.get(userId) || { step: null };
  if (!session.step || session.step === STEPS.DONE) {
    if (/診断|スタート|start|始め|はじめ|鑑定/i.test(text)) await sendWelcome(userId);
    return;
  }
  await handleStep(userId, text, session);
}

async function handleStep(userId, text, session) {
  switch (session.step) {
    case STEPS.NAME:
      if (!text || text.length > 20) { await push(userId, MSG.invalidName); break; }
      session.name = text; session.step = STEPS.BIRTHDAY; sessions.set(userId, session);
      await push(userId, MSG.askBirthday(text)); break;
    case STEPS.BIRTHDAY:
      const date = parseBirthday(text);
      if (!date) { await push(userId, MSG.invalidBirthday); break; }
      session.birthday = date; session.zodiac = getZodiac(date.month, date.day);
      session.step = STEPS.TIMEOF; sessions.set(userId, session);
      await pushQR(userId, MSG.askTime(`${date.year}年${date.month}月${date.day}日 / ${session.zodiac}`), [
        {label:'🌅 朝（6〜12時）',text:'朝'},{label:'☀️ 昼（12〜18時）',text:'昼'},
        {label:'🌙 夜（18〜24時）',text:'夜'},{label:'🌃 深夜（0〜6時）',text:'深夜'},
        {label:'わからない',text:'わからない'},{label:'スキップ',text:'スキップ'}]); break;
    case STEPS.TIMEOF:
      session.timeOfDay = ['朝','昼','夜','深夜','わからない','スキップ'].includes(text) ? text : 'スキップ';
      session.step = STEPS.BIRTHPLACE; sessions.set(userId, session);
      await pushQR(userId, MSG.askBirthplace, [{label:'スキップ',text:'スキップ'}]); break;
    case STEPS.BIRTHPLACE:
      session.birthplace = text; session.step = STEPS.CONFIRM; sessions.set(userId, session);
      await pushQR(userId, MSG.confirm(session), [
        {label:'✓ 送信する',text:'送信する'},{label:'✏️ やり直す',text:'やり直す'}]); break;
    case STEPS.CONFIRM:
      if (text === '送信する') {
        session.step = STEPS.DONE; sessions.set(userId, session);
        await push(userId, MSG.done(session.name));
        if (ADMIN_ID) {
          const d = session.birthday;
          const today = new Date().toLocaleDateString('ja-JP');
          await client.pushMessage(ADMIN_ID, {type:'text', text:
            `📋 新しい診断申込\n──────────────\n名前：${session.name}\n生年月日：${d.year}/${pad(d.month)}/${pad(d.day)}\n星座：${session.zodiac}\n時間帯：${session.timeOfDay}\n出生地：${session.birthplace}\n申込日：${today}\n──────────────`});
        }
      } else { sessions.delete(userId); await sendWelcome(userId); }
      break;
  }
}

async function sendWelcome(userId) { sessions.set(userId, {step:STEPS.NAME}); await push(userId, MSG.welcome()); }
async function push(userId, text) { return client.pushMessage(userId, {type:'text', text}); }
async function pushQR(userId, text, buttons) {
  return client.pushMessage(userId, {type:'text', text, quickReply:{items:buttons.map(b=>({type:'action',action:{type:'message',label:b.label,text:b.text}}))}});
}
function parseBirthday(text) {
  const c = text.replace(/[年月\/\-\.]/g,'/').replace(/日/g,'');
  const p = c.split('/').filter(Boolean); let y,m,d;
  if (p.length===3){[y,m,d]=p.map(Number);} else if(/^\d{8}$/.test(c)){y=+c.slice(0,4);m=+c.slice(4,6);d=+c.slice(6,8);} else return null;
  if(!y||y<1900||y>2020||!m||m<1||m>12||!d||d<1||d>31) return null;
  return {year:y,month:m,day:d};
}
function getZodiac(m,d) {
  const s=[[[3,21],[4,19],'牡羊座'],[[4,20],[5,20],'牡牛座'],[[5,21],[6,21],'双子座'],[[6,22],[7,22],'蟹座'],[[7,23],[8,22],'獅子座'],[[8,23],[9,22],'乙女座'],[[9,23],[10,23],'天秤座'],[[10,24],[11,22],'蠍座'],[[11,23],[12,21],'射手座'],[[12,22],[1,19],'山羊座'],[[1,20],[2,18],'水瓶座'],[[2,19],[3,20],'魚座']];
  for(const [[sm,sd],[em,ed],n] of s){if((m===sm&&d>=sd)||(m===em&&d<=ed)) return n;} return '山羊座';
}
function pad(n){return String(n).padStart(2,'0');}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🌙 星読みカルテ Bot起動 port:' + PORT));
