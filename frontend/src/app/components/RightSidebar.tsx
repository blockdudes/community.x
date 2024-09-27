import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, Plus, TrendingUp } from 'lucide-react'

function RightSidebar() {
  return (
    <div className="space-y-10 text-gray-600">
      <section>
        <h2 className="text-sm font-bold mb-3 flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          New Spaces
        </h2>
        <div className="space-y-3">
          {['Tech Enthusiasts', 'Book Club', 'Fitness Fanatics'].map((space, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${space[0]}`} alt={space} />
                  <AvatarFallback>{space[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold text-gray-600">{space}</p>
                  <p className="text-[10px] text-gray-400">1.2k members</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-[10px] h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                <Plus className="w-3 h-3 mr-1" />
                Join
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-3 text-gray-600">Suggestions</h2>
        <div className="space-y-3">
          {['Nick Shelburne', 'Brittni Lando', 'Ivan Shevchenko'].map((name, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${name[0]}`} alt={name} />
                  <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold text-gray-600">{name}</p>
                  <p className="text-[10px] text-gray-400">@{name.toLowerCase().replace(' ', '')}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-[10px] h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">Follow</Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-3 flex items-center text-gray-800">
          <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
          Trending Topics
        </h2>
        <div className="space-y-2">
          {['#TechNews', '#BookRecommendations', '#FitnessChallenge', '#CodingTips', '#HealthyRecipes'].map((topic, index) => (
            <div key={index} className="text-xs">
              <p className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">{topic}</p>
              <p className="text-[10px] text-gray-500">{Math.floor(Math.random() * 1000) + 100} posts</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RightSidebar