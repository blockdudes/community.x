import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, ImageIcon } from 'lucide-react';
import ReadMore from './ReadMore';
import { Checkbox } from './ui/checkbox';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPrivateSpace } from '@/lib/features/FetchPrivateSpaceSlice';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { privateSpaceType } from '@/types/privateTypes';
import axios from 'axios';
import { fetchAllUsers } from '@/lib/features/FetchAllUsersSlice';
import { uploadFileToPinata } from '@/utils/pinnata';

function JoinSpaceContent() {
  // const address = (useWallet()).account?.address;
  const account = "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6";
  const dispatch = useAppDispatch();
  const privateSpaces = (useAppSelector(state => state.fetchPrivateSpace)).privateSpace;
  const users = useAppSelector(state => state.fetchAllUser.users);
  const userProfile = users.find(user => user.address === account);

  useEffect(() => {
    dispatch(fetchPrivateSpace())
    dispatch(fetchAllUsers())
  }, []);

  const filteredPrivateSpaces = privateSpaces?.filter((space) => {
    if (Array.isArray(space.members)) {
      return space.members.every((member: any) =>
        member.address !== account
      );
    }
    return false;
  });

  console.log(filteredPrivateSpaces);

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false)
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("Hello 3")
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

        const createPrivateSpaceObject = {
          name: newSpaceName,
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
        console.log(createPrivateSpaceObject);
        const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/create/private/space`, createPrivateSpaceObject);
        if (resp.status === 201) {
          dispatch(fetchPrivateSpace());
          setIsCreateSpaceOpen(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const joinPrivateSpace = async (space: privateSpaceType) => {
    try {
      const entrybalance = 1000; /// contract call for fetching token balance
      if (entrybalance >= space.entryCondition.maxAmount && userProfile) {
        const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/private/space/join/member`, {
          privateSpaceId: (space as any)._id,
          userId: (userProfile as any)._id
        });
        if (resp.status === 200) {
          dispatch(fetchPrivateSpace());
        }
      } else {
        console.log("you can't join this private space");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Join Spaces</h2>
        <Dialog open={isCreateSpaceOpen} onOpenChange={(open) => setIsCreateSpaceOpen(open)}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full h-10 w-10 absolute bottom-4 right-64">
              <Plus className="h-6 w-6" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrivateSpaces?.map((space: privateSpaceType) => (
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
              <Button className="w-full" onClick={() => joinPrivateSpace(space)}>Join Space</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default JoinSpaceContent
