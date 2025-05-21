const typeDefs = `
  type User {
    _id: ID
    name: String
    email: String
    password: String
  }

  type Auth {
    token: ID!
    user: User
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  type Query {
    # Fetch all users
    users: [User]!
    # Fetch a single user by ID
    user(userId: ID!): User
    # Fetch the currently logged-in user's data
    me: User
  }

  type Mutation {
    # Register a new user
    registerUser(input: UserInput!): Auth
    # Login an existing user
    login(email: String!, password: String!): Auth
    # Update a user's information
    updateUser(userId: ID!, input: UserInput!): User
    # Delete a user by ID
    deleteUser(userId: ID!): User
  }
`;

export default typeDefs;