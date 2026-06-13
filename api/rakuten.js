const KEYWORD_MAP = {
  育児: '知育おもちゃ',
  美容: 'スキンケアセット',
  暮らし: '収納グッズ',
  ダイエット: 'プロテイン 女性',
  語学: '英語教材 大人',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const genre = req.query.genre;
  const keyword = KEYWORD_MAP[genre];

  if (!keyword) {
    return res.status(400).json({ error: 'Invalid genre' });
  }

  const appId = process.env.RAKUTEN_APP_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId) {
    return res.status(500).json({ error: 'RAKUTEN_APP_ID not set' });
  }

  const params = new URLSearchParams({
    applicationId: appId,
    affiliateId: affiliateId || '',
    keyword,
    hits: '3',
    sort: '-reviewCount',
    imageFlag: '1',
    formatVersion: '2',
  });

  try {
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    // デバッグ用：生レスポンスをそのまま返す
    return res.status(200).json({ debug: true, appIdPrefix: appId ? appId.slice(0,4)+'****' : 'EMPTY', url: url.replace(appId, 'APP_ID'), raw: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
