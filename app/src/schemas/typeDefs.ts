// GraphQL schema definitions
export const typeDefs = `
  # A single maintenance service record for a vehicle
  type ServiceRecord {
    _id: ID!
    date: String
    type: String!
    cost: Float
    mileage: Int
    notes: String
    shop: String
    invoiceUrl: String
  }

  # Main Vehicle type
  type Vehicle {
    _id: ID!
    owner: ID!           # Reference to the user who owns the vehicle
    make: String!        # Manufacturer (e.g., Toyota)
    model: String!       # Model (e.g., Camry)
    year: Int!           # Year of manufacture
    vin: String          # Vehicle Identification Number
    mileage: Int         # Current mileage of the vehicle
    serviceHistory: [ServiceRecord]  # List of service records for this vehicle
  }

  # Input type for creating or updating a service record
  input ServiceRecordInput {
    date: String
    type: String!
    cost: Float
    mileage: Int
    notes: String
    shop: String
    invoiceUrl: String
  }

  # Input type for creating or updating a vehicle
  input VehicleInput {
    make: String!
    model: String!
    year: Int!
    vin: String
    mileage: Int
    serviceHistory: [ServiceRecordInput]
  }

  # Represents a single vehicle part
  type VehiclePart {
    PartName: String
    PartType: String
    # Additional fields can be added here based on the NHTSA API response
  }

  # Queries available in the API
  type Query {
    # Get a vehicle by its unique ID
    getVehicleById(id: ID!): Vehicle

    # Get all vehicles owned by a specific user
    getVehiclesByUser(ownerId: ID!): [Vehicle]

    # Search parts related to a vehicle
    vehicleParts(vin: String, make: String, model: String, year: Int, type: String): [VehiclePart]

    # Get currently logged-in user profile
    me: User

    # Fetch all users
    users: [User]!
    # Fetch a single user by ID
    user(userId: ID!): User
  }

  # Auth token and user data returned after login or registration
  type Auth {
    token: ID!
    user: User
  }

  # Input for registering or updating a user
  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  # User type definition
  type User {
    _id: ID
    name: String
    email: String
    password: String
  }

  # Mutations available in the API
  type Mutation {
    # Register a new user
    registerUser(input: UserInput!): Auth

    # Login an existing user
    login(email: String!, password: String!): Auth

    # Update a user's information
    updateUser(userId: ID!, input: UserInput!): User

    # Delete a user by ID
    deleteUser(userId: ID!): User

    # Register a new vehicle to a user
    registerVehicle(ownerId: ID!, input: VehicleInput!): Vehicle

    # Transfer a vehicle to a new owner
    transferOwnership(vehicleId: ID!, newOwnerId: ID!): Vehicle

    # Add a new service record to a vehicle
    addServiceRecord(vehicleId: ID!, record: ServiceRecordInput!): Vehicle

    # Remove a service record from a vehicle
    removeServiceRecord(vehicleId: ID!, recordId: ID!): Vehicle

    # Upload an invoice to a specific service record
    uploadInvoice(vehicleId: ID!, recordId: ID!, invoiceUrl: String!): Vehicle
  }
`;

export default typeDefs;

