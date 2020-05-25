import Web3 from 'web3'

export const watch = (deployedContract: any, uri: string, froｍ = 0) => (
	name: string,
	handler: (err: Error, values: {[key: string]: string}) => void
): void => {
	const {contract: deployed} = deployedContract
	const web3WithWebsockets = new Web3(new Web3.providers.WebsocketProvider(uri))
	const {events} = new web3WithWebsockets.eth.Contract(
		deployed._jsonInterface,
		deployed._address
	)

	events.allEvents(
		{fromBlock: froｍ, toBlock: 'latest'},
		(err: Error, e: any) => {
			if (e.event === name) {
				handler(err, e.returnValues)
			}
		}
	)
}

export const waitForEvent = (deployedContract: any, uri: string) => async (
	name: string,
	timeout = 10000
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
): Promise<Error | void> =>
	new Promise((resolve, reject) => {
		setTimeout(() => reject(new Error()), timeout)
		watch(deployedContract, uri)(name, (err) => {
			if (err) {
				return reject(err)
			}

			resolve()
		})
	})

export const getEventValue = (
	deployedContract: any,
	uri: string,
	froｍ = 0
) => async (
	name: string,
	arg: string,
	timeout = 10000
): Promise<Error | string> =>
	new Promise((resolve, reject) => {
		setTimeout(() => reject(new Error()), timeout)
		watch(
			deployedContract,
			uri,
			froｍ
		)(name, (err, values) => {
			if (err) {
				return reject(err)
			}

			resolve(values[arg])
		})
	})
