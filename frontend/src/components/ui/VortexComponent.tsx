import { Vortex } from "./vortex";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { WalletSelector } from "../WalletSelector";

export function VortexComponent() {
  const navigate = useRouter();

  return (
    <div className="w-full bg-black mx-auto rounded-md h-[100vh] overflow-hidden">
      <Vortex
        backgroundColor="black"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <h2 className="text-white text-3xl md:text-7xl font-bold text-center leading-tight">
          CommunityX
        </h2>
        <p className="text-white text-base md:text-3xl max-w-xl mt-4 text-center leading-normal">
          A Community Management Platform
        </p>
        <p className="text-white text-base md:text-xl max-w-2xl mt-4 text-center leading-relaxed">
          Ideal for DAOs, CommunityX facilitates seamless communication and governance in a decentralized environment, empowering members to collaborate effectively.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 z-50">
          <WalletSelector />
        </div>
      </Vortex>
    </div>
  );
}