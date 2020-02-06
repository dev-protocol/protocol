import {AbiItem} from 'web3/node_modules/web3-utils/types'

export const abiMetrics = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_market',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			}
		],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'constructor'
	},
	{
		constant: true,
		inputs: [],
		name: 'market',
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
	},
	{
		constant: true,
		inputs: [],
		name: 'property',
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
