const express = require('express');
const line = require('@line/bot-sdk');
const { getImprintLine } = require('./imprints');

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(config);
const app = express();
const sessions = {};

const URBAN_KEYWORDS = ['東京','大阪','名古屋','横浜','神戸','京都','福岡','札幌','仙台','広島','北九州','千葉','埼玉','川崎','相模原','新潟','浜松','岡山','静岡','熊本','堺','姫路','船橋','松山','東大阪','鹿児島','金沢','23区','市川','尼崎','西宮','高松','那覇','豊田','長野'];

function detectRegionType(birthplace) {
  if (!birthplace) return null;
  for (const k of URBAN_KEYWORDS) { if (birthplace.includes(k)) return 'urban'; }
  return 'rural';
}

function getZodiac(month, day) {
  if ((month===3&&day>=21)||(month===4&&day<=19)) return 'aries';
  if ((month===4&&day>=20)||(month===5&&day<=20)) return 'taurus';
  if ((month===5&&day>=21)||(month===6&&day<=21)) return 'gemini';
  if ((month===6&&day>=22)||(month===7&&day<=22)) return 'cancer';
  if ((month===7&&day>=23)||(month===8&&day<=22)) return 'leo';
  if ((month===8&&day>=23)||(month===9&&day<=22)) return 'virgo';
  if ((month===9&&day>=23)||(month===10&&day<=23)) return 'libra';
  if ((month===10&&day>=24)||(month===11&&day<=22)) return 'scorpio';
  if ((month===11&&day>=23)||(month===12&&day<=21)) return 'sagittarius';
  if ((month===12&&day>=22)||(month===1&&day<=19)) return 'capricorn';
  if ((month===1&&day>=20)||(month===2&&day<=18)) return 'aquarius';
  return 'pisces';
}

const ZODIAC_NAMES = {
  aries:'牡羊座', taurus:'牡牛座', gemini:'双子座', cancer:'蟹座',
  leo:'獅子座', virgo:'乙女座', libra:'天秤座', scorpio:'蠍座',
  sagittarius:'射手座', capricorn:'山羊座', aquarius:'水瓶座', pisces:'魚座'
};

// 数字だけ取り出してパース（/[0-9]+/ はバックスラッシュ不要で確実）
function parseBirthdate(text) {
  var nums = text.match(/[0-9]+/g);
  if (!nums || nums.length < 3) return null;
  if (nums[0].length === 4) return { year: +nums[0], month: +nums[1], day: +nums[2] };
  if (nums[2].length === 4) return { year: +nums[2], month: +nums[0], day: +nums[1] };
  return null;
}

