import { takeEvery } from 'redux-saga/effects';
import { Transaction, TransactionResponse, TransactionReceipt, BrowserProvider, Signer } from 'ethers';

import apolloClient from '../apollo/client';
import { Actions, Action, TransactionPayload } from '../types';
import { SaveTransaction } from '../queries';

import { navigate } from '../components/NaiveRouter';

function* sendTransaction({ payload }: Action<TransactionPayload>) {

  // this could have been passed along in a more elegant fashion,
  // but for the purpouses of this scenario it's good enough
  // @ts-ignore
  const walletProvider = new BrowserProvider(window.web3.currentProvider);

  const signer: Signer = yield walletProvider.getSigner();

  /**
   * 3. Fix Redux Saga
   * We start debugging by logging the error.
   * We notice an invalid value at the request value.
   * TypeError: overflow (argument="request.value", value=1000000000000000000, code=INVALID_ARGUMENT, version=6.8.0)
   * We know that numeric literals with absolute values equal to 2^53 or greater are too large to be represented accurately as integers.
   * We change our value to BigInt which is the right primitive to handle large integers.
   */

  const convertToWei = BigInt(1000000000000000000);

  const transaction = {
    to: payload.recipient,
    value: BigInt(payload.amount) * convertToWei,
  };

  try {
    const txResponse: TransactionResponse = yield signer.sendTransaction(transaction);
    const response: TransactionReceipt = yield txResponse.wait();

    const receipt: Transaction = yield response.getTransaction();

    const variables = {
      transaction: {
        gasLimit: (receipt.gasLimit && receipt.gasLimit.toString()) || '0',
        gasPrice: (receipt.gasPrice && receipt.gasPrice.toString()) || '0',
        to: receipt.to,
        from: receipt.from,
        value: (receipt.value && receipt.value.toString()) || '',
        data: receipt.data || null,
        chainId: (receipt.chainId && receipt.chainId.toString()) || '123456',
        hash: receipt.hash,
      }
    };

    yield apolloClient.mutate({
      mutation: SaveTransaction,
      variables,
    });

    /**
     * 4. Navigation & Redirection
     * We observer that by clicking on a transaction we reach its location 
     * (example: http://localhost:3000/transaction/0xd31a52b866ac485523f97a185f661dd267a6b49e9d46a8df98adfa4413579ba3).
     * We replicate this behaviour by using our "NaiveRoute" component and its "navigate" function by passing
     * the transaction hash right after the transaction was succesfull in our "try" block.
    */

    navigate(`/transaction/${receipt.hash}`);

    document.getElementById('close')?.click();
  } catch (error) {
    //
    console.log(error);
  }

}

export function* rootSaga() {
  yield takeEvery(Actions.SendTransaction, sendTransaction);
}
