import { gql } from '@apollo/client';

export const QUERY_USER = gql`
  query allUsers {
    users {
      _id
      name
      email
      vehicles {
        _id
        make
        model
        year
        vin
        licensePlate
        mileage
        serviceRecords {
          date
          type
          cost
          mileage
          notes
          shop
          recommendedPrice
        }
      }
    }
  }
`;

export const QUERY_SINGLE_USER = gql`
  query singleUser($userId: ID!) {
    user(userId: $userId) {
      _id
      name
      email
      vehicles {
        _id
        make
        model
        year
        vin
        licensePlate
        mileage
        serviceRecords {
          date
          type
          cost
          mileage
          notes
          shop
          recommendedPrice
        }
      }
    }
  }
`;

// Written based on what I expect the back-end code to look like.
// TODO: The back-end code must be adjusted to reflect this structure
export const QUERY_ME = gql`
  query me {
    me {
      _id
      name
      email
      vehicles {
        _id
        make
        model
        year
        vin
        licensePlate
        mileage
        serviceRecords {
          date
          type
          cost
          mileage
          notes
          shop
          recommendedPrice
        }
      }
    }
  }
`;

export const QUERY_VEHICLES_BY_USER = gql`
  query getVehiclesByUser($ownerId: ID!) {
    user(userId: $ownerId) { {
      _id
      vehicles {
        _id
        make
        model
        year
      }
    }
  }
`;

export const QUERY_VEHICLE_BY_ID = gql`
  query getVehicleById($id: ID!) {
    getVehicleById(id: $id) {
      _id
      make
      model
      year
      vin
      licensePlate
      mileage
      serviceRecords {
        date
        type
        cost
        mileage
        notes
        shop
        recommendedPrice
      }
    }
  }
`;
