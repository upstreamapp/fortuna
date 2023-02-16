SELECT
  "tokenAddress",
  "walletAddress",
  SUM(value) AS "balance",
  "tokenId"
FROM
  (
    SELECT
      "tokenAddress",
      NULLIF("tokenId", '') AS "tokenId",
      "fromAddress" AS "walletAddress",
      COALESCE (- value, -1 :: numeric) AS "value"
    FROM
      "TokenTransfer"
    UNION
    ALL
    SELECT
      "tokenAddress",
      NULLIF("tokenId", '') AS "tokenId",
      "toAddress" AS "walletAddress",
      COALESCE (value, 1 :: numeric) AS "value"
    FROM
      "TokenTransfer"
  ) AS "transfers"
WHERE
  "walletAddress" IN (:wallets)
  AND "tokenAddress" NOT IN (SELECT "address" FROM "ContractSpam")
GROUP BY
  "walletAddress",
  "tokenAddress",
  "tokenId"
HAVING
  SUM(value) > 0
ORDER BY
  "balance" DESC;
