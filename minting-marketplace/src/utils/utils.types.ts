import { ChainConfig } from 'viem/_types/types/chain';

export type TNativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
};

export type TAddChainData = {
  chainId: BlockchainType;
  chainName: string;
  nativeCurrency?: TNativeCurrency;
  rpcUrls: Array<string>;
  blockExplorerUrls: Array<string>;
};
export type TChainItemData = {
  testnet?: boolean;
  image: string;
  name: string;
  chainId: BlockchainType;
  symbol: string;
  oreIdAlias: string | undefined;
  addChainData: TAddChainData;
  disabled?: boolean;
  viem?: ChainConfig;
  alchemy?: string;
};
export type TChainData = {
  [key in BlockchainType]?: TChainItemData;
};
