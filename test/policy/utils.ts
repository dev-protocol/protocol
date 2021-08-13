import BigNumber from 'bignumber.js'

const random = (): BigNumber =>
	((f) => new BigNumber(f()).times(f().slice(0, 1)))((): string =>
		Math.random().toString().replace('0.', '')
	)
export const batchRandom = (): BigNumber[] => [
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
]
