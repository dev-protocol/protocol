export type GraphQLResponse = {
	data: {
		account_lockup: Array<{
			property_address: string
			account_address: string
			block_number: number
		}>
	}
}
export type EGSResponse = {
	fast: number
	fastest: number
	safeLow: number
	average: number
	block_time: number
	blockNum: number
	speed: number
	safeLowWait: number
	avgWait: number
	fastWait: number
	fastestWait: number
}
export type PromiseReturn<T extends Promise<any>> = T extends Promise<infer P>
	? P
	: never
type GasPriceFetcher = () => Promise<string>
export type ReceiptEvent = {
	readonly [key: string]: Event
}
export type TxReceipt = {
	readonly blockHash: string
	readonly blockNumber: number
	readonly contractAddress: string | null
	readonly cumulativeGasUsed: number
	readonly events: ReceiptEvent
	readonly from: string
	readonly gasUsed: number
	readonly logsBloom: string
	readonly status: boolean
	readonly to: string
	readonly transactionHash: string
	readonly transactionIndex: number
}
export type SendTx = {
	readonly on: <T extends 'transactionHash' | 'confirmation' | 'error'>(
		type: T,
		callback: T extends 'transactionHash'
			? (hash: string) => void
			: T extends 'confirmation'
			? (confirmationNumber: number, receipt: TxReceipt) => void
			: (err: Readonly<Error>) => void
	) => SendTx
}