function buildZodiacText(name, zodiac, birthYear, gender, regionType) {
  const imprintLine = getImprintLine(birthYear, gender, regionType);
  const ib = imprintLine ? '\n\n' + imprintLine : '';

  const T = {
    aries: name+'さんへ、星読みカルテからの診断です。\n\n【牡羊座の人間関係】\n「誰よりも早く動けるのに、誰よりも孤立しやすい人。」\n\nあなたは行動力と決断の速さで、自然とリーダーになっていく傾向があります。困っている人を見たら放っておけない、そのエネルギーで周りを引っ張る存在です。\n\nでも、その裏にこんな構造があります。あなたが「行動」を通じて愛情を表現するとき、相手は「一緒にいるだけでいい」と思っていることがある。あなたのペースについてこれない人を、無意識に「弱い」と感じてしまうことがある。これは意地悪ではなく、「愛＝動くこと」として刷り込まれた構造的な傾向です。\n\n人間関係でつまずくのは「もっと速く動けばよかった」ではなく、「もっと待てばよかった」という場面が多いかもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。「一緒にいるだけでいい」と思えた相手は、これまでいましたか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    taurus: name+'さんへ、星読みカルテからの診断です。\n\n【牡牛座の人間関係】\n「変わらないことで守っているはずが、変われないことで苦しんでいる人。」\n\nあなたは信頼と安心を何より大切にします。一度心を許した相手には深く、長く、誠実につながる。その安定感が、あなたの最大の強みです。\n\nでも、その裏にこんな構造があります。「変わらない」ことが自分を守る手段になっているとき、関係が変化しようとするサインを「裏切り」として受け取ってしまうことがある。これは頑固なのではなく、「変化＝喪失」として深く刷り込まれた構造的な傾向です。\n\n人間関係でつまずくのは「もっとしっかり守れればよかった」ではなく、「変化を一緒に楽しめればよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。「この関係は変わってほしくない」と思った瞬間、あなたは何を守ろうとしていましたか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    gemini: name+'さんへ、星読みカルテからの診断です。\n\n【双子座の人間関係】\n「誰とでも話せる人が、実は誰にも本当のことを話していない。」\n\nあなたは話題の引き出しが多く、どんな人とも自然に会話を作れる。その場の空気を読んで、相手に合わせた自分を出すことができる。これはれっきとした才能です。\n\nでも、その裏にこんな構造があります。「相手に合わせた自分」を出し続けるうちに、「本当の自分」がどこにあるかわからなくなることがある。たくさんの人と話しているのに、深くわかり合えている人が一人もいない気がする。これはコミュニケーション不足ではなく、「適応すること＝愛されること」という構造的な傾向です。\n\n人間関係でつまずくのは「もっとうまく話せればよかった」ではなく、「本当のことを言えればよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。最後に「本当のこと」を誰かに話したのは、いつでしたか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    cancer: name+'さんへ、星読みカルテからの診断です。\n\n【蟹座の人間関係】\n「誰かのために尽くすことが得意なのに、尽くせば尽くすほど孤独になっていく人。」\n\nあなたは察することが得意です。言葉にされる前に相手の気持ちを感じ取り、さりげなくフォローする。その繊細さで、あなたの周りには自然と人が集まってきます。\n\nでも、その裏にこんな構造があります。察することが得意なあなたは、「察してほしい」という欲求も同じくらい強い。でも、あなたほど察せる人はなかなかいない。最も得意なことを相手に求めてしまうから、いつも「わかってもらえない」という感覚が残る。これは相手の問題ではなく、構造的な傾向です。\n\n人間関係でつまずくのは「もっと尽くせばよかった」ではなく、「もっと求めてよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。最後に「助けて」と言えたのはいつでしたか？あなたが誰かに頼ることを、あなた自身は許していますか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    leo: name+'さんへ、星読みカルテからの診断です。\n\n【獅子座の人間関係】\n「認められることに慣れているはずが、認められることへの渇望が止まらない人。」\n\nあなたには場を温める力があります。存在するだけで場が明るくなる。誰かを喜ばせることに、純粋な喜びを感じられる。\n\nでも、その裏にこんな構造があります。「見てほしい」という気持ちと、「見られたくない弱い部分がある」という矛盾が同時に存在する。褒められることに慣れているのに、批判には誰より傷つく。これは自己中心的なのではなく、「承認＝安心」として刷り込まれた構造的な傾向です。\n\n人間関係でつまずくのは「もっと輝けばよかった」ではなく、「弱いところを見せられればよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。あなたの「かっこわるい部分」を知っていて、それでも好きでいてくれる人が、今そばにいますか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    virgo: name+'さんへ、星読みカルテからの診断です。\n\n【乙女座の人間関係】\n「完璧にサポートできるのに、サポートされることができない人。」\n\nあなたは細部まで気を配れます。相手が気づいていないことまで先回りして動く。その丁寧さと誠実さで、あなたは「頼りになる人」として信頼されてきました。\n\nでも、その裏にこんな構造があります。「完璧にやれないなら意味がない」という基準が、自分にも相手にも向いてしまうことがある。助けることは得意でも、助けてもらうことが苦手。これは完璧主義の問題ではなく、「貢献すること＝存在する理由」という構造的な傾向です。\n\n人間関係でつまずくのは「もっとうまくやればよかった」ではなく、「未完成な自分を見せられればよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。「できない」と誰かに言えたとき、どんな気持ちでしたか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    libra: name+'さんへ、星読みカルテからの診断です。\n\n【天秤座の人間関係】\n「誰とでもうまくやれる人が、実は誰ともつながれていないと感じている。」\n\nあなたは調和を作ることが得意です。その場の空気を読み、誰も傷つけないように言葉を選ぶ。そのバランス感覚で、あなたの周りには自然と人が集まります。\n\nでも、その裏にこんな構造があります。衝突を避けようとする行動が、かえって関係を表面的なものにしてしまうことがある。「本当のことを言ったら嫌われる」という恐れが、深い関係を自分から遠ざけている。これはコミュニケーションの問題ではなく、「衝突しないこと＝愛される」という構造的な傾向です。\n\n人間関係でつまずくのは「もっとうまく立ち回ればよかった」ではなく、「本音を言えればよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。最後に「嫌だ」と誰かに言えたのはいつでしたか？あなたの「NO」を、あなた自身は許していますか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    scorpio: name+'さんへ、星読みカルテからの診断です。\n\n【蠍座の人間関係】\n「誰よりも深くつながりたいのに、深くなればなるほど自分から距離を置く人。」\n\nあなたは人の本質を見抜く力があります。表面的な言葉の裏にある感情や動機を、直感的に感じ取れる。その深さで、あなたとつながった人は「本当にわかってもらえた」と感じます。\n\nでも、その裏にこんな構造があります。深くつながりたいという欲求と、傷つきたくないという防衛が、常に同時に存在している。近づけば近づくほど、自分から距離を置きたくなる。これは矛盾ではなく、「深さ＝危険」として学習した構造的な傾向です。\n\n人間関係でつまずくのは「もっと信頼すればよかった」という後悔を、信頼した後で感じることかもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。あなたが本当に心を開いた相手に、何があったのか。その経験は今のあなたにどんな影響を与えていますか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    sagittarius: name+'さんへ、星読みカルテからの診断です。\n\n【射手座の人間関係】\n「自由でいることで誰とでもいられるのに、自由すぎて誰とも深くいられない人。」\n\nあなたは可能性に向かって動くエネルギーがあります。新しい世界、新しい出会い、新しい視点。その開かれた姿勢で、あなたの周りには多様な人が集まります。\n\nでも、その裏にこんな構造があります。関係が深まって「縛られる」感覚が出てきたとき、自由のほうを選んでしまいやすい。でも実は、自由でいることへの執着が、深くつながることへの恐れを隠していることがある。これは薄情なのではなく、「深さ＝拘束」として刷り込まれた構造的な傾向です。\n\n人間関係でつまずくのは「もっと自由でいればよかった」ではなく、「もう少しそこに留まればよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。「ここにいてもいい」と思えた関係は、あなたの人生にありましたか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    capricorn: name+'さんへ、星読みカルテからの診断です。\n\n【山羊座の人間関係】\n「誰よりも責任を取れるのに、誰かに頼ることだけができない人。」\n\nあなたは長期的に物事を考える力があります。感情に流されず、地に足のついた判断ができる。その信頼性で、あなたは自然と「頼りにされる存在」になっていきます。\n\nでも、その裏にこんな構造があります。「しっかりしていなければ」という感覚が、弱さを見せることへの強いブレーキになっている。誰かに頼ることは「甘え」だという前提が、あなたを長期的に孤立させていくことがある。これは強さではなく、「頼らないこと＝価値がある」という構造的な傾向です。\n\n人間関係でつまずくのは「もっとしっかりすればよかった」ではなく、「もっと崩れてよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。誰かに「しんどい」と言えたとき、相手はどんな顔をしていましたか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    aquarius: name+'さんへ、星読みカルテからの診断です。\n\n【水瓶座の人間関係】\n「みんなのことを考えられるのに、目の前の一人とうまくいかない人。」\n\nあなたは大きな視点で物事を見る力があります。社会や構造を俯瞰して、本質的な問いを立てられる。その独自の視点で、あなたに共鳴する人は深く引きつけられます。\n\nでも、その裏にこんな構造があります。「みんな」のことは考えられても、目の前の一人の感情に寄り添うことが苦手なことがある。感情的になっている相手を、つい「論理」で解決しようとしてしまう。これは冷たさではなく、「感情より概念」として世界を処理してきた構造的な傾向です。\n\n人間関係でつまずくのは「もっと論理的に説明すればよかった」ではなく、「ただそばにいればよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。理屈抜きで「この人といたい」と思った瞬間は、どんなときでしたか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
    pisces: name+'さんへ、星読みカルテからの診断です。\n\n【魚座の人間関係】\n「誰よりも共感できるのに、共感しすぎて自分を見失う人。」\n\nあなたは相手の気持ちの中に入り込む力があります。その場の感情を丸ごと受け取り、自分のことのように感じられる。その感受性で、あなたとつながった人は「本当にわかってもらえた」と感じます。\n\nでも、その裏にこんな構造があります。相手の感情と自分の感情の境界線が薄いために、どこまでが自分でどこからが相手かわからなくなることがある。誰かのために動いているつもりが、実は自分の感情を相手に投影していることがある。これは優しさの問題ではなく、「境界線の薄さ」という構造的な傾向です。\n\n人間関係でつまずくのは「もっと共感すればよかった」ではなく、「自分の感情を先に確認すればよかった」という場面かもしれません。'+ib+'\n\nあなたに聞いてみたいことがあります。今のあなたの気持ちは、あなた自身のものですか？それとも誰かから受け取ったものですか？\n\n▷ 詳細解析では、星座×刻印×月星座の交差点から、あなただけの人間関係パターンを読み解きます。',
  };
  return T[zodiac] || T.cancer;
}

