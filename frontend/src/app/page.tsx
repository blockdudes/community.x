'use client'

import { useEffect, useState } from 'react';
import { Network, useWallet } from '@aptos-labs/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { WalletSelector } from '@/components/WalletSelector';
import { BarsComponent } from '@/components/BarsComponent';
import { VortexComponent } from '@/components/ui/VortexComponent';
import axios from 'axios';
import { fetchUserProfileThunk } from '@/lib/features/contractSlice';
import { useAppDispatch } from '@/lib/hooks';
import { Toaster } from 'react-hot-toast';


const LandingPage = () => {
  return (
    <div className="">
      <VortexComponent />
    </div>
  );
};

export default function Home() {
  const { account, connected } = useWallet();
  const [loading, setLoading] = useState(!connected);
  const router = useRouter();
  const dispatch = useAppDispatch();

  console.log('state',connected)

  const checkIfRegistered = async (address: string): Promise<any> => {
    try {
      const userAddress = account?.address;
      const isAuth = (await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/${userAddress}`))?.data?.isAuth;
      const networkInfo = { chainId: 1, name: "testnet" as Network };
      const response = await dispatch(fetchUserProfileThunk({ userAddress: userAddress || "", network: networkInfo }));
      console.log(response.meta.requestStatus === "fulfilled", isAuth)
      if (response.meta.requestStatus === "fulfilled" && isAuth) {
        return true
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && account?.address) {
        setLoading(true);
        const isRegistered = await checkIfRegistered(account.address);
        console.log(isRegistered)
        if (isRegistered) {
          router.push('/home');
        } else {
          router.push('/register');
        }
      } else {
        setLoading(false);
      }
    };

    handleWalletConnection();
  }, [connected, account, router, account]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarsComponent />
      </div>
    );
  }

  return (
    <LandingPage />
  );
}
