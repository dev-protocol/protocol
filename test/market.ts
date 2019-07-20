contract('Market', () => {
	describe('schema', () => {
		it('Get Schema of mapped Behavior Contract')
	})

	describe('authenticate', () => {
		it('Proxy to mapped Behavior Contract')
	})

	describe('authenticatedCallback', () => {
		it('Create a new Metrics Contract')

		it(
			'Market Contract address and Property Contract address are mapped to the created Metrics Contract'
		)

		it(
			'Should fail to create a new Metrics Contract when sent from non-Behavior Contract'
		)
	})

	describe('calculate', () => {
		it('Proxy to mapped Behavior Contract')
	})

	describe('vote', () => {
		it('Vote in favor, votes are the number of DEVs held by the sender')

		it(
			'Vote as a negative vote, votes are the number of DEVs held by the sender'
		)

		it(
			'When votes for more than 10% of the total supply of DEV are obtained, and if there are more positive votes than negative votes, this Market Contract is enabled'
		)

		it(
			'When votes for more than 10% of the total supply of DEV are obtained, and if there are more negative votes than positive votes, this Market Contract is disabled'
		)

		it('Should fail to vote when already determined enabled/ disabled')
	})
})
