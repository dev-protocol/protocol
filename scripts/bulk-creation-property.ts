import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import PQueue from 'p-queue'
import { DevCommonInstance } from './lib/instance/common'
import { PropertyFactory } from './lib/instance/property-factory'

config()
const {
	CONFIG: configAddress,
	EGS_TOKEN: egsApiKey,
	AUTHOR: author,
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

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey || !author) {
		return
	}

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

	const pf = new PropertyFactory(dev)
	const pfc = await pf.load()

	await new PQueue({ concurrency: 2 }).addAll(
		properties.map((prop) => async () =>
			pfc.create(prop.name, prop.symbol, prop.author)
		)
	)

	callback(null)
}

export = handler
