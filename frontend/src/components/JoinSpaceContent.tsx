import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Upload, ImageIcon } from 'lucide-react'
import ReadMore from './ReadMore'
import { Checkbox } from './ui/checkbox'

function JoinSpaceContent() {
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

  const spaces = [
    {
      id: 1,
      name: "CryptoArt Enthusiasts",
      description: "A community for crypto art lovers and collectors",
      image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      members: 1234
    },
    {
      id: 2,
      name: "NFT Traders",
      description: "Connect with fellow NFT traders and discuss market trends",
      image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      members: 5678
    },
    {
      id: 3,
      name: "Blockchain Developers",
      description: "A space for blockchain developers to share knowledge and collaborate.",
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      members: 9012
    },
  ]

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
      setSpaceImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateSpace = () => {
    const {
      newSpaceName,
      newSpaceDescription,
      entryTokenAddress,
      entryTokenAmount,
      useEntryTokenForGovernance,
      governanceTokenAddress,
      governanceTokenAmount
    } = formData

    const spaceData = {
      name: newSpaceName,
      description: newSpaceDescription,
      image: spaceImage,
      entryTokenAddress,
      entryTokenAmount,
      governanceTokenAddress: useEntryTokenForGovernance ? entryTokenAddress : governanceTokenAddress,
      governanceTokenAmount: useEntryTokenForGovernance ? entryTokenAmount : governanceTokenAmount,
    }

    console.log(spaceData)
    setIsCreateSpaceOpen(false) 
  }

  return (
    <div className="space-y-4 ">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Join Spaces</h2>
        <Dialog open={isCreateSpaceOpen} onOpenChange={(open) => setIsCreateSpaceOpen(open)}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full h-10 w-10 absolute bottom-4 right-0">
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
        {spaces.map((space) => (
          <Card key={space.id} className="flex flex-col h-full overflow-hidden">
            <img src={space.image} alt={space.name} className="w-full h-48 object-cover" />
            <CardHeader className="flex-grow">
              <CardTitle>{space.name}</CardTitle>
              <CardDescription>
                <ReadMore text={space.description} maxLength={100} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{space.members} members</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="w-full">Join Space</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default JoinSpaceContent
