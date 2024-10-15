"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle, Upload, User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WalletSelector } from './WalletSelector'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { uploadFileToPinata } from '@/utils/pinnata'
import { BlockchainOperationArg, GeneralUserThunkArg, RegisterUserPayload } from '@/utils/types'
import { executeBlockchainOperation } from '@/lib/features/contractSlice'
import { useAppDispatch } from '@/lib/hooks'
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const { connected } = useWallet();

  if (!connected) {
    router.push('/');
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    description: '',
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const { account, signAndSubmitTransaction, network } = useWallet();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.username || !formData.description) {
      setError('Username and User Address are required fields.')
      return
    }

    try {
      const uploadPromises = profileImage && await uploadFileToPinata(profileImage)

      if (!formData.username || !formData.description) {
        setError('Username and User Address are required fields.')
        return
      }
      const userData: RegisterUserPayload = {
        username: formData.username,
        profilePicture: uploadPromises?.IpfsHash || "",
        description: formData.description
      };

      const operationArg: BlockchainOperationArg = {
        functionName: "register_user",
        typeArguments: [],
        functionArguments: [userData.username, uploadPromises?.IpfsHash, userData.description],
        options: { maxGasAmount: 1000 }
      };

      const thunkArg: GeneralUserThunkArg = {
        data: operationArg,
        account: account,
        signAndSubmitTransaction: signAndSubmitTransaction,
        functionName: "NewUserRegistry"
      };

      const result = await dispatch(executeBlockchainOperation(thunkArg));

      if (executeBlockchainOperation.fulfilled.match(result)) {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/register`, {
          name: formData.name,
          username: formData.username,
          description: formData.description,
          image: uploadPromises?.IpfsHash,
          address: account?.address,
        });

        router.push('/home');
      } else {
        throw new Error('Blockchain operation failed');
      }
    } catch (err) {
      console.log(err)
      setError('An error occurred while registering. Please try again.')
    }
    router.push('/')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create your account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile_picture">Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
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
                    id="profile_picture"
                    name="profile_picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about yourself"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full mt-6">Register</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Button variant="link" className="p-0" onClick={() => router.push('/')}>
              reload
            </Button>
          </p>
        </CardFooter>
      </Card>
      <div className="absolute top-0 right-0 m-8 bg-white rounded-md ">
        <WalletSelector />
      </div>
    </div>
  )
}