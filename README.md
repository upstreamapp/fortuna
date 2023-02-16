# Fortuna

Fortuna is a highly available and fault-tolerant service that monitors the Ethereum Mainnet and Goerli Test Network for `transfer` events and stores these events along with the metadata of the tokens being transferred in a Postgres database.

As a comprehensive ETL solution, Fortuna supports the indexing of all token types, including ERC20, ERC721, and ERC1155. It allows you to quickly retrieve wallet and contract token balances while also extracting the metadata from all tokens, granting you the ability to get unparalleled access to every token's rich data.

## Architecture

<p align="center">
<img width="600px" src="https://github.com/upstreamapp/fortuna/blob/main/public/images/fortuna_architecture.jpg" />
</p>

Fortuna contains three components:

1. Monitoring server
2. Querying server
3. Token info server

### Monitoring Server

The monitoring server is responsible for ingesting all transfer events in the Ethereum Mainnet and Goerli Test Network. It's also responsible for submitting tokens to the token info server so they can be further processed and their metadata extracted.

It's divided into two stages:

1. Backfill processing
2. Realtime processing

#### Backfilling

During the backfilling stage, Fortuna's goal is to backfill all of the transfer events that it hasn't indexed until the latest processed block. On first start, this means from the very first transfer event ever created. The backfilling stage is critical because it's the mechanism that allows Fortuna to be fault-tolerant, as it enables Fortuna to pick itself right back up from the last processed block and continue with its work.

#### Realtime

During the realtime stage, Fortuna's primary focus is to listen to block creation events and process events from the created block using the same block processing functionality present in the backfilling stage.

- `GET /health`
  Get the health of the monitoring server by checking if the database and Eth client are connected.
  | Parameter | Format | Description |
  | --- | ----------- | -------- |
  | **/address** | _string_ | The wallet Ethereum/Goerli address
  | **enrich** (optional) | _boolean_ | Have the token balances returned also include the token metadata |
  | **refreshMissing** (optional) | _boolean_ | Have the metadata of tokens that have been indexed but have not had their metadata extracted, be extracted |

  - Response (example)

  ```
  OK.
  ```

- `GET /status`
  Get a snapshot of the current status of the monitoring server.
  | Parameter | Format | Description |
  | --- | ----------- | -------- |
  | **/address** | _string_ | The wallet Ethereum/Goerli address
  | **enrich** (optional) | _boolean_ | Have the token balances returned also include the token metadata |
  | **refreshMissing** (optional) | _boolean_ | Have the metadata of tokens that have been indexed but have not had their metadata extracted, be extracted |

  - Response (example)

  ```
  {
    "dbConnection": true,
    "ethClientConnection": true,
    "highestBlock": 16543200,
    "syncing": true,
    "syncingState": "Realtime",
    "syncingFromBlock": 16543200,
    "syncingToBlock": 16543201
  }
  ```

### Querying Server

The querying server allows for the reading of the data present within Fortuna's data store. It allows one to query token balances for wallets and/or contracts. It also enables users to enrich the balance returns to include metadata for the tokens. While querying, users can submit tokens that have been ingested but have yet to have their metadata extracted into the token info server.

Supported queries:

- `GET /balances/:address`
  Submit a wallet address that you would like to retrieve the token balances for.
  | Parameter | Format | Description |
  | --- | ----------- | -------- |
  | **/address** | _string_ | The wallet Ethereum/Goerli address
  | **enrich** (optional) | _boolean_ | Have the token balances returned also include the token metadata |
  | **refreshMissing** (optional) | _boolean_ | Have the metadata of tokens that have been indexed but have not had their metadata extracted, be extracted |

  - Response (example)

  ```
  [
    {
      "tokenAddress": "0x21054c78268ebe2eb107d773903803848110d5b4",
      "walletAddress": "0xec8c4a3644338a534940ba4858cdb01432dec075",
      "balance": "100000000000000000000",
      "tokenId": null
    }
  ]
  ```

- `POST /balances`
  Submit a list of wallets and/or contracts you would like to retrieve the token balances for. If both wallets and contracts are submitted, the result will include balances for wallet addresses associated with one of the contracts passed in.
  | Parameter | Format | Description |
  | --- | ----------- | -------- |
  | **wallets** (optional) | _string[]_ | The addresses of the Ethereum/Goerli wallets
  | **contracts** (optional) | _string[]_ | The addresses of the Ethereum/Goerli contracts
  | **enrich** (optional) | _boolean_ | Have the token balances returned also include the token metadata |
  | **refreshMissing** (optional) | _boolean_ | Have the metadata of tokens that have been indexed but have not had their metadata extracted, be extracted |

  - Response (example)

  ```
  {
    "tokenAddress": "0x21054c78268ebe2eb107d773903803848110d5b4",
    "walletAddress": "0xec8c4a3644338a534940ba4858cdb01432dec075",
    "balance": "100000000000000000000",
    "tokenId": null,
    "token": {
      "contract": {
        "address": "0x21054c78268ebe2eb107d773903803848110d5b4",
        "type": "ERC_20",
        "name": "UPSTREAM",
        "symbol": "UP",
        "decimals": 18
      },
      "token": {
        "id": null,
        "name": null,
        "description": null,
        "imageUrl": null,
        "imageData": null,
        "externalUrl": null,
        "animationUrl": null,
        "youtubeUrl": null
      },
      "lastUpdated": "2022-09-30T22:34:18.440Z"
    }
  }
  ```

