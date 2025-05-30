import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
  mutation registerUser($input: UserInput!) {
    registerUser(input: $input) {
      token
      user {
        _id
        name
        email
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        name
        email
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($userId: ID!, $input: UserInput!) {
    updateUser(userId: $userId, input: $input) {
      _id
      name
      email
    }
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
      _id
      name
    }
  }
`;

// How does this mutation work?
// I don't think our code uses it right now...
export const REGISTER_VEHICLE = gql`
  mutation registerVehicle($ownerId: ID!, $input: VehicleInput!) {
    registerVehicle(ownerId: $ownerId, input: $input) {
      _id
      make
      model
      year
      vin
      mileage
    }
  }
`;

// This one looks straightforward, but I don't think our front-end supports functionality to easily utilize it right now.
export const TRANSFER_OWNERSHIP = gql`
  mutation transferOwnership($vehicleId: ID!, $newOwnerId: ID!) {
    transferOwnership(vehicleId: $vehicleId, newOwnerId: $newOwnerId) {
      _id
      owner
    }
  }
`;

// This one is straightforward, except what's a invoiceUrl?
export const ADD_SERVICE_RECORD = gql`
  mutation addServiceRecord($vehicleId: ID!, $record: ServiceRecordInput!) {
    addServiceRecord(vehicleId: $vehicleId, record: $record) {
      _id
      serviceHistory {
        _id
        type
        date
        cost
        mileage
        notes
        shop
        invoiceUrl
      }
    }
  }
`;

export const REMOVE_SERVICE_RECORD = gql`
  mutation removeServiceRecord($vehicleId: ID!, $recordId: ID!) {
    removeServiceRecord(vehicleId: $vehicleId, recordId: $recordId) {
      _id
      serviceHistory {
        _id
      }
    }
  }
`;

// What's an invoice URL?
export const UPLOAD_INVOICE = gql`
  mutation uploadInvoice($vehicleId: ID!, $recordId: ID!, $invoiceUrl: String!) {
    uploadInvoice(vehicleId: $vehicleId, recordId: $recordId, invoiceUrl: $invoiceUrl) {
      _id
      serviceHistory {
        _id
        invoiceUrl
      }
    }
  }
`;