/**
 * seo-pairs-data.mjs
 *
 * Static data for the 30 most popular currency pairs SEO landing pages.
 * Consumed by the static HTML generator (Task 3+).
 *
 * Exports:
 *   POPULAR_PAIRS          - 30 pair objects, ranks 1–20 fiat then 21–30 crypto
 *   FAQ_ITEMS              - 4 frequently-asked-question objects
 *   COINBASE_KNOWN_SYMBOLS - 24 tickers verified present in the Coinbase rates API
 */

/** @type {string[]} */
export const COINBASE_KNOWN_SYMBOLS = [
  // Fiat
  'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'HKD',
  'INR', 'JPY', 'KRW', 'MXN', 'NZD', 'PLN', 'SGD', 'TRY',
  'USD', 'ZAR',
  // Crypto
  'BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'XRP',
];

/**
 * @typedef {{ rank: number, from: string, to: string, fromName: string, toName: string, description: string, kind: 'fiat' | 'crypto' }} CurrencyPair
 */

/** @type {CurrencyPair[]} */
export const POPULAR_PAIRS = [
  // ─── Ranks 1–20: Fiat pairs ───────────────────────────────────────────────
  {
    rank: 1,
    from: 'EUR',
    to: 'USD',
    fromName: 'Euro',
    toName: 'US Dollar',
    kind: 'fiat',
    description:
      'The Euro to US Dollar pair is the world\'s most heavily traded currency pair, ' +
      'reflecting the deep economic ties between the eurozone and the United States. ' +
      'Travelers heading between Europe and North America, importers, exporters, and ' +
      'institutional investors all regularly need to exchange these two currencies. ' +
      'It also serves as a benchmark rate that many other pairs and financial instruments ' +
      'are priced against.',
  },
  {
    rank: 2,
    from: 'USD',
    to: 'JPY',
    fromName: 'US Dollar',
    toName: 'Japanese Yen',
    kind: 'fiat',
    description:
      'This pair shows how many Japanese yen you receive for each US dollar, making it ' +
      'the primary rate quoted in Japan for dollar transactions. Businesses engaged in ' +
      'trade between the US and Japan, tourists visiting either country, and investors ' +
      'in Asian markets rely on this pair daily. It is closely watched for shifts in ' +
      'Bank of Japan monetary policy and US Federal Reserve decisions.',
  },
  {
    rank: 3,
    from: 'USD',
    to: 'CNY',
    fromName: 'US Dollar',
    toName: 'Chinese Yuan',
    kind: 'fiat',
    description:
      'The US Dollar to Chinese Yuan pair reflects the exchange rate between the world\'s ' +
      'two largest economies and is essential for cross-border commerce between them. ' +
      'Companies importing Chinese manufactured goods or exporting raw materials to China ' +
      'frequently convert between these currencies. The rate is managed within a band by ' +
      'China\'s central bank, making it a closely watched indicator of trade and monetary policy.',
  },
  {
    rank: 4,
    from: 'GBP',
    to: 'USD',
    fromName: 'British Pound',
    toName: 'US Dollar',
    kind: 'fiat',
    description:
      'The British Pound to US Dollar pair—sometimes called "cable" in trading parlance—' +
      'captures the exchange rate between the UK and the United States. It is widely used ' +
      'by travelers, students paying tuition in one country while earning in the other, ' +
      'and businesses with transatlantic operations. Political events in the UK, such as ' +
      'changes in interest rates or government policy, can cause notable swings in this pair.',
  },
  {
    rank: 5,
    from: 'USD',
    to: 'CAD',
    fromName: 'US Dollar',
    toName: 'Canadian Dollar',
    kind: 'fiat',
    description:
      'The US Dollar to Canadian Dollar pair reflects close economic integration between ' +
      'two neighboring countries that share the world\'s longest land border. Oil exports ' +
      'are a major driver of Canada\'s economy, so energy prices frequently influence this ' +
      'pair\'s movement. Canadians shopping cross-border, US businesses paying Canadian ' +
      'suppliers, and travelers between the two nations all depend on this rate.',
  },
  {
    rank: 6,
    from: 'AUD',
    to: 'USD',
    fromName: 'Australian Dollar',
    toName: 'US Dollar',
    kind: 'fiat',
    description:
      'The Australian Dollar to US Dollar pair is sensitive to commodity prices—particularly ' +
      'iron ore and coal—because commodities make up a large share of Australia\'s exports. ' +
      'Travelers between Australia and the United States and businesses engaged in Pacific ' +
      'trade use this rate to plan transactions. Its movement also reflects shifts in risk ' +
      'sentiment among global investors who treat the Australian dollar as a commodity-linked currency.',
  },
  {
    rank: 7,
    from: 'USD',
    to: 'CHF',
    fromName: 'US Dollar',
    toName: 'Swiss Franc',
    kind: 'fiat',
    description:
      'The US Dollar to Swiss Franc pair involves two currencies with very different roles: ' +
      'the dollar as the world\'s primary reserve currency and the franc as a traditional ' +
      'safe-haven asset. Investors often seek Swiss francs during periods of global uncertainty, ' +
      'which can push this pair lower. It is also relevant for anyone paying for Swiss services, ' +
      'moving money to Swiss financial institutions, or traveling to Switzerland.',
  },
  {
    rank: 8,
    from: 'USD',
    to: 'HKD',
    fromName: 'US Dollar',
    toName: 'Hong Kong Dollar',
    kind: 'fiat',
    description:
      'The US Dollar to Hong Kong Dollar pair operates within a narrow peg maintained by ' +
      'the Hong Kong Monetary Authority, keeping the Hong Kong dollar trading in a tight ' +
      'band against the US dollar. Businesses and travelers operating across Hong Kong and ' +
      'the United States use this rate for invoicing, payments, and budgeting. Because of ' +
      'the peg, the rate changes very little day to day, making it predictable for importers and exporters.',
  },
  {
    rank: 9,
    from: 'USD',
    to: 'SGD',
    fromName: 'US Dollar',
    toName: 'Singapore Dollar',
    kind: 'fiat',
    description:
      'The US Dollar to Singapore Dollar pair is widely used across Southeast Asia, where ' +
      'Singapore serves as a regional financial and trade hub. Multinational companies with ' +
      'Asian headquarters in Singapore regularly convert payroll and operating expenses between ' +
      'these currencies. The Monetary Authority of Singapore manages the Singapore dollar\'s ' +
      'value against a basket of currencies, keeping movements relatively orderly.',
  },
  {
    rank: 10,
    from: 'USD',
    to: 'INR',
    fromName: 'US Dollar',
    toName: 'Indian Rupee',
    kind: 'fiat',
    description:
      'The US Dollar to Indian Rupee pair involves one of the most common remittance corridors ' +
      'in the world, driven by the large Indian diaspora working in the United States and elsewhere. ' +
      'Workers regularly send money home to family in India, making this rate critical for millions ' +
      'of households. It is also essential for technology outsourcing contracts and goods traded ' +
      'between India and the US.',
  },
  {
    rank: 11,
    from: 'EUR',
    to: 'GBP',
    fromName: 'Euro',
    toName: 'British Pound',
    kind: 'fiat',
    description:
      'The Euro to British Pound pair measures the relative value of the eurozone\'s common ' +
      'currency against the British pound sterling. Businesses with operations on both sides ' +
      'of the English Channel, UK residents holding euro savings, and travelers between the ' +
      'UK and continental Europe all track this rate closely. The pair gained particular attention ' +
      'after the UK\'s exit from the European Union reshaped trade and financial relationships.',
  },
  {
    rank: 12,
    from: 'USD',
    to: 'KRW',
    fromName: 'US Dollar',
    toName: 'South Korean Won',
    kind: 'fiat',
    description:
      'The US Dollar to South Korean Won pair reflects the exchange rate between the United States ' +
      'and one of Asia\'s most dynamic export-oriented economies. South Korean electronics, ' +
      'automobiles, and entertainment industries conduct a significant volume of transactions in ' +
      'US dollars, making this pair important for corporate treasury operations. Travelers to ' +
      'South Korea and international fans of Korean pop culture also use this rate frequently.',
  },
  {
    rank: 13,
    from: 'USD',
    to: 'MXN',
    fromName: 'US Dollar',
    toName: 'Mexican Peso',
    kind: 'fiat',
    description:
      'The US Dollar to Mexican Peso pair is shaped by one of the world\'s most significant ' +
      'bilateral trading relationships, with billions of dollars in goods crossing the US–Mexico ' +
      'border each year. Remittances from Mexican workers in the United States to their families ' +
      'in Mexico represent a major use case for converting between these currencies. Investors ' +
      'also watch this pair for signals about trade policy and economic conditions on both sides of the border.',
  },
  {
    rank: 14,
    from: 'USD',
    to: 'NZD',
    fromName: 'US Dollar',
    toName: 'New Zealand Dollar',
    kind: 'fiat',
    description:
      'The US Dollar to New Zealand Dollar pair is relevant for anyone engaged in trade or ' +
      'travel between the United States and New Zealand, a country whose economy is closely ' +
      'tied to agricultural exports and tourism. Dairy, meat, and wine exporters frequently ' +
      'convert their US dollar earnings back to New Zealand dollars. Like the Australian dollar, ' +
      'the New Zealand dollar is considered a commodity-sensitive currency that can move with global risk appetite.',
  },
  {
    rank: 15,
    from: 'EUR',
    to: 'JPY',
    fromName: 'Euro',
    toName: 'Japanese Yen',
    kind: 'fiat',
    description:
      'The Euro to Japanese Yen pair brings together two major currency blocs—the eurozone and ' +
      'Japan—in a cross rate that does not involve the US dollar directly. European companies ' +
      'exporting to Japan, Japanese tourists visiting Europe, and traders implementing carry ' +
      'strategies between differing interest-rate environments all rely on this pair. Policy ' +
      'divergence between the European Central Bank and the Bank of Japan often drives significant moves in EUR/JPY.',
  },
  {
    rank: 16,
    from: 'EUR',
    to: 'CHF',
    fromName: 'Euro',
    toName: 'Swiss Franc',
    kind: 'fiat',
    description:
      'The Euro to Swiss Franc pair connects the eurozone with its small but financially prominent ' +
      'neighbor Switzerland, whose economy is tightly integrated with the EU through trade and ' +
      'investment. Historically this pair has traded in a relatively narrow range, though sharp ' +
      'moves do occur around major central bank policy announcements. Businesses and individuals ' +
      'moving money between EU member states and Switzerland—for banking, real estate, or employment—use this rate regularly.',
  },
  {
    rank: 17,
    from: 'USD',
    to: 'BRL',
    fromName: 'US Dollar',
    toName: 'Brazilian Real',
    kind: 'fiat',
    description:
      'The US Dollar to Brazilian Real pair reflects the exchange rate between the world\'s largest ' +
      'economy and Brazil, the largest economy in Latin America. Commodity exports such as soybeans, ' +
      'iron ore, and crude oil heavily influence the real\'s value against the dollar. Investors, ' +
      'importers, exporters, and Brazilians living abroad all track this pair for decisions ranging ' +
      'from hedging commodity revenues to planning international travel.',
  },
  {
    rank: 18,
    from: 'USD',
    to: 'ZAR',
    fromName: 'US Dollar',
    toName: 'South African Rand',
    kind: 'fiat',
    description:
      'The US Dollar to South African Rand pair connects two economies with very different structures, ' +
      'with South Africa being a major producer of precious metals such as gold and platinum. ' +
      'Movements in commodity prices, alongside South Africa\'s domestic political and economic ' +
      'conditions, contribute to the rand\'s volatility against the dollar. Travelers to South Africa, ' +
      'mining investors, and businesses engaged in sub-Saharan trade use this pair for planning currency needs.',
  },
  {
    rank: 19,
    from: 'USD',
    to: 'TRY',
    fromName: 'US Dollar',
    toName: 'Turkish Lira',
    kind: 'fiat',
    description:
      'The US Dollar to Turkish Lira pair has seen substantial volatility in recent years, reflecting ' +
      'Turkey\'s elevated inflation environment and shifting monetary policy. Businesses importing ' +
      'goods priced in dollars into Turkey, expatriates sending money to or from the country, and ' +
      'investors in Turkish assets follow this rate closely. Converting dollars to lira—or vice versa—' +
      'at the right time can make a significant difference for anyone with financial exposure to both economies.',
  },
  {
    rank: 20,
    from: 'USD',
    to: 'PLN',
    fromName: 'US Dollar',
    toName: 'Polish Zloty',
    kind: 'fiat',
    description:
      'The US Dollar to Polish Zloty pair is relevant for the many Poles working abroad who send ' +
      'remittances home, as well as for businesses engaged in trade between Poland and dollar-denominated ' +
      'markets. Poland\'s integration into the European Union and its growing manufacturing and technology ' +
      'sectors have increased international currency flows involving the zloty. Travelers visiting Poland ' +
      'and foreign investors in Polish real estate or equities also use this rate.',
  },

  // ─── Ranks 21–30: Crypto pairs ────────────────────────────────────────────
  {
    rank: 21,
    from: 'BTC',
    to: 'USD',
    fromName: 'Bitcoin',
    toName: 'US Dollar',
    kind: 'crypto',
    description:
      'Bitcoin to US Dollar is the most widely referenced cryptocurrency exchange rate, expressing ' +
      'the value of one bitcoin in US dollars. Investors buying or selling bitcoin, businesses accepting ' +
      'crypto payments, and individuals converting bitcoin proceeds to spendable dollars all depend on ' +
      'this rate. It serves as the primary benchmark for the entire cryptocurrency market, with most ' +
      'other digital assets priced in relation to it.',
  },
  {
    rank: 22,
    from: 'BTC',
    to: 'USDT',
    fromName: 'Bitcoin',
    toName: 'Tether',
    kind: 'crypto',
    description:
      'Bitcoin to Tether is one of the most traded crypto-to-stablecoin pairs on digital asset ' +
      'exchanges, allowing traders to move between bitcoin and a dollar-pegged stablecoin without ' +
      'leaving the crypto ecosystem. Tether (USDT) is designed to maintain a 1:1 value with the US dollar, ' +
      'letting holders preserve purchasing power during market downturns without converting back to ' +
      'bank-held fiat. It is especially favored on exchanges that operate without direct USD fiat banking.',
  },
  {
    rank: 23,
    from: 'ETH',
    to: 'USD',
    fromName: 'Ethereum',
    toName: 'US Dollar',
    kind: 'crypto',
    description:
      'Ethereum to US Dollar expresses the price of one ether token in US dollars, making it the ' +
      'most watched rate for the Ethereum ecosystem. Developers building decentralized applications, ' +
      'investors participating in token sales, and users paying network fees in ETH all look to this ' +
      'rate when converting to or from US dollars. It reflects both the market\'s assessment of ' +
      'Ethereum\'s utility as a smart contract platform and broader sentiment toward risk assets.',
  },
  {
    rank: 24,
    from: 'ETH',
    to: 'USDT',
    fromName: 'Ethereum',
    toName: 'Tether',
    kind: 'crypto',
    description:
      'Ethereum to Tether gives holders of ether a way to convert to a dollar-pegged asset without ' +
      'leaving the Ethereum network, since USDT is issued natively on Ethereum as an ERC-20 token. ' +
      'This makes it practical for users of Ethereum-based protocols to settle obligations, receive ' +
      'proceeds from smart contracts, or hold stable value between transactions entirely on-chain. ' +
      'Developers and traders who work within the Ethereum ecosystem often keep USDT balances ready ' +
      'to move value quickly between wallets and applications without an intermediate fiat step.',
  },
  {
    rank: 25,
    from: 'SOL',
    to: 'USD',
    fromName: 'Solana',
    toName: 'US Dollar',
    kind: 'crypto',
    description:
      'Solana to US Dollar reflects the value of one SOL token in US dollars, tracking one of the ' +
      'more actively developed blockchain networks known for high transaction throughput and low fees. ' +
      'Investors who hold SOL for staking rewards or governance participation often convert to USD when ' +
      'they want to realize profits or rebalance their portfolio. The pair is also relevant to developers ' +
      'and users of Solana-based applications who need to cover expenses or revenue in US dollars.',
  },
  {
    rank: 26,
    from: 'SOL',
    to: 'USDT',
    fromName: 'Solana',
    toName: 'Tether',
    kind: 'crypto',
    description:
      'Solana to Tether is a natural pairing within the Solana ecosystem, where the network\'s high ' +
      'throughput and low transaction fees make frequent stablecoin movement inexpensive and fast. ' +
      'USDT is available on Solana as a native SPL token, allowing participants in Solana\'s ' +
      'applications—trading venues, lending protocols, and payment tools—to convert SOL to a stable ' +
      'unit of value and redeploy it within the same environment. This is particularly useful for ' +
      'active traders and developers who want to manage risk in SOL-denominated positions without ' +
      'routing funds off-chain.',
  },
  {
    rank: 27,
    from: 'BTC',
    to: 'USDC',
    fromName: 'Bitcoin',
    toName: 'USD Coin',
    kind: 'crypto',
    description:
      'Bitcoin to USD Coin connects the leading cryptocurrency with one of the most regulated and ' +
      'transparent USD-pegged stablecoins. USDC is issued by Circle and backed by audited dollar ' +
      'reserves, making this pair attractive to institutional participants and compliance-focused platforms. ' +
      'Investors who want to hold the equivalent of US dollars on-chain while maintaining quick access ' +
      'to bitcoin trading often use BTC/USDC for its combination of liquidity and issuer transparency.',
  },
  {
    rank: 28,
    from: 'ETH',
    to: 'USDC',
    fromName: 'Ethereum',
    toName: 'USD Coin',
    kind: 'crypto',
    description:
      'Ethereum to USD Coin is a high-liquidity pair found on both centralized exchanges and decentralized ' +
      'finance protocols, connecting ether with the USDC stablecoin. Because USDC is redeemable for US ' +
      'dollars through regulated institutions, it is a preferred quote currency for DeFi applications ' +
      'running on the Ethereum network. Developers and users who earn ETH from smart contracts or staking ' +
      'frequently convert to USDC to stabilize the dollar value of their holdings.',
  },
  {
    rank: 29,
    from: 'XRP',
    to: 'USD',
    fromName: 'XRP',
    toName: 'US Dollar',
    kind: 'crypto',
    description:
      'XRP to US Dollar expresses the value of XRP—the digital asset associated with the Ripple payment ' +
      'network—in US dollars. XRP is designed to facilitate fast and low-cost cross-border payments for ' +
      'financial institutions, and this pair is used by traders and institutions monitoring its adoption ' +
      'in global money transfers. Converting XRP to USD is a common step for users who have received ' +
      'payment in XRP and need to settle obligations in traditional currency.',
  },
  {
    rank: 30,
    from: 'ETH',
    to: 'BTC',
    fromName: 'Ethereum',
    toName: 'Bitcoin',
    kind: 'crypto',
    description:
      'Ethereum to Bitcoin is a pure crypto cross rate that shows how many bitcoins one ether is worth, ' +
      'allowing traders to compare the two most prominent blockchain networks directly without converting ' +
      'either to fiat currency. This pair is relevant for investors who want to rotate between ETH and BTC ' +
      'based on their relative performance while staying fully within the crypto ecosystem. It reflects ' +
      'market sentiment about Ethereum\'s utility-driven value proposition versus Bitcoin\'s role as a ' +
      'digital store of value.',
  },
];

