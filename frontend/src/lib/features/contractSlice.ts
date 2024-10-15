import { createAsyncThunk, PayloadAction, SerializedError, createSlice } from '@reduxjs/toolkit';
import { UserState, RegisterUserPayload, RegisterUserThunkArg, GeneralUserThunkArg } from '@/utils/types';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { aptosClient, DEVNET_CLIENT, DEVNET_CONFIG, TESTNET_CLIENT } from '@/utils';
import { NetworkInfo } from '@aptos-labs/wallet-standard';
import { InputViewFunctionData, MoveValue } from '@aptos-labs/ts-sdk';


const initialState: UserState = {
  userData: {},
  status: 'idle',
  error: null
};

const executeBlockchainOperation = createAsyncThunk(
  'user/executeBlockchainOperation',
  async (
    arg: GeneralUserThunkArg,
    { rejectWithValue }
  ) => {
    try {
    const { data, account, signAndSubmitTransaction, functionName } = arg;
    console.log("Account:", account);
    if (!account) return rejectWithValue("Wallet not connected");

    const transaction: InputTransactionData = {
      data: {
        // function: `0x5f41de03d95a6508a8fcc2b3e5fd6f4de75db12ccbd0f3a3a3a79a176433f03d::NewUserRegistry::${data.functionName}`,
        function: `0x66882b8bf7f4c93a76120f77438b16cba049fe8b2e9946ca50821d70a6ee1453::${functionName}::${data.functionName}`,
        typeArguments: data.typeArguments,
        functionArguments: data.functionArguments
      },
      options: data.options
    };


      const response = await signAndSubmitTransaction(transaction);
      console.log("Transaction Response:", response);
      return response;
    } catch (error: any) {
      console.log("Transaction Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

const fetchProposalsThunk = createAsyncThunk(
  'user/fetchProposals',
  async (arg: { address: string }, { rejectWithValue }) => {
    try {
      const { address } = arg;
      const viewPayload: InputViewFunctionData = {
        function: '0x66882b8bf7f4c93a76120f77438b16cba049fe8b2e9946ca50821d70a6ee1453::governance::get_proposals',
        typeArguments: [],
        functionArguments: [address],
      };

      const result: Array<MoveValue> = await TESTNET_CLIENT.view({
        payload: viewPayload,
      });

      return result;
    }
    catch (error: any) {
      console.error('Failed to fetch proposals from view function:', error);
      return rejectWithValue({
        message: error.message,
        errorCode: error?.response?.data?.error_code || null,
        requestUrl: error?.response?.config?.url || null,
      });
    }
  }
);

const fetchUserProfileThunk = createAsyncThunk(
  'user/fetchUserProfile',
  async (arg: { userAddress: string, network: NetworkInfo }, { rejectWithValue }) => {
    const { userAddress, network } = arg;

    try {
      // Create the payload for the view function
      const viewPayload: InputViewFunctionData = {
        function: '0x66882b8bf7f4c93a76120f77438b16cba049fe8b2e9946ca50821d70a6ee1453::NewUserRegistry::view_profile',
        typeArguments: [],
        functionArguments: [userAddress],  // Pass the user address as an argument
      };

      // Call the view function
      const result: Array<MoveValue> = await TESTNET_CLIENT.view({
        payload: viewPayload,
      });

      // Assuming the result contains user profile data as a single object
      if (!result || result.length === 0) {
        throw new Error('User profile not found.');
      }

      const userProfile = result[0]; // Retrieve the first result (the user profile object)

      // Return the user profile data
      console.log(userProfile)
      return userProfile;

    } catch (error: any) {
      console.error('Failed to fetch user profile from view function:', error);

      // Return a serializable error payload
      return rejectWithValue({
        message: error.message,
        errorCode: error?.response?.data?.error_code || null,
        requestUrl: error?.response?.config?.url || null,
      });
    }
  }
);

// const fetchUserProfileThunk = createAsyncThunk(
//   'user/fetchUserProfile',
//   async (arg: { userAddress: string, network: NetworkInfo }, { rejectWithValue }) => {
//     const { userAddress, network } = arg;
//     try {
//       const resourceType = '0x4bd606f80f5a812abfd7d8311098c435ff2a1d7de8531f8abb8240856e2f74a2::NewUserRegistry::UserRegistry';

//       const resource = await DEVNET_CLIENT.getAccountResource({
//         accountAddress:userAddress,
//         resourceType: resourceType
//       });

//       console.log(resource)
//       if (!resource) {
//         throw new Error("User registry not found.");
//       }

//       const tableHandle = resource.users.handle;
//       const tableItemRequest = {
//         key_type: "address",
//         value_type: "0xec5b6f12b10d43f3ef4e1d89fae6c6dbb3ef1313e1caed425e02192e678437b1::NewUserRegistry::User",
//         key: userAddress
//       };

//       const user = await DEVNET_CLIENT.getTableItem({
//         handle: tableHandle,
//         data: tableItemRequest
//       });

//       if (user) {
//         console.log(user)
//         return user;
//       } else {
//         throw new Error("User not found.");
//       }
//     } catch (error: any) {
//       console.error("Failed to fetch user profile:", error);

//       // Transform the error into a serializable format
//       const errorPayload = {
//         message: error.message,
//         errorCode: error?.response?.data?.error_code || null,
//         requestUrl: error?.response?.config?.url || null,
//       };

//       return rejectWithValue(errorPayload);  // Use rejectWithValue to send a serializable error payload
//     }
//   }
// );

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(executeBlockchainOperation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(executeBlockchainOperation.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.userData = action.payload;
      })
      .addCase(executeBlockchainOperation.rejected, (state, action: PayloadAction<unknown, string, { arg: GeneralUserThunkArg; requestId: string; requestStatus: "rejected"; aborted: boolean; condition: boolean; }, SerializedError>) => {
        state.status = 'failed';
        state.error = action.error.message || 'An unknown error occurred';
      })
      .addCase(fetchProposalsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProposalsThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.userData = action.payload; // Store user data from the profile
      })
      .addCase(fetchProposalsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'An unknown error occurred';
      });
  }
});


export default userSlice.reducer;
export { executeBlockchainOperation, fetchUserProfileThunk, fetchProposalsThunk }
