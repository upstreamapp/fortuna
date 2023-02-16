'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import fs from 'fs'
import { QueryTypes } from 'sequelize'
import { sequelize } from 'models/index'
import { getCorrectTokenUrlsByExtension } from 'utils/tokenInfoHelper'

var dir = './tmpMigrationMainnetWrongUrls3'

/**
 * Typescript based sequelize migration
 * @see https://sequelize.org/master/manual/migrations.html
 */

async function main() {
  let hasMore = true
  let currentPage = 1
  const PAGE_SIZE = 5000

  let lastId = 0
  let recordedItemNumber = 0

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  try {
    const d = fs.readFileSync(`${dir}/lastFileId.txt`, 'utf8').split(' ')

    recordedItemNumber = Number(d[0])
    lastId = Number(d[1])
  } catch (e) {
    fs.writeFileSync(`${dir}/lastFileId.txt`, `0 0`)
  }

  while (hasMore) {
    const tokenInfos = await sequelize.query<{
      id: number
      imageUrl: Maybe<string>
      animationUrl: Maybe<string>
    }>(
      `SELECT
      "id",
      "imageUrl",
      "animationUrl"
    FROM
      "TokenInfo"
    WHERE
      (
          ("animationUrl" ilike '%.png'
          OR "animationUrl" ilike '%.gif'
          OR "animationUrl" ilike '%.jpg'
          OR "animationUrl" ilike '%.jpeg'
          OR "animationUrl" ilike '%.jfif'
          OR "animationUrl" ilike '%.pjpeg'
          OR "animationUrl" ilike '%.pjp'
          OR "animationUrl" ilike '%.png'
          OR "animationUrl" ilike '%.svg'
          OR "animationUrl" ilike '%.bmp'
          OR "animationUrl" ilike '%.ico'
          OR "animationUrl" ilike '%.cur'
          OR "animationUrl" ilike '%.tif'
          OR "animationUrl" ilike '%.tiff'
          OR "animationUrl" ilike '%·webp'
          OR "animationUrl" ilike '%.apng'
          OR "animationUrl" ilike '%.avif')
        OR 
          ("imageUrl"  ilike '%.webm'
          OR "imageUrl" ilike '%.mpg'
          OR "imageUrl" ilike '%.mp2'
          OR "imageUrl" ilike '%.mpeg'
          OR "imageUrl" ilike '%.mpe'
          OR "imageUrl" ilike '%.mpv'
          OR "imageUrl" ilike '%.ogg'
          OR "imageUrl" ilike '%.mp4'
          OR "imageUrl" ilike '%.m4p'
          OR "imageUrl" ilike '%.m4v'
          OR "imageUrl" ilike '%.avi'
          OR "imageUrl" ilike '%.wmv'
          OR "imageUrl" ilike '%.mov'
          OR "imageUrl" ilike '%.qt'
          OR "imageUrl" ilike '%.flv'
          OR "imageUrl" ilike '%.swf')
      )
      And id > ${lastId || 0} -- tracking id so we can restart the script
      order by "id" ASC
      limit ${PAGE_SIZE}
      ;`,
      { raw: true, type: QueryTypes.SELECT, logging: console.log }
    )

    if (tokenInfos.length) {
      const fileNameId = tokenInfos[0].id

      lastId = tokenInfos[0].id

      tokenInfos.forEach(tokenInfo => {
        const updatedInfo = getCorrectTokenUrlsByExtension(tokenInfo)

        if (
          updatedInfo.animationUrl === tokenInfo.animationUrl &&
          updatedInfo.imageUrl === tokenInfo.imageUrl
        ) {
          return
        }

        if (updatedInfo) {
          const content = `Update "TokenInfo"
          set 
            ${
              updatedInfo.imageUrl
                ? `"imageUrl" = '${updatedInfo.imageUrl}'`
                : `"imageUrl" =  null`
            }
            ,
            ${
              updatedInfo.animationUrl
                ? `"animationUrl" = '${updatedInfo.animationUrl}'`
                : `"animationUrl" = null`
            } 
          where id = ${tokenInfo.id};\n`

          fs.appendFileSync(`${dir}/file-${fileNameId}.sql`, content)

          lastId = tokenInfo.id

          recordedItemNumber++
        }
      })

      fs.writeFileSync(
        `${dir}/lastFileId.txt`,
        `${recordedItemNumber} ${lastId}`
      )
    }

    hasMore = !!tokenInfos.length
    currentPage++
    console.log(
      `processed page ${currentPage - 1} with ${
        tokenInfos.length
      } items - total item numbers recorded ${recordedItemNumber}`
    )
  }
}

main()
