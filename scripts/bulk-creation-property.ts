import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import PQueue from 'p-queue'
import { DevCommonInstance } from './lib/instance/common'
import { PropertyFactory } from './lib/instance/property-factory'
import { getPropertyAddress } from '../test/test-lib/utils/log'

config()
const {
	CONFIG: configAddress,
	EGS_TOKEN: egsApiKey,
	INCUBATOR: incubator,
} = process.env

const list = [
	{
		name: '11ty',
		symbol: 'ELE',
	},
	{
		name: 'Ethers',
		symbol: 'ETJ',
	},
	{
		name: 'MediaWiki',
		symbol: 'WIKI',
	},
	{
		name: 'rotki',
		symbol: 'ROT',
	},
	{
		name: 'Umbra',
		symbol: 'UMB',
	},
	{
		name: 'BrightID',
		symbol: 'BID',
	},
	{
		name: 'WomenWhoCode',
		symbol: 'WWC',
	},
	{
		name: 'prettier',
		symbol: 'PRE',
	},
	{
		name: 'Rust',
		symbol: 'RS',
	},
	{
		name: 'vite',
		symbol: 'VIT',
	},
	{
		name: 'Deno',
		symbol: 'DEN',
	},
	{
		name: 'Jekyll',
		symbol: 'JKL',
	},
	{
		name: 'Prysm',
		symbol: 'PRY',
	},
	{
		name: 'Signal',
		symbol: 'SIG',
	},
	{
		name: 'WalletConnect',
		symbol: 'WAL',
	},
	{
		name: 'ESLint',
		symbol: 'ESL',
	},
	{
		name: 'Lighthouse',
		symbol: 'LIG',
	},
	{
		name: 'Python',
		symbol: 'PY',
	},
	{
		name: 'Snowpack',
		symbol: 'SNW',
	},
	{
		name: 'Web3j',
		symbol: 'WEJ',
	},
]
const data = (own: string) => list.map((x) => ({ ...x, author: own }))

const ADDITIONAL_FEE = '250000000000000000000000'
const BALANCE_OF_INCUBATOR = '9250000000000000000000000'
const TREASURY = '0x8F9dc5C9CE6834D8C9897Faf5d44Ac36CA073595'

const queue = new PQueue({ concurrency: 2 })

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey || !incubator) {
		return
	}

	const [, author] = await web3.eth.getAccounts()

	const gasFetcher = async () => 1700000
	const gasPriceFetcher = ethGasStationFetcher(egsApiKey)
	const dev = new DevCommonInstance(
		artifacts,
		configAddress,
		gasFetcher,
		gasPriceFetcher
	)
	await dev.prepare()

	const properties = data(author)

	const createProperty = async (address: string) =>
		Promise.all([artifacts.require('Property').at(address)]).then(([x]) => x)
	const pf = new PropertyFactory(dev)
	const pfc = await pf.load()

	/**
	 * =========================
	 * 1. Create Properties in bulk
	 * =========================
	 */
	const createdTxs = await queue.addAll(
		properties.map((prop) => async () =>
			pfc
				.create(prop.name, prop.symbol, prop.author, await dev.gasInfo)
				.catch((err) => {
					console.log(1, err)
				})
		)
	)

	/**
	 * ==============================
	 * 2. Generate all Property Instance
	 * ==============================
	 */
	const createProperties = await Promise.all(
		createdTxs.map(async (tx) =>
			tx
				? createProperty(getPropertyAddress(tx)).catch((err) => {
						console.log(2, err)
				  })
				: tx
		)
	)

	/**
	 * ================================
	 * 3. Transfer additional fees in bulk
	 * ================================
	 */
	await queue.addAll(
		createProperties.map((prop) => async () =>
			prop
				? prop
						.transfer(TREASURY, ADDITIONAL_FEE, await dev.gasInfo)
						.catch((err) => {
							console.log(3, err)
						})
				: prop
		)
	)

	/**
	 * =================================
	 * 4. Transfer remaining amount in bulk
	 * =================================
	 */
	await queue.addAll(
		createProperties.map((prop) => async () =>
			prop
				? prop
						.transfer(incubator, BALANCE_OF_INCUBATOR, await dev.gasInfo)
						.catch((err) => {
							console.log(4, err)
						})
				: prop
		)
	)

	/**
	 * =============================
	 * 5. Transfer authority in bulk
	 * =============================
	 */
	await queue.addAll(
		createProperties.map((prop) => async () =>
			prop
				? prop.changeAuthor(incubator, await dev.gasInfo).catch((err) => {
						console.log(5, err)
				  })
				: prop
		)
	)

	callback(null)
}

export = handler
