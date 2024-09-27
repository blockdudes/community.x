import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function ProfileContent() {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSearchInput(value);

    // Simulate search results
    const allUsers = ['Alice Johnson', 'Bob Williams', 'Carol Davis', 'David Smith', 'Eve Adams'];
    const results = value ? allUsers.filter(user => user.toLowerCase().includes(value.toLowerCase())) : [];
    setSearchResults(results);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Your Profile" />
              <AvatarFallback>YP</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Your Name</h2>
              <p className="text-sm text-gray-500">@yourusername</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-semibold">Following</h3>
            {['Alice Johnson', 'Bob Williams', 'Carol Davis'].map((name, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${name[0]}`} alt={name} />
                    <AvatarFallback>{name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{name}</p>
                </div>
                <Button variant="outline" size="sm">Unfollow</Button>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Add New Friend</h3>
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Enter username"
                className="text-xs"
                value={searchInput}
                onChange={handleSearch}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {searchResults.map((name, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${name[0]}`} alt={name} />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm">{name}</p>
                    </div>
                    <Button className="bg-blue-500 text-white" size="sm">Follow</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileContent