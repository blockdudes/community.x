import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";

// types.ts
export interface UserState {
  userData: any;  // Define more specific type based on expected user data structure
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Assume these are in @/utils/types or appropriately defined elsewhere
export interface RegisterUserPayload {
  username: string;
  profilePicture: string;
  description: string;
}

// Define the thunk argument type including account and transaction methods
export interface RegisterUserThunkArg {
  data: RegisterUserPayload;
  account: any; // Consider using a more specific type if available
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<any>;
}

export interface BlockchainOperationArg {
  functionName: string;
  typeArguments: any[];
  functionArguments: any[];
  options: { maxGasAmount: number };
}

export interface UpdateUserPayload {
  new_username: string;
  profile_picture_url: string;
  description: string;
}

export interface GeneralUserThunkArg {
  data: BlockchainOperationArg;
  account: any;
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<any>;
  
}