import bent from 'bent'
export const graphql = () =>
	bent('https://api.devprtcl.com/v1/graphql', 'POST', 'json')
export const ethgas = (token: string) =>
	bent(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${token}`, 'json')
