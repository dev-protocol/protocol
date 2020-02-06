import {config} from 'dotenv'
import {get} from 'request-promise'
import {all} from 'promise-parallel-throttle'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import {abiNpm} from './abi-npm'
import {abiLockup} from './abi-lockup'
import {abiMetricsGroup} from './abi-metrics-group'
import {abiMetrics} from './abi-metrics'

config()

/*
 * This file should delete after fixes to #321.
 *
 * Usage:
 *
 * # Clean-up
 * > rm -f scripts/*.js
 *
 * # Build
 * > npm run build
 *
 * # Execute this script
 * > node ./scripts/get-total-locked-up-value.js
 **/

type Pkgs = Array<{
	package: string
	address: string
	user: string
	date: string
}>

const createMetrics = (
	web3: Web3,
	address: string
): InstanceType<Web3['eth']['Contract']> =>
	new web3.eth.Contract(abiMetrics, address)
;(async () => {
	const {ETHEREUM_PROVIDERS_MAINNET} = process.env
	if (ETHEREUM_PROVIDERS_MAINNET === undefined) {
		console.log('missing option')
		return
	}

	const web3 = new Web3(ETHEREUM_PROVIDERS_MAINNET)

	const npm = new web3.eth.Contract(
		abiNpm,
		'0x52E5cbE96ebe53541e3cBe9fb05cf45a078EdB45'
	)
	const lockup = new web3.eth.Contract(
		abiLockup,
		'0x71A25Bb05C68037B867E165c229D0c30e73f07Ad'
	)
	const metricsGroup = new web3.eth.Contract(
		abiMetricsGroup,
		'0x19B57D7e23FA2753261cAdaE7b5287D17bb83033'
	)
	const pkgs = await get({
		uri: 'https://dev-distribution.now.sh/config/packages',
		json: true
	}).then((x: Pkgs) => x)

	const totalAssets = await metricsGroup.methods
		.totalIssuedMetrics()
		.call()
		.then((x: string) => Number(x))
	console.log(totalAssets, pkgs.length)

	if (totalAssets !== pkgs.length) {
		throw new Error(
			'mismatch number of total-issued-metrics and number of packages'
		)
	}

	const counts: BigNumber[] = []
	let _counts = new BigNumber(0)

	const reqs = pkgs.map(pkg => async () => {
		const count: BigNumber = await npm.methods
			.getMetrics(pkg.package)
			.call()
			.then(async (address: string) =>
				createMetrics(web3, address)
					.methods.property()
					.call()
			)
			.then(async (property: string) =>
				lockup.methods.getPropertyValue(property).call()
			)
			.then((x: string) => new BigNumber(x))

		console.log(`*** ${pkg.package}, ${pkg.address}: ${count.toFixed()}`)
		counts.push(count)
		_counts = _counts.plus(count)
	})

	await all(reqs, {maxInProgress: 10})

	const result = counts.reduce((prev, x) => prev.plus(x), new BigNumber(0))

	if (result.isEqualTo(_counts) === false) {
		throw new Error('there is a bug in some calculation methods')
	}

	console.log('*** Aggregate is completed ***')
	console.log('*** Count:')
	console.log()
	console.log(result.toFixed())
	console.log()
	console.log('******************************')
})()
