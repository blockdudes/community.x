'use client'
import Image from "next/image";
import { WalletSelector as ShadcnWalletSelector } from "@/components/WalletSelector";
import { useAppDispatch } from "@/lib/hooks";
import { executeBlockchainOperation, fetchProposalsThunk, fetchUserProfileThunk } from "@/lib/features/contractSlice";
import { BlockchainOperationArg, GeneralUserThunkArg, RegisterUserPayload, RegisterUserThunkArg, UpdateUserPayload } from "@/utils/types";
import { Network, NetworkInfo, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect } from "react";
import Method from "@/components/Method";
import MainPage from "@/components/MainPage";


export default function Home() {

  return (
    <div className="h-full w-full p-4 bg-gray-100">
      {/* <Method /> */}
      <MainPage />
    </div>
  );
}
