import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LightSmartContractAccount } from '@alchemy/aa-accounts';
import { AccountSigner } from '@alchemy/aa-ethers';
import {
  BigNumber,
  Contract,
  ContractReceipt,
  ContractTransaction
} from 'ethers';
import { JSONObject } from 'oreid-js';
import { useOreId } from 'oreid-react';
import { encodeFunctionData } from 'viem';

import useSwal from './useSwal';

import { RootState } from '../ducks';
import { setChainId } from '../ducks/contracts/actions';
import { ContractsInitialType } from '../ducks/contracts/contracts.types';
import { TUsersInitialState } from '../ducks/users/users.types';
import chainData from '../utils/blockchainData';
import { rFetch } from '../utils/rFetch';

const confirmationsRequired = 2;

const useWeb3Tx = () => {
  const { currentChain, currentUserAddress, programmaticProvider } =
    useSelector<RootState, ContractsInitialType>(
      (store) => store.contractStore
    );
  const { loginType } = useSelector<RootState, TUsersInitialState>(
    (store) => store.userStore
  );
  const oreId = useOreId();
  const reactSwal = useSwal();
  const dispatch = useDispatch();
  const handleReceipt = useCallback(
    async (transactionHash: string, callback?: (() => void) | undefined) => {
      try {
        await rFetch(`/api/transaction/${currentChain}/${transactionHash}`, {
          method: 'POST'
        });
        callback && callback();
      } catch (error) {
        console.error(error);
      }
    },
    [currentChain]
  );

  const handleWeb3Error = useCallback(
    (errorMessage: any, defaultError: string | undefined = undefined) => {
      // console.info('Reason:', errorMessage.reason);
      // console.info('Code', errorMessage.code);
      // console.info('Error', errorMessage.error);
      // console.info('Method', errorMessage.method);
      // console.info('Transaction', errorMessage.transaction);

      let cleanError = '';

      if (errorMessage.cancelled) {
        cleanError = 'The transaction has been cancelled!';
      } else if (
        errorMessage?.transaction?.blockNumber === null &&
        errorMessage?.receipt?.status === 0
      ) {
        cleanError = 'The transaction has failed on the blockchain';
      } else if (errorMessage.receipt) {
        //console.info('Repriced');
        handleReceipt(errorMessage.receipt);
        return true;
      }

      // Attempt #1: Smart Contract Error
      // Will have a readable revert message for the user
      if (!cleanError) {
        if (
          errorMessage?.error?.message &&
          !errorMessage.error.message.includes('0x')
        ) {
          cleanError = errorMessage?.error?.message;
        }
      }
      if (!cleanError) {
        cleanError = errorMessage?.data?.message;
      }

      // Attempt #2: Frontend Error
      // An error from sending the data to the blockchain
      if (!cleanError) {
        cleanError = errorMessage.reason;
      }

      // Attempt #3: Mid-Processing Error
      // Huge message that needs to be cleaned up
      if (!cleanError) {
        cleanError = errorMessage?.message;
        if (!cleanError) {
          cleanError = errorMessage
            ?.toString()
            ?.split("'message':'execution reverted: ")
            ?.at(1)
            ?.split("'")
            ?.at(0);
        }
      }

      // Last Attempt: Default Error Message
      if (
        !cleanError ||
        cleanError?.includes('=') ||
        cleanError?.includes('0x')
      ) {
        cleanError = defaultError
          ? defaultError
          : 'An unexpected error has ocurred on your transaction, please try again later.';
      }
      console.error(errorMessage);

      reactSwal.fire('Error', cleanError, 'error');
      return false;
    },
    [handleReceipt, reactSwal]
  );

  const metamaskCall = useCallback(
    async (
      contract: Contract,
      method: string,
      args: any[],
      options?: {
        failureMessage?: string;
        callback?: () => void;
      }
    ) => {
      let paramsValidation: ContractTransaction;
      if (!contract[method]) {
        console.error(`Error calling function ${method}, no method found`);
        return false;
      }
      try {
        paramsValidation = await contract[method](...args);
      } catch (errorMessage) {
        return handleWeb3Error(errorMessage, options?.failureMessage);
      }
      if (paramsValidation?.wait) {
        let transactionReceipt: ContractReceipt;
        try {
          transactionReceipt = await paramsValidation.wait(
            confirmationsRequired
          );
        } catch (errorMessage) {
          return handleWeb3Error(errorMessage, options?.failureMessage);
        }
        if (transactionReceipt && transactionReceipt.blockNumber) {
          handleReceipt(transactionReceipt.transactionHash, options?.callback);
        }
        return true;
      }
      return paramsValidation;
    },
    [handleReceipt, handleWeb3Error]
  );

  const web3AuthCall = useCallback(
    async (
      contract: Contract,
      method: string,
      args: any[],
      options: {
        failureMessage?: string;
        callback?: () => void;
        intendedBlockchain: BlockchainType;
      }
    ) => {
      if (!currentUserAddress || !programmaticProvider) {
        return;
      }
      const methodFound = Object.keys(contract.interface.functions).find(
        (item) => item.includes(`${method}(`)
      );
      if (
        methodFound &&
        contract.interface.functions[methodFound].stateMutability === 'view'
      ) {
        // If the method is a view function, query the info directly through Ethers
        return await contract[method](...args);
      }
      const fragment = contract.interface.fragments.find((fragment) => {
        return fragment.name === method;
      });
      let transactionValue: bigint = BigInt(0);
      if (args.at(-1).value) {
        transactionValue = BigInt(args.pop().value);
      }
      const uoCallData = encodeFunctionData({
        abi: [fragment],
        functionName: method,
        args: args
      });
      const userOperation = await (
        programmaticProvider as AccountSigner<LightSmartContractAccount>
      )
        .sendUserOperation({
          target: contract.address as `0x${string}`,
          data: uoCallData,
          value: transactionValue
        })
        .catch((err) => {
          reactSwal.fire('Error', err.details, 'error');
        });
      if (!userOperation?.hash) {
        return false;
      }
      try {
        const txHash = await (
          programmaticProvider as any
        ).waitForUserOperationTransaction(userOperation.hash);
        handleReceipt(txHash, options?.callback);
        return true;
      } catch (err: any) {
        console.info(err);
        reactSwal.fire('Error', err.toString(), 'error');
      }
    },
    [currentUserAddress, programmaticProvider, handleReceipt, reactSwal]
  );

  const oreIdCall = useCallback(
    async (
      contract: Contract,
      method: string,
      args: any[],
      options: {
        failureMessage?: string;
        callback?: () => void;
        intendedBlockchain: BlockchainType;
      }
    ) => {
      if (!oreId.isInitialized) {
        reactSwal.fire('OreID error', 'Please login', 'error');
      }
      // Use the Ethers contract to populate the transaction
      const transactionBody = await contract.populateTransaction[method](
        ...args
      );
      /*
    Used for debugging
    const userBalance = await contract.provider.getBalance(
      contract.signer.getAddress()
    );
    */

      const methodsFound = Object.keys(contract.interface.functions).find(
        (item) => item.includes(`${method}(`)
      );
      if (
        methodsFound &&
        contract.interface.functions[methodsFound].stateMutability === 'view'
      ) {
        // If the method is a view function, query the info directly through Ethers
        return await contract[method](...args);
      }
      if (args.length && args.at(-1).value) {
        let estimatedGas;
        try {
          estimatedGas = await contract.estimateGas[method](...args);
        } catch (error) {
          return handleWeb3Error(error);
        }
        const totalValue = BigNumber.from(args.at(-1).value).add(estimatedGas);
        args[args.length - 1] = {
          value: totalValue.toString()
        };
      }
      const userChainAccounts = oreId.auth.user.data.chainAccounts;
      // Find the ETH public address
      const ethAccount = userChainAccounts.find(
        (account) =>
          account.chainNetwork ===
          chainData[options?.intendedBlockchain]?.oreIdAlias
      );

      if (!ethAccount) {
        reactSwal.fire('Error', 'No accounts found', 'error');
        return;
      }
      // Cleanup any BigNumber values (convert to string)
      const convertedTransactionBody: JSONObject = {};
      Object.keys(transactionBody).forEach((key) => {
        convertedTransactionBody[key] = transactionBody[key]._isBigNumber
          ? transactionBody[key].toString()
          : transactionBody[key];
      });
      convertedTransactionBody.from = ethAccount.chainAccount;
      try {
        const transaction = await oreId.createTransaction({
          transaction: convertedTransactionBody,
          chainAccount: ethAccount.chainAccount,
          chainNetwork: ethAccount.chainNetwork,
          signOptions: {
            broadcast: true
          }
        });
        // launch popup to have the user approve signature
        const response = await oreId.popup.sign({ transaction });
        if (response.transactionId) {
          await contract.provider.waitForTransaction(
            response.transactionId,
            confirmationsRequired
          );
          handleReceipt(response.transactionId, options?.callback);
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error(error);
        reactSwal.fire('Error', 'An error has occurred', 'error');
        return false;
      }
    },
    [handleReceipt, handleWeb3Error, oreId, reactSwal]
  );

  const metamaskSwitch = async (chainId: BlockchainType) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId && chainData[chainId]?.chainId }]
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainId && chainData[chainId]?.addChainData]
          });
        } catch (addError) {
          console.error(addError);
        }
      } else {
        console.error(switchError);
      }
    }
  };

  const hasOreIdSupport = useCallback(
    (chainId: BlockchainType) => {
      const oreIdAlias = chainData[chainId]?.oreIdAlias;
      if (!oreIdAlias) {
        return undefined;
      }
      for (const accountData of oreId.auth.user.data.chainAccounts) {
        if (accountData.chainNetwork === oreIdAlias) {
          return accountData.chainAccount;
        }
      }
    },
    [oreId]
  );

  const web3TxHandler = useCallback(
    async (
      contract: Contract,
      method: string,
      args: any[] = [],
      options: {
        failureMessage?: string;
        callback?: () => void;
        intendedBlockchain: BlockchainType;
      } = { intendedBlockchain: currentChain as BlockchainType }
    ) => {
      if (!currentUserAddress) {
        console.error(`Login required for Web3 call ${method}`);
        return;
      }
      switch (loginType) {
        case 'oreid':
          if (!options) {
            return;
          }
          return oreIdCall(contract, method, args, options);
        case 'metamask':
          return metamaskCall(contract, method, args, options);
        case 'web3auth':
          return web3AuthCall(contract, method, args, options);
        default:
          reactSwal.fire('Error', 'Please login', 'error');
      }
    },
    [
      currentChain,
      currentUserAddress,
      loginType,
      metamaskCall,
      oreIdCall,
      reactSwal,
      web3AuthCall
    ]
  );

  const web3Switch = useCallback(
    async (chainId: BlockchainType) => {
      if (!currentUserAddress) {
        // It's necessary that the user logs in because that's how we know
        //  if we need to switch using Metamask or OreID.
        reactSwal.fire('Please login');
        return;
      }
      switch (loginType) {
        case 'oreid':
          // eslint-disable-next-line no-case-declarations
          const oreIdAddress = hasOreIdSupport(chainId);
          if (!oreIdAddress) {
            reactSwal.fire(
              'Error',
              `${chainData[chainId]?.name} isn't currently supported`,
              'error'
            );
            return;
          }
          dispatch(setChainId(chainId, oreIdAddress));
          return;
        case 'metamask':
          if (chainData[chainId]?.disabled) {
            return;
          }
          return metamaskSwitch(chainId);
      }
    },
    [currentUserAddress, dispatch, hasOreIdSupport, loginType, reactSwal]
  );

  const correctBlockchain = useCallback(
    (chainId: BlockchainType) => {
      return chainId === currentChain;
    },
    [currentChain]
  );

  return {
    correctBlockchain,
    web3Switch,
    web3TxHandler
  };
};

export default useWeb3Tx;
