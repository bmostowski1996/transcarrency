import { gql } from '@apollo/client';

export const QUERY_PROFILES = gql`
  query allProfiles {
    profiles {
      _id
      name
      email
      skills
    }
  }
`;

export const QUERY_SINGLE_PROFILE = gql`
  query singleProfile($profileId: ID!) {
    profile(profileId: $profileId) {
      _id
      name
      email
      skills
    }
  }
`;

export const QUERY_ME = gql`
  query me {
    me {
      _id
      name
      email
      skills
    }
  }
`;

export const QUERY_VEHICLES_BY_USER = gql`
  query getVehiclesByUser($ownerId: ID!) {
    getVehiclesByUser(ownerId: $ownerId) {
      _id
      make
      model
      year
      vin
      mileage
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
      mileage
      serviceHistory {
        _id
        date
        type
        cost
        mileage
        notes
        shop
        invoiceUrl
      }
    }
  }
`;
