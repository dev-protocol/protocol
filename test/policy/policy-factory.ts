contract('PolicyFactory', () => {
	describe('PolicyFactory; createPolicy', () => {
		it('Returns the new Policy address when Policy implementation is passed')
		it('Emit event the new Policy when Policy implementation is passed')
		it('If the first Policy, the Policy becomes valid')
		it(
			'If other than the first Policy, the Policy is waiting for enable by the voting'
		)
		it('A new Policy has a method that `vote`')
	})
	describe('A new Policy; vote', () => {
		it(
			'The number of lock-ups for it Property and the accumulated Market reward will be added to the vote when a Property owner votes for'
		)
		it(
			'The number of votes PolicyVoteCounter is added when the Property owner voted'
		)
		it(
			'PolicyVoteCounter votes will not be added when a vote by other than Property owner voted for'
		)

		it(
			'The number of lock-ups for it Property and the accumulated Market reward will be added to the vote against when a Property owner votes against'
		)
		it(
			'The number of votes PolicyVoteCounter is added when the Property owner votes against'
		)
		it(
			'PolicyVoteCounter votes will not be added when a vote by other than Property owner voted against'
		)

		it(
			'When an account of other than Property owner votes for, the number of lock-ups in the Property by its account will be added to the vote'
		)

		it('Calling `convergePolicy` method when approved by Policy.policyApproval')

		it('Should fail when 1st args is not Property address')
		it('Should fail voting to the already enable Policy')
		it('Should fail to vote when after the voting period')
		it(
			'Should fail to vote when the number of lockups and the market reward is 0'
		)
		it('Should fail to vote when already voted')
	})
	describe('PolicyFactory; convergePolicy', () => {
		it('Change the current Policy by passing a Policy')
		it('Killing another Policy when changing Policy')
		it('Should fail when a call from other than Policy')
	})
})
