#!/usr/bin/env node
import {exec} from 'shelljs'
import * as program from 'commander'

program
	.command('mock')
	.option('-h, --host', 'Network host')
	.option('-p, --port', 'Network port')
	.action((_, [host = '127.0.0.1', port = 7545] = []) => {
		const env = {
			ETHEREUM_MOCK_HOST: host,
			ETHEREUM_MOCK_PORT: port
		}
		exec('npx truffle compile', {env})
		exec('npx truffle migrate --reset --network mock', {env})
	})

program.parse(process.argv)
