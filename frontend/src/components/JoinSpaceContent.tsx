import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, ImageIcon, Loader2 } from 'lucide-react';
import ReadMore from './ReadMore';
import { Checkbox } from './ui/checkbox';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPrivateSpace } from '@/lib/features/FetchPrivateSpaceSlice';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { privateSpaceType } from '@/types/privateTypes';
import axios from 'axios';
import { fetchAllUsers } from '@/lib/features/FetchAllUsersSlice';
import { uploadFileToPinata } from '@/utils/pinnata';
import { BlockchainOperationArg, GeneralUserThunkArg } from '@/utils/types';
import { executeBlockchainOperation } from '@/lib/features/contractSlice';
import { InputViewFunctionData, MoveValue } from '@aptos-labs/ts-sdk';
import { TESTNET_CLIENT } from '@/utils';
import { AptosAccount, AptosClient, HexString ,TxnBuilderTypes, BCS } from 'aptos';
import toast from 'react-hot-toast';


function JoinSpaceContent() {
  const { account, signAndSubmitTransaction } = useWallet();
  const dispatch = useAppDispatch();
  const privateSpaces = (useAppSelector(state => state.fetchPrivateSpace)).privateSpace;
  const users = useAppSelector(state => state.fetchAllUser.users);
  const userProfile = users.find(user => user.address === account?.address);
  const [getTokenLoading, setGetTokenLoading] = useState(false)
  const [joinSpaceLoading, setJoinSpaceLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchPrivateSpace())
    dispatch(fetchAllUsers())
  }, []);

  const filteredPrivateSpaces = privateSpaces?.filter((space) => {
    if (Array.isArray(space.members)) {
      return space.members.every((member: any) =>
        member.address !== account?.address
      );
    }
    return false;
  });


  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false)
  const [createSpaceLoading, setCreateSpaceLoading] = useState(false)
  const [formData, setFormData] = useState({
    newSpaceName: '',
    newSpaceDescription: '',
    entryTokenAddress: '',
    entryTokenAmount: '',
    useEntryTokenForGovernance: false,
    governanceTokenAddress: '',
    governanceTokenAmount: ''
  })
  const [spaceImage, setSpaceImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prevState => ({
      ...prevState,
      useEntryTokenForGovernance: checked
    }))
  }

  const handleMint = async (to: string, mintAmount = 1000000, tokenName = 'USDC') => {
    try {
      setGetTokenLoading(true)
      const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');
      const privateKeyHex = '0xcdf8d1fbb53fb269c6ba3145ea8cc70ff50609aea5ccfd499185668fe421b1c5';
      const account = new AptosAccount(Buffer.from(privateKeyHex.replace('0x', ''), 'hex'));
  
      const gasUnitPrice = BigInt(100);
      const maxGasAmount = BigInt(500000);
      const estimatedFee = maxGasAmount * gasUnitPrice;
  
      const resources = await client.getAccountResources(account.address().hex());
      const coinResource = resources.find(res => res.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
      if (!coinResource) {
        console.error('No AptosCoin balance found.');
        return;
      }
  
      const balance = BigInt((coinResource.data as any).coin.value);
      console.log(`Current AptosCoin balance: ${balance}`);
  
      if (balance < estimatedFee) {
        console.error('Insufficient balance to cover the transaction fee.');
        return;
      }
  
      const moduleId = '0x66882b8bf7f4c93a76120f77438b16cba049fe8b2e9946ca50821d70a6ee1453::fungible';
      const functionId = 'mint';
      const addressArg = to;
      const stringArg = tokenName;
      const u64Arg = mintAmount.toString();
  
      const accountData = await client.getAccount(account.address().hex());
      const sequenceNumber = accountData.sequence_number;
  
      const rawTxn = new TxnBuilderTypes.RawTransaction(
        TxnBuilderTypes.AccountAddress.fromHex(account.address().hex()),
        BigInt(sequenceNumber),
        new TxnBuilderTypes.TransactionPayloadEntryFunction(
          TxnBuilderTypes.EntryFunction.natural(
            moduleId,
            functionId,
            [],
            [
              BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(addressArg)),
              BCS.bcsSerializeStr(stringArg),
              BCS.bcsSerializeUint64(BigInt(u64Arg)),
            ]
          )
        ),
        maxGasAmount,
        gasUnitPrice,
        BigInt(Math.floor(Date.now() / 1000) + 10),
        new TxnBuilderTypes.ChainId(2)
      );
  
      const signedTxn = await client.signTransaction(account, rawTxn);
      const transactionRes = await client.submitTransaction(signedTxn);
  
      await client.waitForTransaction(transactionRes.hash);
      toast.success("Mint successful",{
        icon: "🚀",
      });
  
    } catch (error) {
      toast.error("Failed to get token",{
        icon: "🚨",
      });
    } finally {
      setGetTokenLoading(false)
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSpaceImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateSpace = async () => {
    try {
      setCreateSpaceLoading(true)
      if (!account || !account.address) {
        console.log("No account connected or account address missing.");
        return;
      }
      if (spaceImage) {
        const {
          newSpaceName,
          newSpaceDescription,
          entryTokenAddress,
          entryTokenAmount,
          useEntryTokenForGovernance,
          governanceTokenAddress,
          governanceTokenAmount
        } = formData

        const fileUpload = await uploadFileToPinata(spaceImage);

        const operationArg: BlockchainOperationArg = {
          functionName: "admin_init_module",
          typeArguments: [],
          functionArguments: [],
          options: { maxGasAmount: 1000 }
        };

        const thunkArg: GeneralUserThunkArg = {
          data: operationArg,
          account: account,
          signAndSubmitTransaction: signAndSubmitTransaction,
          functionName: "governance"
        };

        dispatch(executeBlockchainOperation(thunkArg));

        const createPrivateSpaceObject = {
          name: newSpaceName,
          description: newSpaceDescription,
          image: fileUpload.IpfsHash,
          createdBy: (userProfile as any)._id,
          entryCondition: {
            address: entryTokenAddress,
            maxAmount: entryTokenAmount
          },
          interactCondition: {
            address: useEntryTokenForGovernance ? entryTokenAddress : governanceTokenAddress,
            maxAmount: useEntryTokenForGovernance ? entryTokenAmount : governanceTokenAmount
          }
        };

        const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/create/private/space`, createPrivateSpaceObject);
        if (resp.status === 201) {
          toast.success("Space created successfully");
          dispatch(fetchPrivateSpace());
          setIsCreateSpaceOpen(false);
        }

      }
    } catch (error) {
      toast.error("Failed to create space");
    } finally {
      setCreateSpaceLoading(false)
    }
  }


  const fetchUserTokenBalance = async (tokenAddress: string)=> {
    try {
      if (tokenAddress.startsWith('0x')) {
        tokenAddress = tokenAddress.slice(2);
      }
      const viewPayload: InputViewFunctionData = {
        function: `${tokenAddress}::fungible::balance`,
        typeArguments: [],
        functionArguments: [account?.address.slice(2), tokenAddress, 'USDC'],
      };

      const result: Array<MoveValue> = await TESTNET_CLIENT.view({
        payload: viewPayload,
      });
      return Number(result[0]) / 10**6;

    } catch (error) {
      console.log(error)
    }
  }

  const joinPrivateSpace = async (space: privateSpaceType) => {
    try {
      setJoinSpaceLoading(true)
      const tokenAddress = space.entryCondition.address;
      const tokenAmount = space.entryCondition.maxAmount;
      const userBalance = await fetchUserTokenBalance(tokenAddress);
  
      if (userBalance !== undefined && userBalance >= tokenAmount && userProfile) {
        await toast.promise(
          axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/private/space/join/member`, {
            privateSpaceId: (space as any)._id,
            userId: (userProfile as any)._id
          }),
          {
            loading: 'Validating entry condition...',
            success: <b>Successfully joined the private space!</b>,
            error: <b>Failed to join the private space.</b>
          }
        );
  
        dispatch(fetchPrivateSpace());
      } else {
        toast.error("You can't join this private space");
      }
    } catch (error) {
      toast.error("Failed to join space");
    } finally {
      setJoinSpaceLoading(false)
    }
  }

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Join Spaces</h2>
        <Button className='m-2' onClick={() => handleMint(account?.address as string)} disabled={getTokenLoading}>
          {getTokenLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : "Get Test Token"}
        </Button>
        <Dialog open={isCreateSpaceOpen} onOpenChange={(open) => setIsCreateSpaceOpen(open)}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full h-10 w-10 absolute bottom-4 right-64" disabled={createSpaceLoading}>
              {createSpaceLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="h-6 w-6" />}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Space</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newSpaceName">Space Name</Label>
                <Input
                  id="newSpaceName"
                  value={formData.newSpaceName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="newSpaceDescription">Description</Label>
                <Textarea
                  id="newSpaceDescription"
                  value={formData.newSpaceDescription}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="spaceImage">Space Image</Label>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Space preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <Input
                    id="spaceImage"
                    name="spaceImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="entryTokenAddress">Entry Token Address</Label>
                <Input
                  id="entryTokenAddress"
                  value={formData.entryTokenAddress}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="entryTokenAmount">Entry Token Amount</Label>
                <Input
                  id="entryTokenAmount"
                  type="number"
                  value={formData.entryTokenAmount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useEntryTokenForGovernance"
                  checked={formData.useEntryTokenForGovernance}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="useEntryTokenForGovernance">
                  Use entry token for governance
                </Label>
              </div>
              {!formData.useEntryTokenForGovernance && (
                <>
                  <div>
                    <Label htmlFor="governanceTokenAddress">Governance Token Address</Label>
                    <Input
                      id="governanceTokenAddress"
                      value={formData.governanceTokenAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="governanceTokenAmount">Governance Token Amount</Label>
                    <Input
                      id="governanceTokenAmount"
                      type="number"
                      value={formData.governanceTokenAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
              <Button onClick={handleCreateSpace}>Create Space</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {filteredPrivateSpaces && filteredPrivateSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrivateSpaces.map((space: privateSpaceType) => (
            <Card key={(space as any)._id} className="flex flex-col h-full overflow-hidden">
              <img src={`https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/${space.image}`} alt={space.name} className="w-full h-48 object-cover" />
              <CardHeader className="flex-grow">
                <CardTitle>{space.name}</CardTitle>
                <CardDescription>
                  <ReadMore text={"DeFi is an acronym for decentralized finance, a new financial technology that allows people to make financial transactions directly with each other, without the need for a middleman. DeFi is based on blockchain technology and secure distributed ledgers, similar to those used by cryptocurrencies."} maxLength={100} />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{(space?.members as any)?.length} members</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button className="w-full" onClick={() => joinPrivateSpace(space)} disabled={joinSpaceLoading}>
                  {joinSpaceLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : "Join Space"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-4xl font-semibold text-center flex flex-col items-center justify-center h-[70vh]">
          <h4>No spaces found</h4>
          <p className='text-xl font-extralight'>You can create a new space</p>
        </div>
      )}
    </div>
  )
}

export default JoinSpaceContent