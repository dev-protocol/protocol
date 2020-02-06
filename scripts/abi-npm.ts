import {AbiItem} from 'web3/node_modules/web3-utils/types'

export const abiNpm = [
	{
		constant: true,
		inputs: [
			{
				internalType: 'string',
				name: '_package',
				type: 'string'
			}
		],
		name: 'getMetrics',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	}
] as AbiItem[]
