import { typeDefs } from './typeDefs'; // or typeDefs.js
// Import the default export from './resolvers' and alias it
import resolversFromFile from './resolvers'; // or resolvers.js

// Export typeDefs and the imported default resolver as 'resolvers'
export { typeDefs, resolversFromFile as resolvers };