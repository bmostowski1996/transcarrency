import { typeDefs } from './typeDefs'; // or typeDefs.js
import resolversFromFile from './resolvers'; // or resolvers.js

// Export typeDefs and the imported default resolver as 'resolvers'
export { typeDefs, resolversFromFile as resolvers };

// ...existing code...

// index for schemas to be used in the server

