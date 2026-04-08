// 星読みカルテ 刻印データベース v1
// 生年・性別・地域から「時代の刻印」を特定するエンジンimprints.js

const IMPRINTS = [
  { id:'hanshin', peakYear:1995, name:'阪神淡路大震災', category:'disaster', impact:'「安心だと思っていた場所が一瞬で変わる」という体験は、人間関係における安心感の求め方に、今も静かに影響を与えている可能性があります。', ageRange:{best:[6,18],good:[19,30]}, gender:'all', region:'all', weight:3 },
  { id:'911', peakYear:2001, name:'9.11同時多発テロ', category:'disaster', impact:'「世界は突然、予測不可能な方向に動く」という感覚は、人間関係において先を読もうとする慎重さに、今もつながっている可能性があります。', ageRange:{best:[6,18],good:[19,30]}, gender:'all', region:'all', weight:2 },
  { id:'311', peakYear:2011, name:'東日本大震災（3.11）', category:'disaster', impact:'「大切なものは突然なくなる」という体験は、人間関係における距離の取り方と深さへの渇望に、今も静かに影響を与えている可能性があります。', ageRange:{best:[6,18],good:[19,30]}, gender:'all', region:'all', weight:3 },
  { id:'covid', peakYear:2020, name:'コロナ禍', category:'disaster', impact:'「つながりたいのに、つながれない」という体験は、人間関係における距離感の設計に、今もじわじわと影響を与えている可能性があります。', ageRange:{best:[10,25],good:[5,35]}, gender:'all', region:'all', weight:3 },
  { id:'bubble_collapse', peakYear:1993, name:'バブル崩壊', category:'economy', impact:'「頑張れば豊かになれる」という時代が終わる瞬間を目撃した体験は、人間関係における信頼と約束への感覚に、今も影響を与えている可能性があります。', ageRange:{best:[15,35],good:[8,45]}, gender:'all', region:'all', weight:2 },
  { id:'ice_age', peakYear:1999, name:'就職氷河期', category:'economy', impact:'「ルールを守って頑張っても、社会に必要とされないことがある」という体験は、人間関係における努力と承認の結びつき方に、深い痕跡を残している可能性があります。', ageRange:{best:[18,25],good:[13,30]}, gender:'all', region:'all', weight:3 },
  { id:'lehman', peakYear:2008, name:'リーマンショック', category:'economy', impact:'「頑張っても、世界の都合で裏切られることがある」という体験は、人間関係で本音を出すことへの慎重さに、今もつながっている可能性があります。', ageRange:{best:[13,25],good:[6,35]}, gender:'all', region:'all', weight:2 },
  { id:'lost_decades', peakYear:1995, name:'失われた30年', category:'economy', impact:'「どれだけ頑張っても、生活が豊かになっていかない」という時代に育つことは、人間関係において期待することへの慎重さを育てた可能性があります。', ageRange:{best:[10,30],good:[5,40]}, gender:'all', region:'all', weight:2 },
  { id:'lookism', peakYear:2018, name:'SNSによるルッキズム文化', category:'social', impact:'「外見で評価される」という感覚がSNSを通じて常態化した時代に育つことは、人間関係において「見られること」への複雑な感情を刻んでいる可能性があります。', ageRange:{best:[10,22],good:[8,28]}, gender:'all', region:'all', weight:3 },
  { id:'black_company', peakYear:2013, name:'ブラック企業問題の顕在化', category:'social', impact:'「働くことで壊れる人がいる」という事実を就職前に知った体験は、人間関係における組織への信頼感と自己犠牲の許容範囲に、影響を与えている可能性があります。', ageRange:{best:[15,25],good:[10,30]}, gender:'all', region:'all', weight:2 },
  { id:'dentsu_karoshi', peakYear:2016, name:'電通過労死事件', category:'social', impact:'「懸命に働いた人が、壊れてしまうことがある」という現実が可視化された時代は、人間関係における「頑張りすぎること」への感覚に影響を与えている可能性があります。', ageRange:{best:[15,28],good:[10,35]}, gender:'all', region:'all', weight:2 },
  { id:'metoo', peakYear:2017, name:'#MeToo・ハラスメント問題の顕在化', category:'social', impact:'「声を上げることで世界が変わりうる」体験と「それでも変わらない現実」の両方を目撃した時代は、人間関係における権力と信頼の感覚を形作っている可能性があります。', ageRange:{best:[13,30],good:[8,40]}, gender:'all', region:'all', weight:2 },
  { id:'oyagacha', peakYear:2021, name:'「親ガチャ」問題の言語化', category:'social', impact:'「生まれた環境が人生を決める」という不公平さが言語化された時代に育つことは、人間関係における努力と運の比率への感覚に、静かに影響を与えている可能性があります。', ageRange:{best:[10,22],good:[8,30]}, gender:'all', region:'all', weight:2 },
  { id:'ijime', peakYear:1995, name:'いじめ問題の社会問題化', category:'social', impact:'「集団の中での居場所は、突然奪われることがある」という時代の空気は、人間関係における「安全な場所」の作り方に、今も影響を与えている可能性があります。', ageRange:{best:[6,18],good:[5,25]}, gender:'all', region:'all', weight:2 },
  { id:'mental_health', peakYear:2015, name:'メンタルヘルス問題の認知拡大', category:'social', impact:'「弱さは病気である」という認識と「でも認めたら負け」という圧力が同時に存在した時代は、人間関係において自分の傷をどう扱うかという感覚を形作っている可能性があります。', ageRange:{best:[13,28],good:[8,40]}, gender:'all', region:'all', weight:2 },
  { id:'diversity_pressure', peakYear:2020, name:'多様性・正しさへの圧力', category:'social', impact:'「何が正しいか」が常に更新される時代に育つことは、人間関係において「自分の言葉が誰かを傷つけるかもしれない」という慎重さと窮屈さを同時に刻んでいる可能性があります。', ageRange:{best:[12,25],good:[8,35]}, gender:'all', region:'all', weight:2 },
  { id:'sns_born', peakYear:2010, name:'SNS・スマートフォンの普及', category:'culture', impact:'「常に誰かに見られている」という感覚と「つながっているのに孤独」という矛盾の中で育つことは、人間関係における本音と建前の距離感を形作っている可能性があります。', ageRange:{best:[10,20],good:[8,30]}, gender:'all', region:'all', weight:3 },
  { id:'approval_economy', peakYear:2015, name:'いいね・承認経済の時代', category:'culture', impact:'「承認が数値化される」という環境で人間関係を学んだ体験は、人間関係における「見てほしい」と「見られたくない」の矛盾を深く刻んでいる可能性があります。', ageRange:{best:[10,22],good:[8,30]}, gender:'all', region:'all', weight:3 },
  { id:'tiktok_timepoverty', peakYear:2020, name:'タイパ・ショート動画文化', category:'culture', impact:'「深くではなく速く消費する」という文化が標準になった時代は、人間関係において「時間をかけて深まること」への感覚に、静かに影響を与えている可能性があります。', ageRange:{best:[10,20],good:[8,28]}, gender:'all', region:'all', weight:2 },
  { id:'yutori_stigma', peakYear:2005, name:'「ゆとり世代」と叩かれた体験', category:'culture', impact:'「生まれた時代を理由に馬鹿にされる」という体験は、人間関係において世代間の信頼感と、自分の世代への誇りと恥の感覚を複雑に形作っている可能性があります。', ageRange:{best:[10,22],good:[8,28]}, gender:'all', region:'all', weight:2 },
  { id:'information_overload', peakYear:2018, name:'情報過多・フェイクニュース時代', category:'culture', impact:'「何が本当かわからない」という環境で育つことは、人間関係において相手の言葉をどこまで信じるか、という感覚の形成に影響を与えている可能性があります。', ageRange:{best:[12,25],good:[8,35]}, gender:'all', region:'all', weight:2 },
  { id:'divorce_normalization', peakYear:2000, name:'離婚率上昇・家族の多様化', category:'family', impact:'「家族のかたちは一つではない」という時代に育つことは、人間関係における「安定した関係」への渇望と、それへの信頼しにくさを同時に形作っている可能性があります。', ageRange:{best:[5,18],good:[3,25]}, gender:'all', region:'all', weight:2 },
  { id:'kyoiku_mama', peakYear:1985, name:'受験戦争・過熱する教育競争', category:'family', impact:'「努力と成果が直接結びつく」という環境で育つことは、人間関係において「評価されること」と「存在すること」の区別のしにくさを生んでいる可能性があります。', ageRange:{best:[8,18],good:[5,25]}, gender:'all', region:'all', weight:2 },
  { id:'toxic_parents', peakYear:2015, name:'毒親・機能不全家族の言語化', category:'family', impact:'「親を否定することへの罪悪感」と「でも苦しかった」という矛盾が言語化された時代は、人間関係における近しい人への感情の整理の仕方に、影響を与えている可能性があります。', ageRange:{best:[13,30],good:[8,40]}, gender:'all', region:'all', weight:2 },
  { id:'gakureki_society', peakYear:1990, name:'学歴社会の重圧', category:'family', impact:'「どの学校に入るかで、人生が決まる」という空気の中で育つことは、人間関係において「自分の価値」の根拠をどこに置くかという感覚を形作っている可能性があります。', ageRange:{best:[8,22],good:[5,30]}, gender:'all', region:'all', weight:2 },
  { id:'female_appearance', peakYear:2015, name:'女性への容姿批評文化', category:'gender', impact:'「外見で評価される」という空気が当たり前にあった時代に育つことは、人間関係において「見られている自分」への意識と、それへの疲弊を深く刻んでいる可能性があります。', ageRange:{best:[10,25],good:[8,35]}, gender:'female', region:'all', weight:3 },
  { id:'female_marriage_pressure', peakYear:2000, name:'女性への結婚・出産プレッシャー', category:'gender', impact:'「女性はいつか結婚して母になるもの」という前提が空気のようにあった時代は、人間関係において「自分は何のために存在するのか」という問いを早くから抱えさせた可能性があります。', ageRange:{best:[15,35],good:[10,45]}, gender:'female', region:'all', weight:2 },
  { id:'female_glass_ceiling', peakYear:1995, name:'ガラスの天井・女性の働きにくさ', category:'gender', impact:'「頑張っても、性別で限界がある」という現実を目撃した体験は、人間関係における「信頼して任せること」と「諦め」の距離感を形作っている可能性があります。', ageRange:{best:[18,35],good:[13,45]}, gender:'female', region:'all', weight:2 },
  { id:'male_masculine_norm', peakYear:1990, name:'「男らしさ」への圧力', category:'gender', impact:'「弱音を吐くな、感情を見せるな」という規範の中で育つことは、人間関係において自分の傷や不安を誰かに伝えることへの、深いブレーキを形作っている可能性があります。', ageRange:{best:[8,22],good:[5,35]}, gender:'male', region:'all', weight:3 },
  { id:'male_provider_pressure', peakYear:1990, name:'男性への「稼ぐべき」プレッシャー', category:'gender', impact:'「経済力で愛される」という空気の中で育つことは、人間関係において「与えること」と「存在すること」を切り離せない感覚を生んでいる可能性があります。', ageRange:{best:[15,30],good:[10,40]}, gender:'male', region:'all', weight:2 },
  { id:'lgbtq_invisible', peakYear:2000, name:'LGBTQの非可視化・同性愛タブー', category:'gender', impact:'「自分のような人間は存在しないことになっている」という感覚の中で育つことは、人間関係において「本当の自分を見せること」への深い恐れを生んでいる可能性があります。', ageRange:{best:[8,25],good:[5,35]}, gender:'all', region:'all', weight:3 },
  { id:'rural_escape_dilemma', peakYear:2000, name:'地方→都市への圧力・地元を出るか否か', category:'region', impact:'「出ていけば裏切り、残れば終わり」という選択を迫られた体験は、人間関係において「ここにいてもいいのか」という問いを、どこに行っても抱えさせた可能性があります。', ageRange:{best:[15,25],good:[10,35]}, gender:'all', region:'rural', weight:3 },
  { id:'rural_depopulation', peakYear:2005, name:'過疎化・地域コミュニティの崩壊', category:'region', impact:'「知っている場所が、少しずつなくなっていく」という体験は、人間関係における「永続するもの」への信頼感と、喪失への備え方を形作っている可能性があります。', ageRange:{best:[8,25],good:[5,40]}, gender:'all', region:'rural', weight:2 },
  { id:'tokyo_complex', peakYear:2000, name:'東京一極集中・地方コンプレックス', category:'region', impact:'「中心から離れた場所にいる」という感覚が日常にあった時代は、人間関係において「自分がいる場所の価値」と「どこかへ行かなければ」という焦りを形作っている可能性があります。', ageRange:{best:[13,25],good:[8,35]}, gender:'all', region:'rural', weight:2 },
  { id:'urban_anonymity', peakYear:2000, name:'都市の孤独・匿名性の中の生活', category:'region', impact:'「隣に誰が住んでいるかも知らない」という環境で育つことは、人間関係において「深くつながること」の作法を学ぶ場が少なかった可能性があります。', ageRange:{best:[5,20],good:[3,30]}, gender:'all', region:'urban', weight:2 },
  { id:'rural_surveillance', peakYear:1990, name:'地方の強い同調圧力・村社会', category:'region', impact:'「みんなと同じでなければならない」という空気の中で育つことは、人間関係において「自分だけ違う」という恐れと、本音を隠すことへの慣れを形作っている可能性があります。', ageRange:{best:[8,22],good:[5,30]}, gender:'all', region:'rural', weight:2 },
];

