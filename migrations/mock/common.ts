export interface AddressInfo {
	account: string
	property?: string
}

export async function createInstance<T>(
	name: string,
	artifacts: Truffle.Artifacts
): Promise<T> {
	const contract = artifacts.require(name)
	const instance = await contract.at(contract.address)
	return instance
}

export async function createInstanceByAddress<T>(
	name: string,
	address: string,
	artifacts: Truffle.Artifacts
): Promise<T> {
	const contract = artifacts.require(name)
	const instance = await contract.at(address)
	return instance
}
