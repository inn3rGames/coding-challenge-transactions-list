import { gql } from '@apollo/client';

/**
 * 1. GraphQL Query
 * We start fixing the GraphQL query by taking a look at our client.
 * We notice that our "TransactionsList" component queries transactions using the "GetAllTransactions" query.
 * Since we are getting a 400 status code from the server we start comparing the schemas from both the client and the server.
 * We can clearly see that the "receipt" field is not present on the server schema and we also remove it from the client schema.
 * Now our query is valid.
 */

export const GetAllTransactions = gql`
  query GetAllTransactions {
    getAllTransactions {
      gasLimit
      gasPrice
      to
      from
      value
      data
      chainId
      hash
    }
  }
`;

export const GetSingleTransaction = gql`
  query GetSingleTransaction($hash: String!) {
    getTransaction(hash: $hash) {
      gasLimit
      gasPrice
      to
      from
      value
      data
      chainId
      hash
    }
  }
`;

export const SaveTransaction = gql`
  mutation SaveTransaction($transaction: TransactionInput!) {
    addTransaction(transaction: $transaction) {
      hash
    }
  }
`;
