import { Contract } from 'ethers'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

export const watch =
	(deployedContract: any) =>
	(
		name: string,
		handler: (err: Error, values: Record<string, string>) => void
	): void => {
		const deployed = deployedContract as {
			_jsonInterface: AbiItem[]
			_address: string
		}
		const web3WithWebsockets = new Web3(
			new Web3.providers.WebsocketProvider(web3.eth.currentProvider.host)
		)
		const { events } = new web3WithWebsockets.eth.Contract(
			deployed._jsonInterface,
			deployed._address
		) as Contract

		events.allEvents((err: Error, e: any) => {
			if (e.event === name) {
				handler(err, e.returnValues)
			}
		})
	}

export const waitForEvent =
	(deployedContract: any) =>
	async (name: string, timeout = 10000): Promise<Error | void> =>
		new Promise((resolve, reject) => {
			setTimeout(() => {
				reject(new Error())
			}, timeout)
			watch(deployedContract)(name, (err) => {
				if (err) {
					reject(err)
					return
				}

				resolve()
			})
		})

export const getEventValue =
	(deployedContract: any) =>
	async (name: string, arg: string, timeout = 10000): Promise<Error | string> =>
		new Promise((resolve, reject) => {
			setTimeout(() => {
				reject(new Error())
			}, timeout)
			watch(deployedContract)(name, (err, values) => {
				if (err) {
					reject(err)
					return
				}

				resolve(values[arg])
			})
		})
