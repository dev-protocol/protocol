import bent from 'bent'
export const graphql = () =>
	bent('https://api.devprtcl.com/v1/graphql', 'POST', 'json')
