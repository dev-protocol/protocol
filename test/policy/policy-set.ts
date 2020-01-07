import {DevProtocolInstance} from '../test-lib/instance'
import {validateErrorMessage} from '../test-lib/error-utils'

contract(
	'PolicySetTest',
	([
		deployer,
		policyFactory,
		dummyPolicyFactory,
		policy1,
		policy2,
		policy3
	]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generatePolicySet()
			await dev.addressConfig.setPolicyFactory(policyFactory, {
				from: deployer
			})
			await dev.policySet.addSet(policy1, {from: policyFactory})
			await dev.policySet.addSet(policy2, {from: policyFactory})
		})
		describe('PolicySet; addSet', () => {
			it('Existing policy cannot be added', async () => {
				const result = await dev.policySet
					.addSet(policy2, {
						from: policyFactory
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'already enabled')
			})
			it('Can not execute addSet without policyFactory address', async () => {
				const result = await dev.policySet
					.addSet(policy3, {
						from: dummyPolicyFactory
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
		describe('PolicySet; count', () => {
			it('Can get setted policy count', async () => {
				const result = await dev.policySet.count()
				expect(result).to.be.equal(2)
			})
		})
		describe('PolicySet; get', () => {
			it('Can get setted policy using index', async () => {
				let result = await dev.policySet.get(0)
				expect(result).to.be.equal(policy1)
				result = await dev.policySet.get(1)
				expect(result).to.be.equal(policy2)
			})
		})
		describe('PolicySet; deleteAll', () => {})
	}
)

// Contract PolicySet is UsingConfig, UsingStorage {
// 	// solium-disable-next-line no-empty-blocks
// 	constructor(address _config) public UsingConfig(_config) {}

// 	function addSet(address _addr) external {
// 		new AddressValidator().validateAddress(
// 			msg.sender,
// 			config().policyFactory()
// 		);

// 		uint256 index = eternalStorage().getUint(getPlicySetIndex());
// 		bytes32 key = getIndexKey(index);
// 		eternalStorage().setAddress(key, _addr);
// 		index++;
// 		eternalStorage().setUint(getPlicySetIndex(), index);
// 	}

// 	function deleteAll() external {
// 		new AddressValidator().validateAddress(
// 			msg.sender,
// 			config().policyFactory()
// 		);

// 		uint256 index = eternalStorage().getUint(getPlicySetIndex());
// 		for (uint256 i = 0; i < index; i++) {
// 			bytes32 key = getIndexKey(index);
// 			eternalStorage().setAddress(key, address(0));
// 		}
// 		eternalStorage().setUint(getPlicySetIndex(), 0);
// 	}

// 	function count() external view returns (uint256) {
// 		return eternalStorage().getUint(getPlicySetIndex());
// 	}

// 	function get(uint256 _index) external view returns (address) {
// 		bytes32 key = getIndexKey(_index);
// 		return eternalStorage().getAddress(key);
// 	}

// 	function getIndexKey(uint256 _index) private pure returns (bytes32) {
// 		return keccak256(abi.encodePacked("_index", _index));
// 	}

// 	function getPlicySetIndex() private pure returns (bytes32) {
// 		return keccak256(abi.encodePacked("_policySetIndex"));
// 	}
// }
