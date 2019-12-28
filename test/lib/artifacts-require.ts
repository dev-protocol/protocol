import {
	AddressConfigContract,
	DecimalsTestContract,
	DevContract,
	MarketFactoryContract,
	MetricsContract,
	MetricsFactoryContract,
	PolicyContract,
	PolicyFactoryContract,
	PropertyContract,
	PropertyFactoryContract,
	LockupContract,
	LockupStorageContract,
	VoteTimesContract,
	VoteTimesStorageContract,
	PropertyGroupContract,
	DecimalsContract
} from '../../types/truffle-contracts'

export type ArtifactsName =
	| 'AddressConfig'
	| 'Decimals'
	| 'Dev'
	| 'MarketFactory'
	| 'Metrics'
	| 'MetricsFactory'
	| 'Policy'
	| 'PolicyFactory'
	| 'Property'
	| 'PolicyFactory'
	| 'Property'
	| 'PropertyFactory'
	| 'MarketFactory'
	| 'Lockup'
	| 'LockupStorage'
	| 'VoteTimes'
	| 'VoteTimesStorage'
	| 'PropertyGroupInstance'
	| 'PropertyGroup'
	| 'Decimals'

export type ReturnTypeArtifactsRequire<
	T extends ArtifactsName
> = T extends 'AddressConfig'
	? AddressConfigContract
	: T extends 'Decimals'
	? DecimalsTestContract
	: T extends 'Dev'
	? DevContract
	: T extends 'MarketFactory'
	? MarketFactoryContract
	: T extends 'Metrics'
	? MetricsContract
	: T extends 'MetricsFactory'
	? MetricsFactoryContract
	: T extends 'Policy'
	? PolicyContract
	: T extends 'PolicyFactory'
	? PolicyFactoryContract
	: T extends 'Property'
	? PropertyContract
	: T extends 'PropertyFactory'
	? PropertyFactoryContract
	: T extends 'MarketFactory'
	? MarketFactoryContract
	: T extends 'Lockup'
	? LockupContract
	: T extends 'LockupStorage'
	? LockupStorageContract
	: T extends 'VoteTimes'
	? VoteTimesContract
	: T extends 'VoteTimesStorage'
	? VoteTimesStorageContract
	: T extends 'PropertyGroup'
	? PropertyGroupContract
	: T extends 'Decimals'
	? DecimalsContract
	: never
