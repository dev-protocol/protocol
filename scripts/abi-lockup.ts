import {AbiItem} from 'web3/node_modules/web3-utils/types'

export const abiLockup = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_config',
				type: 'address'
			}
		],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'constructor'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: '_from',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'address',
				name: '_property',
				type: 'address'
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: '_value',
				type: 'uint256'
			}
		],
		name: 'Lockedup',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'Paused',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'PauserAdded',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'PauserRemoved',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'Unpaused',
		type: 'event'
	},
	{
		constant: true,
		inputs: [],
		name: '_owner',
		outputs: [
			{
				internalType: 'address payable',
				name: '',
				type: 'address'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'addPauser',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'configAddress',
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
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'isPauser',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [],
		name: 'kill',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [],
		name: 'pause',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'paused',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [],
		name: 'renouncePauser',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [],
		name: 'unpause',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'address',
				name: '_from',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			},
			{
				internalType: 'uint256',
				name: '_value',
				type: 'uint256'
			}
		],
		name: 'lockup',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			}
		],
		name: 'cancel',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			}
		],
		name: 'withdraw',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			},
			{
				internalType: 'uint256',
				name: '_interestResult',
				type: 'uint256'
			}
		],
		name: 'increment',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_user',
				type: 'address'
			}
		],
		name: 'calculateInterestAmount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_user',
				type: 'address'
			}
		],
		name: 'calculateWithdrawableInterestAmount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			}
		],
		name: 'withdrawInterest',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		constant: true,
		inputs: [],
		name: 'getAllValue',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			}
		],
		name: 'getPropertyValue',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'address',
				name: '_property',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_sender',
				type: 'address'
			}
		],
		name: 'getValue',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		payable: false,
		stateMutability: 'view',
		type: 'function'
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'uint256',
				name: '_value',
				type: 'uint256'
			}
		],
		name: 'setAllValue',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as AbiItem[]