/**
 * @typedef {{ question: string, answer: string }} FaqItem
 */

/** @type {FaqItem[]} */
export const FAQ_ITEMS = [
  {
    question: 'What is a currency pair?',
    answer:
      'A currency pair is a quotation of two currencies showing how much of one currency you need ' +
      'to buy a unit of another—for example, EUR/USD tells you how many US dollars one euro will buy. ' +
      'The first currency in the pair is called the base currency and the second is the quote currency. ' +
      'Every currency conversion, whether between fiat currencies or digital assets, involves working with a currency pair.',
  },
  {
    question: 'What are the most popular currency pairs?',
    answer:
      'The most actively traded currency pairs in foreign exchange markets are those involving the ' +
      'US dollar alongside major currencies such as the euro, Japanese yen, British pound, and others ' +
      'like the Canadian dollar and Swiss franc. EUR/USD consistently sees the highest global trading ' +
      'volume because it involves the two largest currency blocs. The relative popularity of a pair ' +
      'depends on trading volume, market liquidity, and the economic significance of the countries involved.',
  },
  {
    question: 'What is the difference between fiat and cryptocurrency pairs?',
    answer:
      'Fiat currency pairs involve government-issued currencies—such as the US dollar, euro, or ' +
      'Japanese yen—whose value is not backed by a physical commodity but by the issuing government\'s ' +
      'authority and monetary policy. Cryptocurrency pairs involve digital assets like Bitcoin or Ethereum, ' +
      'which operate on decentralized networks and are not issued or controlled by any central authority. ' +
      'While fiat pairs are mostly traded on traditional bank and forex platforms during business hours, ' +
      'crypto pairs trade on digital asset exchanges continuously around the clock.',
  },
  {
    question: 'How can I convert between fiat currencies and cryptocurrencies?',
    answer:
      'You can convert between fiat currencies and cryptocurrencies through regulated cryptocurrency ' +
      'exchanges, which accept bank transfers or card payments in exchange for digital assets like ' +
      'Bitcoin or Ethereum. Many exchanges also allow you to sell crypto back to fiat currency and ' +
      'withdraw the proceeds to a bank account. When converting, check the current exchange rate, ' +
      'any applicable fees, and the platform\'s identity verification requirements before transacting.',
  },
];
