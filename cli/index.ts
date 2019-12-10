#!/usr/bin/env node
import {exec} from 'shelljs'
import * as program from 'commander'
import {writeFileSync} from 'fs'

program
	.command('mock')
	.option('-h, --host', 'Network host')
	.option('-p, --port', 'Network port')
	.action((_, [host = '127.0.0.1', port = 7545] = []) => {
		writeFileSync(
			'.env',
			`ETHEREUM_MOCK_HOST=${host as string}
			ETHEREUM_MOCK_PORT=${port as number}`.replace(/\t/g, '')
		)
		exec('truffle compile')
		exec('truffle migrate --reset --network mock')
	})

program.parse(process.argv)
