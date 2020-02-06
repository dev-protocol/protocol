/* eslint-disable no-undef */
import {get} from 'request-promise'
import {all} from 'promise-parallel-throttle'
import BigNumber from 'bignumber.js'

/*
 * This file should delete after fixes to #321.
 *
 * Usage:
 *
 * # Build
 * > npm run build
 *
 * # Execute this script
 * > npx truffle exec ./scripts/get-total-locked-up-value.js --network mainnet
 **/

type Pkgs = Array<{
	package: string
	address: string
	user: string
	date: string
}>

const handler = async function(
	callback: (err: Error | null, res?: void) => void
): Promise<void> {
	console.log('started')
	const [npm, lockup, metricsGroup, pkgs] = await Promise.all([
		artifacts
			.require('INpmMarket')
			.at('0x52E5cbE96ebe53541e3cBe9fb05cf45a078EdB45'),
		artifacts
			.require('Lockup')
			.at('0x71A25Bb05C68037B867E165c229D0c30e73f07Ad'),
		artifacts
			.require('MetricsGroup')
			.at('0x19B57D7e23FA2753261cAdaE7b5287D17bb83033'),
		get({
			uri: 'https://dev-distribution.now.sh/config/packages',
			json: true
		}).then((x: Pkgs) => x)
	])
	const totalAssets = await metricsGroup
		.totalIssuedMetrics()
		.then(x => Number(x))
	console.log(totalAssets, pkgs.length)

	if (totalAssets !== pkgs.length) {
		throw new Error('mismatch')
	}

	let count = new BigNumber(0)

	const reqs = pkgs.map(pkg => async () => {
		const v = await npm
			.getMetrics(pkg.package)
			.then(async address =>
				Promise.all([artifacts.require('Metrics').at(address)])
			)
			.then(async ([metrics]) => metrics.property())
			.then(async property => lockup.getPropertyValue(property))
			.then(x => new BigNumber(x))

		console.log(`*** ${pkg.package}, ${pkg.address}: ${v.toFixed()}`)
		count = count.plus(v)
	})

	await all(reqs, {maxInProgress: 10})

	console.log('*** Aggregate is completed ***')
	console.log('*** Count:')
	console.log()
	console.log(count.toFixed())
	console.log()
	console.log('******************************')

	callback(null)
}

export = handler