function calcAgeScore(birthYear, event) {
  const age = event.peakYear - birthYear;
  if (age < 0) return 999;
  const { best, good } = event.ageRange;
  if (age >= best[0] && age <= best[1]) return 0;
  if (good && age >= good[0] && age <= good[1]) return 1;
  return 999;
}

function calcGenderScore(userGender, event) {
  if (event.gender === 'all') return 0;
  if (!userGender) return 5;
  return event.gender === userGender ? 0 : 10;
}

function calcRegionScore(userRegion, event) {
  if (!userRegion || event.region === 'all') return 1;
  return event.region === userRegion ? 0 : 2;
}

function getImprints(birthYear, gender, regionType, topN) {
  topN = topN || 1;
  const scored = IMPRINTS.map(function(event) {
    const ageScore = calcAgeScore(birthYear, event);
    if (ageScore === 999) return null;
    const total = ageScore + calcGenderScore(gender, event) + calcRegionScore(regionType, event) * 0.5 + (3 - event.weight) * 0.1;
    return { event: event, score: total };
  }).filter(Boolean);
  scored.sort(function(a, b) { return a.score - b.score; });
  const results = [];
  const usedCategories = new Set();
  for (let i = 0; i < scored.length; i++) {
    if (results.length >= topN) break;
    if (results.length > 0 && usedCategories.has(scored[i].event.category)) continue;
    results.push(scored[i].event);
    usedCategories.add(scored[i].event.category);
  }
  if (results.length < topN) {
    for (let i = 0; i < scored.length; i++) {
      if (results.length >= topN) break;
      if (results.indexOf(scored[i].event) === -1) results.push(scored[i].event);
    }
  }
  return results;
}

function getImprintLine(birthYear, gender, regionType) {
  const top = getImprints(birthYear, gender, regionType, 1)[0];
  if (!top) return null;
  const age = top.peakYear - birthYear;
  return 'あなたが' + age + '歳のとき、' + top.name + 'がありました。\n' + top.impact + '\n\n※詳細解析では、この刻印と星座の交差点を読み解きます。';
}

function getDetailedImprints(birthYear, gender, regionType) {
  return getImprints(birthYear, gender, regionType, 3);
}

module.exports = { getImprintLine: getImprintLine, getDetailedImprints: getDetailedImprints, IMPRINTS: IMPRINTS };
