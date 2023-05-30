SELECT
  DISTINCT t."tokenAddress" AS "tokenAddress",
  COUNT(t."tokenAddress") AS "holders"
FROM
  (
    SELECT
      "tokenAddress"
    FROM
      (
        SELECT
          "tokenAddress",
          NULLIF("tokenId", '') AS "tokenId",
          "fromAddress" AS "walletAddress",
          COALESCE(- value, - 1 :: numeric) AS "value"
        FROM
          "TokenTransfer"
        UNION
        ALL
        SELECT
          "tokenAddress",
          NULLIF("tokenId", '') AS "tokenId",
          "toAddress" AS "walletAddress",
          COALESCE(value, 1 :: numeric) AS "value"
        FROM
          "TokenTransfer"
      ) AS "transfers"
    WHERE
      "tokenAddress" IN(:contracts)
      AND "tokenAddress" NOT IN(
        SELECT
          "address"
        FROM
          "ContractSpam"
      )
    GROUP BY
      "tokenAddress",
      "walletAddress"
    HAVING
      SUM(value) > 0
  ) AS t
GROUP BY
  "tokenAddress";