### Token Info Server

The token info server is responsible for consuming a queue of all the tokens that must have their metadata extracted. Tokens make their way into this queue through the monitoring or querying server. It is possible that, at any time, some tokens have their metadata updated, and to ensure that metadata is kept somewhat fresh, Fortuna refreshes a token's metadata every time that token is transferred and however many days is listed under `TOKEN_INFO_MAX_AGE_IN_DAYS` has gone by since the token was last updated.

### Database Structure

#### TokenTransfer

The `TokenTransfer` table consists of all of the token transfer events.

| Column Name         | Data Type      | Is Nullable |
| ------------------- | -------------- | ----------- |
| **tokenType**       | _TokenType_    | _No_        |
| **tokenAddress**    | _varchar(255)_ | _No_        |
| **fromAddress**     | _varchar(255)_ | _No_        |
| **toAddress**       | _varchar(255)_ | _No_        |
| **operator**        | _varchar(255)_ | _Yes_       |
| **tokenId**         | _varchar(255)_ | _Yes_       |
| **value**           | _numeric_      | _Yes_       |
| **transactionHash** | _varchar(255)_ | _No_        |
| **logIndex**        | _int4_         | _No_        |
| **blockNumber**     | _int4_         | _No_        |

#### TokenInfo

The `TokenInfo` table consists of all of the metadata for the tokens present within the `TokenTransfer` table.

| Column Name          | Data Type      | Is Nullable |
| -------------------- | -------------- | ----------- |
| **id**               | _int4_         | _No_        |
| **address**          | _varchar(255)_ | _No_        |
| **tokenId**          | _varchar(255)_ | _Yes_       |
| **tokenType**        | _TokenType_    | _Yes_       |
| **contractName**     | _text_         | _Yes_       |
| **symbol**           | _text_         | _Yes_       |
| **decimals**         | _int4_         | _Yes_       |
| **tokenName**        | _text_         | _Yes_       |
| **tokenDescription** | _text_         | _Yes_       |
| **imageUrl**         | _text_         | _Yes_       |
| **imageData**        | _text_         | _Yes_       |
| **externalUrl**      | _text_         | _Yes_       |
| **animationUrl**     | _text_         | _Yes_       |
| **youtubeUrl**       | _text_         | _Yes_       |
| **tokenUri**         | _text_         | _Yes_       |
| **updatedAt**        | _timestamptz_  | _No_        |

#### Status

The `Status` table consists of the current monitoring status.

| Column Name       | Data Type      | Is Nullable |
| ----------------- | -------------- | ----------- |
| **id**            | _varchar(255)_ | _No_        |
| **syncing**       | _bool_         | _No_        |
| **syncingState**  | _SyncingState_ | _No_        |
| **syncingBlocks** | _\_int4_       | _No_        |
| **highestBlock**  | _int4_         | _No_        |
| **updatedAt**     | _timestamptz_  | _No_        |

#### ContractSpam

The `ContractSpam` table consists of all of the contracts that you consider to be spam. All addresses added here are not included in the responses from the `querying server.`

| Column Name | Data Type      | Is Nullable |
| ----------- | -------------- | ----------- |
| **id**      | _int4_         | _No_        |
| **address** | _varchar(255)_ | _No_        |

### Environment Variables

