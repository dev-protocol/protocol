// Export async function createmarket(
// 	propertyAddress: string,
// 	artifacts: Truffle.Artifacts
// ): Promise<void> {
// 	const marketAddresses = await createMarketContract(artifacts)
// 	await vote(artifacts, marketAddresses, propertyAddress)
// }
// async function vote(
// 	artifacts: Truffle.Artifacts,
// 	marketAddresses: string[],
// 	propertyAddress: string
// ) : Promise<void> {
// 	const marketContract = artifacts.require('Market')
// 	const marketInstance = await marketContract.at(
// 		marketAddresses[0]
// 	)
// 	await marketInstance.vote(propertyAddress, true)

// }

// async function createMarketContract(
// 	artifacts: Truffle.Artifacts
// ) : Promise<string[]> {
// 	const marketAddresses: string[] = new Array()
// 	const marketFactoryContract = artifacts.require('MarketFactory')
// 	const marketFactory = await marketFactoryContract.at(
// 		marketFactoryContract.address
// 	)
// 	getMarketContractAddresses(artifacts).forEach(marketContractAddresse => {
// 		const eventLog = await marketFactory.create(marketContractAddresse)
// 		const marketAddress = await eventLog.logs.filter(
// 			(e: {event: string}) => e.event === 'Create'
// 		)[0].args._market
// 		marketAddresses.push(marketAddress)
// 	})
// 	return marketAddresses
// }

// function getMarketContractAddresses(artifacts: Truffle.Artifacts): string[] {
// 	const marketContractAddresses: string[] = [
// 		artifacts.require('MarketTest1').address,
// 		artifacts.require('MarketTest2').address,
// 		artifacts.require('MarketTest3').address
// 	]
// 	return marketContractAddresses
// }
