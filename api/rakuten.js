const KEYWORD_MAP = {
  育児: '知育おもちゃ',
  美容: 'スキンケアセット',
  暮らし: '収納グッズ',
  ダイエット: 'プロテイン 女性',
  語学: '英語教材 大人',
};

export default async function handler(req, res) {
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
    minReviewCount: '100',
    minAffiliateRate: '4.0',
    imageFlag: '1',
    formatVersion: '2',
  });

  try {
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.Items || data.Items.length === 0) {
      return res.status(200).json({ items: [] });
    }

    const items = data.Items.map((item) => ({
      name: item.itemName,
      imageUrl: item.mediumImageUrls?.[0]?.imageUrl || '',
      price: item.itemPrice,
      reviewCount: item.reviewCount,
      reviewAverage: item.reviewAverage,
      affiliateUrl: item.affiliateUrl || item.itemUrl,
    }));

    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch Rakuten API' });
  }
}
