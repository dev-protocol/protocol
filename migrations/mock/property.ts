export async function createProperty(
	artifacts: Truffle.Artifacts,
	web3: Web3
): Promise<string[]> {
	const propertyAddresses: string[] = []
	async function create(address: string, index: number): Promise<void> {
		const propertyFactoryContract = artifacts.require('PropertyFactory')
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const propertyFactory = await propertyFactoryContract.at(
			propertyFactoryContract.address
		)
		const eventLog = await propertyFactory.create(
			`NAME${index}`,
			`SYMBOL${index}`,
			{
				from: address
			}
		)
		const propertyAddress = await eventLog.logs.filter(
			(e: {event: string}) => e.event === 'Create'
		)[0].args._property
		console.log(`property${index}`)
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`contract address:${propertyAddress}`)
		console.log(`account:${address}`)
		propertyAddresses.push(propertyAddress)
	}
	const userAddresses = await web3.eth.getAccounts()
	//* **Three do not hold a property contract***
	for (let i = 0; i < userAddresses.length - 3; i++) {
		// eslint-disable-next-line no-await-in-loop
		await create(userAddresses[i], i)
	}

	return propertyAddresses
}
