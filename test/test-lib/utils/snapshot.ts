export const takeSnapshot = async () =>
	new Promise((resolve, reject) => {
		web3.currentProvider.send(
			{
				jsonrpc: '2.0',
				method: 'evm_snapshot',
				id: new Date().getTime(),
			},
			(err: Error, snapshotId: number) => {
				if (err) {
					reject(err)
				}

				resolve(snapshotId)
			}
		)
	})

export const revertToSnapshot = async (id: string) =>
	new Promise((resolve, reject) => {
		web3.currentProvider.send(
			{
				jsonrpc: '2.0',
				method: 'evm_revert',
				params: [id],
				id: new Date().getTime(),
			},
			(err: Error, result: unknown) => {
				if (err) {
					reject(err)
				}

				resolve(result)
			}
		)
	})

export type Snapshot = {
	id: number
	jsonrpc: string
	result: string
}