| Environment Name          | Example                                                                       | Description                                                                                                                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BACKFILL_BATCH            | _2_                                                                           | The number of blocks to fetch during each call to the Ethereum node while in the backfill stage.                                                                                                                                               |
| BACKFILL_PARALLEL_QUERIES | _5_                                                                           | The number of parallel queries to make to the Ethereum node while in the backfill stage during each pass. BACKFILL_BATCH \* BACKFILL_PARALLEL_QUERIES === the total number of blocks fetched from the Ethereum node during each loop.          |
| DATABASE_URL              | _postgresql://postgres:mypassword@localhost:5432/mydb?schema=sample_          | The url to the database where all of Fortuna's data is stored.                                                                                                                                                                                 |
| GOERLI_RPC_PROVIDER_URL   | *http://goerli-geth.geth.svc.cluster.local:3000/*                             | The Goerli node URL from which Fortuna should get its blockchain data from.                                                                                                                                                                    |
| MAINNET_RPC_PROVIDER_URL  | *http://mainnet-geth.geth.svc.cluster.local:3000/*                            | The Mainnet node URL from which Fortuna should get its blockchain data from.                                                                                                                                                                   |
| MONITORING_PORT           | _4000_                                                                        | The port from which the Monitoring Server should listen from.                                                                                                                                                                                  |
| QUERYING_PORT             | _5000_                                                                        | The port from which the Querying Server should listen from.                                                                                                                                                                                    |
| REALTIME_BATCH            | _1_                                                                           | The number of blocks to fetch during each call to the Ethereum node while in the realtime stage.                                                                                                                                               |
| REALTIME_PARALLEL_QUERIES | _1_                                                                           | The number of parallel queries to make to the Ethereum node while in the realtime stage during each pass. REALTIME_BATCH \* REALTIME_PARALLEL_QUERIES === the total number of blocks fetched from the Ethereum node during each loop.          |
| SQL_DEBUG                 | _false_                                                                       | A boolean representing whether Sequelize should be logging as a result of being in debug mode.                                                                                                                                                 |
| SQL_TIMEZONE              | _-08:00_                                                                      | The SQL timezone used for writing to the database.                                                                                                                                                                                             |
| SQS_URL                   | *https://sqs.us-west-2.amazonaws.com/000000000000/fortuna-mainnet-token-info* | The SQS URL used by the Token Info Server.                                                                                                                                                                                                     |
| TOKEN_INFO_BATCH          | _5_                                                                           | The value of the Token Info Server consumer's `batchSize` used to signify how many messages we want processed in parallel.                                                                                                                     |
| TOKEN_INFO_CLUSTER_MODE   | _false_                                                                       | A boolean used within the Token Info Server so that cluster mode can be activated, allowing for the creation of Node.js child processes to run multiple instances of the Token Info Server and distribute the workload among multiple threads. |

### Fortuna Client

Fortuna also has a built-in client that allows one to interface with the Querying Server. To use, import the `FortunaClient` from `@upstreamapp/fortuna`, and create an instance of the client `FortunaClient.`

```
import { FortunaClient } from `@upstreamapp/fortuna`

const fortunaClient = new FortunaClient({
  ethGoerli: FORTUNA_GOERLI,
  ethMainnet: FORTUNA_MAINNET
})
```

#### API

| Method Name   | Parameters                                                                                                                                | Description                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `getBalance`  | _{ address: string; network: EthNetwork; enrich?: boolean \| undefined; refreshMissing?: boolean \| undefined; }_                         | Get the token balances of a wallet address.                                                                              |
| `getBalances` | _{ network: EthNetwork; wallets?: string[]; contracts?: string[] enrich?: boolean \| undefined; refreshMissing?: boolean \| undefined; }_ | Get the token balances of multiple wallet address that are optionally present in the contracts passed in as an argument. |

### Key Features

#### Idempotency

There are scenarios where Fortuna could find itself processing blocks that have already been processed. As a result, Fortuna makes use of its unique constraints to maintain the integrity of the transfers and token metadata that are tracked. In the case of indexed transfers, Fortuna does not insert transfers that have already happened. In the case of token metadata, Fortuna performs an upsert.

#### Fault Tolerance

Applications fail for various reasons, and knowing how to handle such failures gracefully is a hallmark of great software. Fortuna is no different. It was designed to perform its backfilling step from the highest processed block, conveniently cached and updated in the `Status` table, up until the latest processed block in the blockchain it's indexing. Then, once it reaches the latest mined block, Fortuna switches its focus toward realtime processing. While simple, this two-step approach ensures that Fortuna can pick itself back up and not leave any blocks behind.

#### Highly Available

Fortuna comes built-in with Kubernetes support allowing anyone to deploy several instances backed by the same or multiple databases if one so chooses.

## Machine Specs

As of Mainnet block `16637001` and Goerli block `8498264`, the Fortuna DB is composed of `595 GB` of data for Mainnet and `68 GB` of data for Goerli. We have opted to go with AWS' Aurora PostgreSQL instance `db.x2g.xlarge`, equiped with 4 vCPUs and 64 GB of RAM.

## Start DEV Environment

- Install Docker in your machine
- Then run `npm install`
- Then run `npm run build`
- Then run `make docker-compose-dev-no-doppler`, or `make docker-compose-dev` if you're using Doppler, to start the local db
- Then run `npm run migration:up`
- Lastly run `npm run start:querying` or `npm run start:monitoring`. If you're a user of Doppler for your secrets manager, use all commands that begin with `start`. If not, use the commands without `start`, i.e. `npm run querying`.

## Switch between Mainnet or Goerli on local dev

- Mainnet: switch the `ETH_NETWORK` to `mainnet`
- Goerli: switch the `ETH_NETWORK` to `goerli`

## DEV migration

- Run `npm run migration:create name="a_descriptive_name"`
