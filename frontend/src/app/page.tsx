'use client'

import { useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { WalletSelector } from '@/components/WalletSelector';
import { BarsComponent } from '@/components/BarsComponent';
import { VortexComponent } from '@/components/ui/VortexComponent';
import Method from '@/components/Method';

const LandingPage = () => {
  return (
    <div className="">
      <VortexComponent />
    </div>
  );
};

export default function Home() {
  return <Method/>
}

// export default function Home() {
//   const { account, connected } = useWallet();
//   const [loading, setLoading] = useState(true); 
//   const router = useRouter();

//   const checkIfRegistered = async (address: string) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const isRegistered = localStorage.getItem(`isRegistered-${address}`) === 'true';
//         resolve(isRegistered);
//       }, 2000);
//     });
//   };

//   useEffect(() => {
//     const handleWalletConnection = async () => {
//       if (connected && account?.address) {
//         setLoading(true); 

//         const isRegistered = await checkIfRegistered(account.address);
        
//         if (true) {
//           router.push('/home');
//         } else {
//           router.push('/register');
//         }
//       } else {
//         setLoading(false); 
//       }
//     };

//     handleWalletConnection();
//   }, [connected, account, router]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <BarsComponent/>
//       </div>
//     );
//   }

//   return (
//       <LandingPage />
//   );
// }