const WELCOME = 'こんにちは。星読みカルテです。\n\n占星術を「予言」としてではなく、自分を知るための地図として使います。\n当たるかより、腑に落ちるか。\n\n無料診断では、あなたの人間関係のパターンを言語化します。\n\nまず、お名前を教えてください。';

function getNextStep(session, text) {
  switch (session.step) {
    case 0:
      session.name = text.trim();
      session.step = 1;
      return session.name + 'さん、はじめまして。\n\n生年月日を教えてください。\n例：2000/9/26 または 2000年9月26日';
    case 1: {
      const bd = parseBirthdate(text);
      if (!bd) return '生年月日を数字で入力してください。\n例：2000/9/26 または 2000年9月26日';
      session.birthdate = bd;
      session.step = 2;
      return {
        type: 'text',
        text: '性別を教えてください（任意）。\n診断の精度を上げるために使いますが、スキップしても大丈夫です。',
        quickReply: { items: [
          { type: 'action', action: { type: 'message', label: '女性', text: '女性' } },
          { type: 'action', action: { type: 'message', label: '男性', text: '男性' } },
          { type: 'action', action: { type: 'message', label: 'その他・答えたくない', text: 'スキップ' } },
        ]},
      };
    }
    case 2:
      session.gender = text === '女性' ? 'female' : text === '男性' ? 'male' : null;
      session.step = 3;
      return {
        type: 'text',
        text: '出生時間帯を教えてください（任意）。',
        quickReply: { items: [
          { type: 'action', action: { type: 'message', label: '朝（6〜12時）', text: '朝' } },
          { type: 'action', action: { type: 'message', label: '昼（12〜18時）', text: '昼' } },
          { type: 'action', action: { type: 'message', label: '夜（18〜24時）', text: '夜' } },
          { type: 'action', action: { type: 'message', label: '深夜（0〜6時）', text: '深夜' } },
          { type: 'action', action: { type: 'message', label: 'わからない', text: 'わからない' } },
        ]},
      };
    case 3:
      session.timeOfDay = text.trim();
      session.step = 4;
      return '出生地（都道府県や市区町村）を教えてください。\n例：東京都、大阪市、石川県など';
    case 4: {
      session.birthplace = text.trim();
      session.step = 5;
      const { year, month, day } = session.birthdate;
      const zn = ZODIAC_NAMES[getZodiac(month, day)];
      return 'ありがとうございます。確認します。\n\nお名前：' + session.name +
        '\n生年月日：' + year + '年' + month + '月' + day + '日' +
        '\n時間帯：' + session.timeOfDay +
        '\n出生地：' + session.birthplace +
        '\n星座：' + zn +
        '\n\nこの内容で診断を送ります。よろしいですか？（はい／いいえ）';
    }
    case 5:
      if (/はい|yes|ok/i.test(text)) { session.step = 6; return '__SEND__'; }
      session.step = 0;
      return 'はじめからやり直します。\n\nお名前を教えてください。';
    default:
      return '「診断」と送るとはじめからやり直せます。';
  }
}

