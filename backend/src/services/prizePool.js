/**
 * Calculate prize pool distribution from subscriber count.
 * 20% of ₹499/month per subscriber enters the pool.
 */
function calculatePrizePool(subscriberCount, rolloverAmount = 0) {
  const perSubscriber = 499 * 0.20; // ₹99.80
  const totalPool = (subscriberCount * perSubscriber) + rolloverAmount;

  return {
    total: parseFloat(totalPool.toFixed(2)),
    pool_5match: parseFloat((totalPool * 0.40).toFixed(2)),
    pool_4match: parseFloat((totalPool * 0.35).toFixed(2)),
    pool_3match: parseFloat((totalPool * 0.25).toFixed(2)),
  };
}

module.exports = { calculatePrizePool };
