export type GraphQLResponse = {
	data: {
		account_lockup: Array<{
			property_address: string
			account_address: string
			block_number: number
		}>
	}
}
export type GraphQLPropertyFactoryCreateResponse = {
	data: {
		property_factory_create: Array<{
			property: string
			authentication_aggregate: {
				aggregate: {
					count: number
				}
			}
		}>
	}
}

export type GraphQLPropertyAuthenticationPropertyResponse = {
	data: {
		property_authentication: Array<{
			property: string
		}>
	}
}

export type PromiseReturn<T extends Promise<any>> = T extends Promise<infer P>
	? P
	: never
export type Event = {
	readonly address: string
	readonly blockHash: string
	readonly blockNumber: number
	readonly event: string
	readonly logIndex: number
	readonly raw: {
		readonly data: string
		readonly topics: string
	}
	readonly returnValues: Record<string, string | number>
	readonly signature: string
	readonly transactionHash: string
	readonly transactionIndex: number
}
export type ReceiptEvent = Record<string, Event>
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
