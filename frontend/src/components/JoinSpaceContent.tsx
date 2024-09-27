import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from 'lucide-react'
import ReadMore from './ReadMore'

function JoinSpaceContent() {
    const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false)
    const [newSpaceName, setNewSpaceName] = useState('')
    const [newSpaceDescription, setNewSpaceDescription] = useState('')
  
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
  
    const handleCreateSpace = () => {
      // Here you would typically send this data to your backend
      console.log('Creating new space:', { name: newSpaceName, description: newSpaceDescription })
      setIsCreateSpaceOpen(false)
      setNewSpaceName('')
      setNewSpaceDescription('')
    }
  
    return (
      <div className="space-y-4 ">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Join Spaces</h2>
          <Dialog open={isCreateSpaceOpen} onOpenChange={setIsCreateSpaceOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full h-10 w-10 absolute bottom-4 right-4">
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Space</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="spaceName">Space Name</Label>
                  <Input id="spaceName" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="spaceDescription">Description</Label>
                  <Textarea id="spaceDescription" value={newSpaceDescription} onChange={(e) => setNewSpaceDescription(e.target.value)} />
                </div>
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