app.post('/webhook', line.middleware(config), async (req, res) => {
  res.status(200).end();
  for (const event of (req.body.events || [])) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;
    await handleMessage(event).catch(console.error);
  }
});

async function handleMessage(event) {
  const userId = event.source.userId;
  const text = event.message.text.trim();

  if (/^(リセット|reset)$/i.test(text)) {
    delete sessions[userId];
    await client.replyMessage(event.replyToken, { type: 'text', text: WELCOME });
    return;
  }

  if (!sessions[userId] || text === '診断') {
    sessions[userId] = { step: 0 };
    await client.replyMessage(event.replyToken, { type: 'text', text: WELCOME });
    return;
  }

  const session = sessions[userId];
  const response = getNextStep(session, text);

  if (response === '__SEND__') {
    const { name, birthdate, birthplace, gender } = session;
    const { year, month, day } = birthdate;
    const zodiacKey = getZodiac(month, day);
    const regionType = detectRegionType(birthplace);
    const resultText = buildZodiacText(name, zodiacKey, year, gender, regionType);

    await client.replyMessage(event.replyToken, { type: 'text', text: resultText });

    const adminId = process.env.ADMIN_LINE_USER_ID;
    if (adminId) {
      const gl = gender === 'female' ? '女性' : gender === 'male' ? '男性' : '未回答';
      await client.pushMessage(adminId, {
        type: 'text',
        text: '【新規診断】\n名前：' + name + '\n生年月日：' + year + '/' + month + '/' + day +
          '\n性別：' + gl + '\n時間帯：' + session.timeOfDay +
          '\n出生地：' + birthplace + '（' + (regionType === 'urban' ? '都市' : '地方') + '）' +
          '\n星座：' + ZODIAC_NAMES[zodiacKey],
      });
    }
    delete sessions[userId];
    return;
  }

  const msg = typeof response === 'string' ? { type: 'text', text: response } : response;
  await client.replyMessage(event.replyToken, msg);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('星読みカルテ LINE Bot 起動 port:' + PORT));
