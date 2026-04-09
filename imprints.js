// 星読みカルテ 刻印データベース v2
// 生年・性別・地域・星座から「時代の刻印」を特定するエンジン

const IMPRINTS = [
  {
    id:'hanshin', peakYear:1995, name:'阪神淡路大震災', category:'disaster',
    impact:'「安心だと思っていた場所が、一瞬でなくなることがある」——その感覚は、記憶というより、関係への信頼の仕方そのものを形作った可能性があります。人間関係において「ここにいて大丈夫か」という問いが、気づかないうちに繰り返されているとしたら。それはあの時代を生きた人の多くが、まだ言葉にできていない共通の傷かもしれません。',
    hiddenQuestion:'この人のそばにいて、本当に安心していいのだろうか。',
    ageRange:{best:[6,18],good:[19,30]}, gender:'all', region:'all', weight:3
  },
  {
    id:'911', peakYear:2001, name:'9.11同時多発テロ', category:'disaster',
    impact:'「世界は、予告なく変わる」という感覚がリアルになった時代を生きることは、人間関係における「先を読もうとする慎重さ」として、今も静かに動いている可能性があります。それは安全への知恵でもありますが、同時に、深く信頼することへのブレーキになっていることがあります。',
    hiddenQuestion:'この関係も、明日には変わってしまうのではないか。',
    ageRange:{best:[6,18],good:[19,30]}, gender:'all', region:'all', weight:2
  },
  {
    id:'311', peakYear:2011, name:'東日本大震災（3.11）', category:'disaster',
    impact:'「大切なものは、突然なくなることがある」——その体験は、人間関係における距離の取り方と深さへの渇望に、今も静かに影響を与えている可能性があります。深くつながりたいのに近づくのが怖い、というアンビバレンスは、喪失の記憶が作り出す構造かもしれません。',
    hiddenQuestion:'大切な人といる今この瞬間を、本当に大切にできているだろうか。',
    ageRange:{best:[6,18],good:[19,30]}, gender:'all', region:'all', weight:3
  },
  {
    id:'covid', peakYear:2020, name:'コロナ禍', category:'disaster',
    impact:'「つながりたいのに、つながれない」という体験は、人間関係における距離感の設計を根底から問い直させた可能性があります。それが終わった後も、「どこまで近づいていいのか」という感覚は、身体の記憶として残り続けているかもしれません。',
    hiddenQuestion:'どこまで近づいたら、また傷つくのだろうか。',
    ageRange:{best:[10,25],good:[5,35]}, gender:'all', region:'all', weight:3
  },
  {
    id:'bubble_collapse', peakYear:1993, name:'バブル崩壊', category:'economy',
    impact:'「頑張れば豊かになれる」という時代の終わりを目撃することは、人間関係における約束や信頼への感覚を形作った可能性があります。「信じても、裏切られることがある」——その前提が、深くつながることへの慎重さになっていることがあります。',
    hiddenQuestion:'信じて尽くしても、最終的には裏切られるのではないか。',
    ageRange:{best:[15,35],good:[8,45]}, gender:'all', region:'all', weight:2
  },
  {
    id:'ice_age', peakYear:1999, name:'就職氷河期', category:'economy',
    impact:'「ルールを守って頑張っても、社会に必要とされないことがある」——その現実を生きることは、人間関係における努力と承認の結びつきを、複雑に形作った可能性があります。どれだけ誠実に関わっても認められない、という感覚が、関係への参加を消極的にさせていることがあります。',
    hiddenQuestion:'どれだけ頑張っても、本当に必要とされる日は来るのだろうか。',
    ageRange:{best:[18,25],good:[13,30]}, gender:'all', region:'all', weight:3
  },
  {
    id:'lehman', peakYear:2008, name:'リーマンショック', category:'economy',
    impact:'「頑張っても、世界の都合で裏切られることがある」——その体験は、人間関係で本音を出すことへの慎重さに、今もつながっている可能性があります。「どうせ変わらない」「本音を出しても意味がない」という感覚は、希望を持つことへのブレーキになっていることがあります。',
    hiddenQuestion:'本音を出して、この関係が壊れるくらいなら、黙っていた方がいいのではないか。',
    ageRange:{best:[13,25],good:[6,35]}, gender:'all', region:'all', weight:2
  },
  {
    id:'lost_decades', peakYear:1995, name:'失われた30年', category:'economy',
    impact:'「どれだけ頑張っても、生活が豊かになっていかない」という時代を生きることは、人間関係における期待することへの慎重さを育てた可能性があります。期待して裏切られるくらいなら、最初から期待しない——その構造が、深い関係への入り口を塞いでいることがあります。',
    hiddenQuestion:'期待すること自体が、傷つくことの始まりではないか。',
    ageRange:{best:[10,30],good:[5,40]}, gender:'all', region:'all', weight:2
  },
  {
    id:'lookism', peakYear:2018, name:'SNSによるルッキズム文化', category:'social',
    impact:'「外見で評価される」という感覚がSNSを通じて常態化した時代を生きることは、人間関係において「見られていること」への複雑な感情を刻んでいる可能性があります。見られたい欲求と、見られたくないという防衛が、同時に存在するアンビバレンス。それが「本当の自分」を出すことへのためらいになっていることがあります。',
    hiddenQuestion:'外見を取り除いた、何も持っていない自分を、本当に受け入れてもらえるだろうか。',
    ageRange:{best:[10,22],good:[8,28]}, gender:'all', region:'all', weight:3
  },
  {
    id:'black_company', peakYear:2013, name:'ブラック企業問題の顕在化', category:'social',
    impact:'「働くことで壊れる人がいる」という事実を就職前に知った体験は、人間関係における組織や他者への信頼感と、自己犠牲の許容範囲を複雑に形作った可能性があります。「頑張りすぎることへの恐れ」と「でも手を抜くことへの罪悪感」が、今も関係の中で同時に動いているかもしれません。',
    hiddenQuestion:'自分が壊れるまで頑張ることを、誰かが止めてくれるのだろうか。',
    ageRange:{best:[15,25],good:[10,30]}, gender:'all', region:'all', weight:2
  },
  {
    id:'dentsu_karoshi', peakYear:2016, name:'電通過労死事件', category:'social',
    impact:'「懸命に働いた人が、壊れてしまうことがある」という現実が可視化された時代は、人間関係における「頑張りすぎること」への感覚を複雑にした可能性があります。誰かに「大丈夫？」と言われても、「大丈夫です」と答え続けてしまう構造は、この時代の空気から学んだものかもしれません。',
    hiddenQuestion:'頑張りすぎているこの自分に、誰かが本当に気づいてくれているのだろうか。',
    ageRange:{best:[15,28],good:[10,35]}, gender:'all', region:'all', weight:2
  },
  {
    id:'metoo', peakYear:2017, name:'#MeToo・ハラスメント問題の顕在化', category:'social',
    impact:'「声を上げることで世界が変わりうる」体験と、「それでも変わらない現実」の両方を目撃した時代は、人間関係における権力と信頼への感覚を揺さぶった可能性があります。声を上げていいのか、それとも黙って守るべきものを守るべきか——その迷いは、今も関係の中で繰り返されているかもしれません。',
    hiddenQuestion:'声を上げていいのか、それとも黙っていた方が、結局は守られるのか。',
    ageRange:{best:[13,30],good:[8,40]}, gender:'all', region:'all', weight:2
  },
  {
    id:'oyagacha', peakYear:2021, name:'「親ガチャ」問題の言語化', category:'social',
    impact:'「生まれた環境が人生を決める」という不公平さが言語化された時代に育つことは、人間関係における努力と運の比率への感覚に、複雑な影響を与えている可能性があります。変えられないものへの怒りと諦め——その感覚が、関係への入り方にも静かに影響を与えているかもしれません。',
    hiddenQuestion:'生まれた環境から、本当に自由になれる日は来るのだろうか。',
    ageRange:{best:[10,22],good:[8,30]}, gender:'all', region:'all', weight:2
  },
  {
    id:'ijime', peakYear:1995, name:'いじめ問題の社会問題化', category:'social',
    impact:'「集団の中での居場所は、突然奪われることがある」という時代の空気は、人間関係における「安全な場所」の求め方を形作った可能性があります。表面上は馴染んでいても、内側では「いつここを追い出されるのか」と感じながら関係を維持している——その緊張は、今も続いているかもしれません。',
    hiddenQuestion:'ここでも、突然居場所を失う日が来るのではないか。',
    ageRange:{best:[6,18],good:[5,25]}, gender:'all', region:'all', weight:2
  },
  {
    id:'mental_health', peakYear:2015, name:'メンタルヘルス問題の認知拡大', category:'social',
    impact:'「弱さは認められるべき」という認識と「でも認めたら負け」という圧力が同時に存在した時代は、人間関係において自分の傷をどう扱うかという感覚を複雑に形作った可能性があります。「助けを求めていいのか」という迷いは、今も関係の中で繰り返されているかもしれません。',
    hiddenQuestion:'弱さを見せたとき、この人はまだそばにいてくれるのだろうか。',
    ageRange:{best:[13,28],good:[8,40]}, gender:'all', region:'all', weight:2
  },
  {
    id:'diversity_pressure', peakYear:2020, name:'多様性・正しさへの圧力', category:'social',
    impact:'「何が正しいか」が常に更新される時代に育つことは、人間関係において「自分の言葉が誰かを傷つけるかもしれない」という慎重さと窮屈さを同時に刻んでいる可能性があります。本音を言う前に何度も検閲してしまう——その習慣が、深い対話への入り口を塞いでいることがあります。',
    hiddenQuestion:'本当のことを言えば、誰かを傷つけてしまうのではないか。',
    ageRange:{best:[12,25],good:[8,35]}, gender:'all', region:'all', weight:2
  },
  {
    id:'sns_born', peakYear:2010, name:'SNS・スマートフォンの普及', category:'culture',
    impact:'「常に誰かに見られている」という感覚と「つながっているのに孤独」という矛盾の中で育つことは、人間関係における本音と建前の距離感を形作った可能性があります。たくさんの「つながり」を持ちながら、誰ともわかり合えていないような感覚——それは個人の問題ではなく、この時代が設計した構造かもしれません。',
    hiddenQuestion:'つながっているはずなのに、なぜこんなに孤独なのだろうか。',
    ageRange:{best:[10,20],good:[8,30]}, gender:'all', region:'all', weight:3
  },
  {
    id:'approval_economy', peakYear:2015, name:'いいね・承認経済の時代', category:'culture',
    impact:'「承認が数値化される」という環境で人間関係を学んだ体験は、人間関係における「見てほしい」と「見られたくない」の矛盾を深く刻んでいる可能性があります。いいねの数で自分の価値を感じてしまうとき、数値で測れない自分の何かを、まだ信じられていないかもしれません。',
    hiddenQuestion:'数値で測れない自分の価値を、どうやって信じればいいのだろうか。',
    ageRange:{best:[10,22],good:[8,30]}, gender:'all', region:'all', weight:3
  },
  {
    id:'tiktok_timepoverty', peakYear:2020, name:'タイパ・ショート動画文化', category:'culture',
    impact:'「深くではなく速く消費する」という文化が標準になった時代は、人間関係において「時間をかけて深まること」への感覚を変えた可能性があります。ゆっくりと深まっていく関係の価値を、どこかで軽んじてしまっていないか——それが、気づけば表面的な関係だけが残る構造を作っているかもしれません。',
    hiddenQuestion:'時間をかけて深まることを、自分は本当に怖がっていないだろうか。',
    ageRange:{best:[10,20],good:[8,28]}, gender:'all', region:'all', weight:2
  },
  {
    id:'yutori_stigma', peakYear:2005, name:'「ゆとり世代」と叩かれた体験', category:'culture',
    impact:'「生まれた時代を理由に馬鹿にされる」という体験は、人間関係において世代間の信頼感と、自分の世代への誇りと恥の感覚を複雑に形作った可能性があります。上の世代に認められようとする動きと、「どうせわかってもらえない」という諦めが、同時に存在しているかもしれません。',
    hiddenQuestion:'自分の世代であることを、誇っていいのだろうか。',
    ageRange:{best:[10,22],good:[8,28]}, gender:'all', region:'all', weight:2
  },
  {
    id:'information_overload', peakYear:2018, name:'情報過多・フェイクニュース時代', category:'culture',
    impact:'「何が本当かわからない」という環境で育つことは、人間関係において相手の言葉をどこまで信じるか、という感覚の形成に影響を与えている可能性があります。信じたいのに信じ切れない——その慎重さは、関係の深さへの入り口を複雑にしているかもしれません。',
    hiddenQuestion:'この人の言葉を、どこまで本当に信じていいのだろうか。',
    ageRange:{best:[12,25],good:[8,35]}, gender:'all', region:'all', weight:2
  },
  {
    id:'divorce_normalization', peakYear:2000, name:'離婚率上昇・家族の多様化', category:'family',
    impact:'「家族のかたちは一つではない」という時代に育つことは、人間関係における「安定した関係」への渇望と、それへの信頼しにくさを同時に形作った可能性があります。深くつながりたい気持ちと、「どうせこの関係も終わるかもしれない」という感覚が、引き裂くように共存しているかもしれません。',
    hiddenQuestion:'関係は、最終的にはいつか終わるものなのだろうか。',
    ageRange:{best:[5,18],good:[3,25]}, gender:'all', region:'all', weight:2
  },
  {
    id:'kyoiku_mama', peakYear:1985, name:'受験戦争・過熱する教育競争', category:'family',
    impact:'「努力と成果が直接結びつく」という環境で育つことは、人間関係において「評価されること」と「存在すること」の区別のしにくさを生んでいる可能性があります。何かを「できる自分」だから愛される、という前提が無意識に刷り込まれているとしたら——それは、ただいるだけでいい関係への信頼を難しくしているかもしれません。',
    hiddenQuestion:'成果を出せない自分でも、この人のそばにいていいのだろうか。',
    ageRange:{best:[8,18],good:[5,25]}, gender:'all', region:'all', weight:2
  },
  {
    id:'toxic_parents', peakYear:2015, name:'毒親・機能不全家族の言語化', category:'family',
    impact:'「親を否定することへの罪悪感」と「でも苦しかった」という矛盾が言語化された時代は、人間関係における近しい人への感情の整理を複雑にした可能性があります。怒っていいのか、悲しんでいいのか——近しい人への感情を許可することへの迷いが、今も関係の中で繰り返されているかもしれません。',
    hiddenQuestion:'近しい人への怒りや悲しみを、感じていいのだろうか。',
    ageRange:{best:[13,30],good:[8,40]}, gender:'all', region:'all', weight:2
  },
  {
    id:'gakureki_society', peakYear:1990, name:'学歴社会の重圧', category:'family',
    impact:'「どの学校に入るかで、人生が決まる」という空気の中で育つことは、人間関係において「自分の価値」の根拠をどこに置くかという感覚を形作った可能性があります。肩書や実績を剥ぎ取った自分に、まだ価値があると信じられているか——それが、関係の深さへの入り口を左右しているかもしれません。',
    hiddenQuestion:'肩書や実績を剥ぎ取った自分を、本当に受け入れてもらえるのだろうか。',
    ageRange:{best:[8,22],good:[5,30]}, gender:'all', region:'all', weight:2
  },
  {
    id:'female_appearance', peakYear:2015, name:'女性への容姿批評文化', category:'gender',
    impact:'「外見で評価される」という空気が当たり前にあった時代に育つことは、人間関係において「見られている自分」への意識と、それへの疲弊を深く刻んでいる可能性があります。外見を整えることで認められようとする動きと、「外見じゃない自分を見てほしい」という渇望が、同時に存在しているかもしれません。',
    hiddenQuestion:'外見を取り除いた、何も飾らない自分を、本当に見てもらえているのだろうか。',
    ageRange:{best:[10,25],good:[8,35]}, gender:'female', region:'all', weight:3
  },
  {
    id:'female_marriage_pressure', peakYear:2000, name:'女性への結婚・出産プレッシャー', category:'gender',
    impact:'「女性はいつか結婚して母になるもの」という前提が空気のようにあった時代は、人間関係において「自分は何のために存在するのか」という問いを早くから抱えさせた可能性があります。自分の人生の主語が自分でいいのかという迷いは、今も関係の選択の中に静かに影響を与えているかもしれません。',
    hiddenQuestion:'自分の人生の主語は、本当に自分でいいのだろうか。',
    ageRange:{best:[15,35],good:[10,45]}, gender:'female', region:'all', weight:2
  },
  {
    id:'female_glass_ceiling', peakYear:1995, name:'ガラスの天井・女性の働きにくさ', category:'gender',
    impact:'「頑張っても、性別で限界がある」という現実を目撃した体験は、人間関係における「信頼して任せること」と「諦め」の距離感を形作った可能性があります。本気で頑張ることへの怖さ——それが見えない壁への期待の調整として機能しているかもしれません。',
    hiddenQuestion:'本気で頑張ることを、どこかで諦めさせようとしている何かが、自分の中にいないか。',
    ageRange:{best:[18,35],good:[13,45]}, gender:'female', region:'all', weight:2
  },
  {
    id:'male_masculine_norm', peakYear:1990, name:'「男らしさ」への圧力', category:'gender',
    impact:'「弱音を吐くな、感情を見せるな」という規範の中で育つことは、人間関係において自分の傷や不安を誰かに伝えることへの、深いブレーキを形作った可能性があります。強くあることが愛されることと結びついているとしたら——弱さを見せた瞬間に関係が変わることへの恐れが、今も深いところで動いているかもしれません。',
    hiddenQuestion:'弱さを見せたとき、この人はまだそばにいてくれるのだろうか。',
    ageRange:{best:[8,22],good:[5,35]}, gender:'male', region:'all', weight:3
  },
  {
    id:'male_provider_pressure', peakYear:1990, name:'男性への「稼ぐべき」プレッシャー', category:'gender',
    impact:'「経済力で愛される」という空気の中で育つことは、人間関係において「与えること」と「存在すること」を切り離せない感覚を生んでいる可能性があります。与え続けられなくなったとき、自分は必要とされるのか——その問いは、関係の深さへの信頼を静かに侵食しているかもしれません。',
    hiddenQuestion:'与え続けられなくなったとき、自分はまだ必要とされるのだろうか。',
    ageRange:{best:[15,30],good:[10,40]}, gender:'male', region:'all', weight:2
  },
  {
    id:'lgbtq_invisible', peakYear:2000, name:'LGBTQの非可視化・同性愛タブー', category:'gender',
    impact:'「自分のような人間は存在しないことになっている」という感覚の中で育つことは、人間関係において「本当の自分を見せること」への深い恐れを生んだ可能性があります。見せていい自分と、隠し続ける自分——その分断は、どんな関係においても、本当の意味でのつながりを難しくしているかもしれません。',
    hiddenQuestion:'本当の自分を見せたとき、この人はまだそばにいてくれるのだろうか。',
    ageRange:{best:[8,25],good:[5,35]}, gender:'all', region:'all', weight:3
  },
  {
    id:'rural_escape_dilemma', peakYear:2000, name:'地方→都市への圧力・地元を出るか否か', category:'region',
    impact:'「出ていけば裏切り、残れば終わり」という選択を迫られた体験は、人間関係において「ここにいてもいいのか」という問いを、どこに行っても抱えさせた可能性があります。どこにいても根を張れない感覚——それが人間関係においても、「ここに深く入っていいのか」という迷いになっているかもしれません。',
    hiddenQuestion:'どこにいても「ここじゃなくてもよかった」と感じるのは、なぜなのだろうか。',
    ageRange:{best:[15,25],good:[10,35]}, gender:'all', region:'rural', weight:3
  },
  {
    id:'rural_depopulation', peakYear:2005, name:'過疎化・地域コミュニティの崩壊', category:'region',
    impact:'「知っている場所が、少しずつなくなっていく」という体験は、人間関係における「永続するもの」への信頼感と、喪失への備え方を形作った可能性があります。深くつながる前に失うことへの備え——それが、関係に全力で入ることへのブレーキになっているかもしれません。',
    hiddenQuestion:'大切な場所や人が、また失われるのではないか。',
    ageRange:{best:[8,25],good:[5,40]}, gender:'all', region:'rural', weight:2
  },
  {
    id:'tokyo_complex', peakYear:2000, name:'東京一極集中・地方コンプレックス', category:'region',
    impact:'「中心から離れた場所にいる」という感覚が日常にあった時代は、人間関係において「自分がいる場所の価値」と「どこかへ行かなければ」という焦りを形作った可能性があります。今いる場所への居心地の悪さが、今いる関係への居心地の悪さと重なっているとしたら——それは場所の問題ではなく、内側の問いかもしれません。',
    hiddenQuestion:'今いるこの場所で、この関係で、本当によかったのだろうか。',
    ageRange:{best:[13,25],good:[8,35]}, gender:'all', region:'rural', weight:2
  },
  {
    id:'urban_anonymity', peakYear:2000, name:'都市の孤独・匿名性の中の生活', category:'region',
    impact:'「隣に誰が住んでいるかも知らない」という環境で育つことは、人間関係において「深くつながること」の作法を学ぶ場が少なかった可能性があります。つながり方を学ぶ前に、つながらないことが標準になった——その感覚は、深い関係への入り方への迷いとして今も動いているかもしれません。',
    hiddenQuestion:'この人のことを、本当に知っているのだろうか。知ろうとしていいのだろうか。',
    ageRange:{best:[5,20],good:[3,30]}, gender:'all', region:'urban', weight:2
  },
  {
    id:'rural_surveillance', peakYear:1990, name:'地方の強い同調圧力・村社会', category:'region',
    impact:'「みんなと同じでなければならない」という空気の中で育つことは、人間関係において「自分だけ違う」という恐れと、本音を隠すことへの慣れを形作った可能性があります。本音を言う前に「これは言っていいか」と何度も確認してしまう——その習慣が、深い対話への入り口を塞いでいることがあります。',
    hiddenQuestion:'自分だけ違うことは、この関係でも許されるのだろうか。',
    ageRange:{best:[8,22],good:[5,30]}, gender:'all', region:'rural', weight:2
  },
];

