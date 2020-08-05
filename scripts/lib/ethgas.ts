/* eslint-disable no-undef */
import bent from 'bent'
import Web3 from 'web3'
import {EGSResponse} from './types'

export const createEGSFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (): Promise<EGSResponse> =>
	fetcher('').then((r) => (r as unknown) as EGSResponse)

export const createFastestGasPriceFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) =>
	((egs) => async () =>
		egs().then((res) =>
			(web3 as Web3).utils.toWei(`${res.fastest / 10}`, 'Gwei')
		))(createEGSFetcher(fetcher))
