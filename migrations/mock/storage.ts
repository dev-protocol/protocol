export async function createStorage(
	artifacts: Truffle.Artifacts
): Promise<void> {
	async function create(contractName: string): Promise<void> {
		const contract = artifacts.require(contractName)
		const contractInstance = await contract.at(contract.address)
		await contractInstance.createStorage()
		const storageAddress = await contractInstance.getStorageAddress()
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`${contractName} address:${storageAddress}`)
	}

	await create('AllocatorStorage')
	await create('WithdrawStorage')
	await create('LockupStorage')
	await create('MarketGroup')
	await create('MetricsGroup')
	await create('PolicyGroup')
	await create('PolicySet')
	await create('PropertyGroup')
	await create('VoteCounterStorage')
	await create('VoteTimesStorage')
}
