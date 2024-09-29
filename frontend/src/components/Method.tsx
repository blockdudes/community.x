import React from 'react'
import Image from "next/image";
import { WalletSelector as ShadcnWalletSelector} from './WalletSelector';
import { useAppDispatch } from "@/lib/hooks";
import { executeBlockchainOperation, fetchProposalsThunk, fetchUserProfileThunk } from "@/lib/features/contractSlice";
import { BlockchainOperationArg, GeneralUserThunkArg, RegisterUserPayload, RegisterUserThunkArg, UpdateUserPayload } from "@/utils/types";
import { Network, NetworkInfo, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect } from "react";

const Method = () => {

    const dispatch = useAppDispatch();
    const { account, signAndSubmitTransaction, network } = useWallet();
  
    useEffect(() => {
      if (!account || !account.address) {
        console.log("No account connected or account address missing.");
        return;
      }
  
      const userAddress = account?.address; 
      const networkInfo = { chainId: 1, name: "devnet" as Network }; 
      // Dispatch the fetchUserProfileThunk to load the user profile
      // dispatch(fetchUserProfileThunk({ userAddress, network: networkInfo })); // Use networkInfo object
      dispatch(fetchProposalsThunk());
    }, [dispatch, account]);
  
  
    const handleUpdate = () => {
      if (!account || !account.address) {
        console.log("No account connected or account address missing.");
        return;
      }
  
      const userData: UpdateUserPayload = {
        new_username: "update_username",
        profile_picture_url: "update_profile_picture_url",
        description: "update_description"
      }
      const operationArg: BlockchainOperationArg = {
        functionName: "update_profile",
        typeArguments: [],
        functionArguments: [userData.new_username, userData.profile_picture_url, userData.description],
        options: { maxGasAmount: 1000 }
      };
  
      const thunkArg: GeneralUserThunkArg = {
        data: operationArg,
        account: account,
        signAndSubmitTransaction: signAndSubmitTransaction,
      };
  
      dispatch(executeBlockchainOperation(thunkArg));
  
    };
  
    const handleRegister = () => {
      if (!account || !account.address) {
        console.log("No account connected or account address missing.");
        return;
      }
    
      const userData: RegisterUserPayload = {
        username: "test2",
        profilePicture: "test12",
        description: "test12"
      };
    
      const operationArg: BlockchainOperationArg = {
        functionName: "register_user",
        typeArguments: [],
        functionArguments: [userData.username, userData.profilePicture, userData.description],
        options: { maxGasAmount: 1000 }
      };
    
      const thunkArg: GeneralUserThunkArg = {
        data: operationArg,
        account: account,
        signAndSubmitTransaction: signAndSubmitTransaction,
      };
    
      dispatch(executeBlockchainOperation(thunkArg));
    };
    
    const handleCreateProposal = () => {
      if (!account || !account.address) {
        console.log("No account connected or account address missing.");
        return;
      }
  
      const proposalData: {proposal_id: String, message: String} = {
        proposal_id: "test2",
        message: "test12",
      };
  
      const operationArg: BlockchainOperationArg = {
        functionName: "create_proposal",
        typeArguments: [],
        functionArguments: [proposalData.proposal_id, proposalData.message],
        options: { maxGasAmount: 1000 }
      };
  
      const thunkArg: GeneralUserThunkArg = {
        data: operationArg,
        account: account,
        signAndSubmitTransaction: signAndSubmitTransaction,
      };
  
      dispatch(executeBlockchainOperation(thunkArg));
    }
  
    const handleVoteProposal = () => {
      if (!account || !account.address) {
        console.log("No account connected or account address missing.");
        return;
      }
      
      const voteData: {proposal_id: String, vote: boolean} = {
        proposal_id: "test2",
        vote: true,
      };
  
      const operationArg: BlockchainOperationArg = {
        functionName: "vote_proposal",
        typeArguments: [],
        functionArguments: [voteData.proposal_id, voteData.vote],
        options: { maxGasAmount: 1000 }
      };
  
      const thunkArg: GeneralUserThunkArg = {
        data: operationArg,
        account: account,
        signAndSubmitTransaction: signAndSubmitTransaction,
      };
  
      dispatch(executeBlockchainOperation(thunkArg));
  
    }
  

    
    return (
        <div className="h-screen w-full">
            <div className="flex gap-4 items-center justify-center h-full flex-col sm:flex-row">
                <ShadcnWalletSelector />
                <button onClick={handleRegister}>Register</button>
                <button onClick={handleUpdate}>update_profile</button>
                <button onClick={handleCreateProposal}>create_proposal</button>
                <button onClick={handleVoteProposal}>vote_proposal</button>
            </div>
        </div>
    )
}

export default Method
