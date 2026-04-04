const { supabaseAdmin } = require('../lib/supabase.js');
const { calculatePrizePool } = require('./prizePool.js');

function generateRandom() {
  const numbers = new Set();
  while (numbers.size < 5) numbers.add(Math.floor(Math.random() * 45) + 1);
  return [...numbers].sort((a, b) => a - b);
}

function generateAlgorithmic(allScores) {
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;
  allScores.forEach(s => { if (s.score >= 1 && s.score <= 45) freq[s.score]++; });
  const pool = [];
  for (let num = 1; num <= 45; num++) {
    const weight = freq[num] + 1;
    for (let i = 0; i < weight; i++) pool.push(num);
  }
  const selected = new Set();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const num of shuffled) {
    if (!selected.has(num)) selected.add(num);
    if (selected.size === 5) break;
  }
  while (selected.size < 5) selected.add(Math.floor(Math.random() * 45) + 1);
  return [...selected].sort((a, b) => a - b);
}

function matchScores(userScores, drawNumbers) {
  const drawSet = new Set(drawNumbers);
  const matched = userScores.filter(s => drawSet.has(s.score)).length;
  return matched >= 3 ? matched : 0;
}

async function runDrawEngine(drawId, type = 'random', existingNumbers = null) {
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users').select('id, email, name, subscription_status').eq('subscription_status', 'active');
  if (usersError) throw new Error('Failed to fetch active users');

  const { data: allScores } = await supabaseAdmin.from('scores').select('user_id, score, created_at');

  // ── Fetch rollover amount from this draw record ───────────
  const { data: drawRecord } = await supabaseAdmin
    .from('draws').select('rollover_amount').eq('id', drawId).single();
  const rolloverAmount = parseFloat(drawRecord?.rollover_amount || 0);

  let drawNumbers;
  if (existingNumbers && existingNumbers.length === 5) drawNumbers = existingNumbers;
  else if (type === 'algorithmic') drawNumbers = generateAlgorithmic(allScores || []);
  else drawNumbers = generateRandom();

  // ── Calculate pool including any jackpot rollover ─────────
  const pool = calculatePrizePool(users.length, rolloverAmount);

  await supabaseAdmin.from('prize_pools').upsert({
    draw_id: drawId, total_pool: pool.total,
    pool_5match: pool.pool_5match, pool_4match: pool.pool_4match, pool_3match: pool.pool_3match,
  }, { onConflict: 'draw_id' });

  const matchResults = [];
  for (const user of users) {
    const userScores = (allScores || [])
      .filter(s => s.user_id === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    const matched = matchScores(userScores, drawNumbers);

    if (matched >= 3) {
      const { data: entry } = await supabaseAdmin.from('draw_entries')
        .upsert({ draw_id: drawId, user_id: user.id, matched, prize_amount: 0 }, { onConflict: 'draw_id,user_id' })
        .select().single();
      if (entry) matchResults.push({ ...entry, user_email: user.email, user_name: user.name });
    } else {
      await supabaseAdmin.from('draw_entries')
        .upsert({ draw_id: drawId, user_id: user.id, matched: null, prize_amount: 0 }, { onConflict: 'draw_id,user_id' });
    }
  }

  const distribute = async (winners, poolAmount) => {
    if (winners.length === 0) return;
    const perWinner = poolAmount / winners.length;
    for (const w of winners) {
      await supabaseAdmin.from('draw_entries').update({ prize_amount: perWinner }).eq('id', w.id);
      w.prize_amount = perWinner;
    }
  };

  await distribute(matchResults.filter(e => e.matched === 5), pool.pool_5match);
  await distribute(matchResults.filter(e => e.matched === 4), pool.pool_4match);
  await distribute(matchResults.filter(e => e.matched === 3), pool.pool_3match);

  return { drawNumbers, entries: matchResults, pool };
}

module.exports = { runDrawEngine };
