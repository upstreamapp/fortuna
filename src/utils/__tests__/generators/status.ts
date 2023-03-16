import { SyncingState } from '../../../@types/index'
import { Status } from '@models/index'

export default async function mockCreateStatus(
  overrides: Partial<Status> = {}
) {
  await Status.findOrCreate({
    where: {
      id: 'status'
    },
    defaults: {
      id: 'status',
      syncing: false,
      syncingState: SyncingState.BACKFILLING,
      syncingBlocks: [0, 0],
      highestBlock: 0,
      ...overrides
    }
  })
}
