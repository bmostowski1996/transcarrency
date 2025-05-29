import { typeDefs } from './typeDefs.ts'; // or typeDefs.js
import resolversFromFile from './resolvers.ts'; // or resolvers.js
// Export typeDefs and the imported default resolver as 'resolvers'
export { typeDefs, resolversFromFile as resolvers };
// ...existing code...
// index for schemas to be used in the server