// 星座ごとの核心テンション
const ZODIAC_TENSIONS = {
  aries:      '「行動することが愛すること」という構造',
  taurus:     '「変わらないことで安心を守ろうとする」という構造',
  gemini:     '「相手に合わせることで愛されようとする」という構造',
  cancer:     '「察してほしいのに、求めることができない」という構造',
  leo:        '「承認されることで安心しようとする」という構造',
  virgo:      '「貢献することで存在を証明しようとする」という構造',
  libra:      '「衝突しないことで愛されようとする」という構造',
  scorpio:    '「深くつながりたいのに、近づくと怖くなる」という構造',
  sagittarius:'「自由でいることで深さを避けようとする」という構造',
  capricorn:  '「頼らないことで価値を保とうとする」という構造',
  aquarius:   '「感情より概念で世界を処理しようとする」という構造',
  pisces:     '「相手と自分の感情の境界が溶けてしまう」という構造',
};

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

function getImprintLine(birthYear, gender, regionType, zodiacKey) {
  const top = getImprints(birthYear, gender, regionType, 1)[0];
  if (!top) return null;
  const age = top.peakYear - birthYear;
  const tension = zodiacKey ? ZODIAC_TENSIONS[zodiacKey] : null;

  let text = '【時代の刻印が語ること】\n';
  text += top.name + 'の時代を生きてきた人の多くが、その空気を意識せずに取り込んでいます。\n';
  text += 'それは「記憶」よりも深い場所に沈んでいく——';
  text += age + '歳前後という感受性の高い時期に刻まれたものほど、';
  text += '過去の出来事であっても、今の関係の選び方や、';
  text += 'まだ来ていない未来の関係への不安にまで、静かに影響し続けることがあります。\n\n';
  text += top.impact + '\n\n';

  if (tension) {
    text += 'あなたの中にある' + tension + 'と、この時代の刻印が重なるとき——\n';
    text += '人間関係の中で、こんな問いが繰り返し浮かびやすくなります。\n\n';
  } else {
    text += 'この刻印が人間関係の中に作り出すものは、こんな問いかもしれません。\n\n';
  }

  text += '「' + top.hiddenQuestion + '」\n\n';
  text += 'まだうまく言葉にできていなかったかもしれない、あなたの内側の声です。\n\n';
  text += '※詳細解析では、この刻印×星座の交差点から、あなただけの構造を読み解きます。';

  return text;
}

function getDetailedImprints(birthYear, gender, regionType) {
  return getImprints(birthYear, gender, regionType, 3);
}

module.exports = { getImprintLine, getDetailedImprints, IMPRINTS, ZODIAC_TENSIONS };
