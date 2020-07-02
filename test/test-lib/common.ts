import BigNumber from 'bignumber.js'
export const toBigNumber = (v: any): BigNumber => new BigNumber(v.toString())
