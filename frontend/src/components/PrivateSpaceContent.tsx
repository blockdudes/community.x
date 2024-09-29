import React, { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, ImageIcon, MessageCircle, MoreVertical, Send } from 'lucide-react'
import CreatePost from './CreatePost'
import Post from './PostComponent'

interface PrivateSpaceContentProps {
  selectedSpace: any;
  selectedChannel: string;
}

interface Comment {
  id: number
  author: string
  avatar: string
  content: string
  time: string
}

interface Post {
  id: number
  author: string
  avatar: string
  time: string
  content: string
  resources: {
    resourceUrl: string
    dataType: string
  }[]
  likes: number
  comments: Comment[]
  reposts: number
  liked: boolean
  reposted: boolean
}


interface PostData {
  id: number,
  message: string,
  resources: {
    resourceUrl: string;
    dataType: string;
  }[];
}

function PrivateSpaceContent({ selectedSpace, selectedChannel }: PrivateSpaceContentProps) {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'George Lobko',
      avatar: '/placeholder.svg?height=32&width=32',
      time: '2 hours ago',
      content: 'Hi everyone, today I was on the most beautiful mountain in the world 🌎, I also want to say hi to Silena, Olya and Davis!',
      resources: [
        {
          resourceUrl: 'https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/bafkreib74sqrflitgziqaqvsgtynck6xnhlx3u5fmdyge7sflhy6b5cvmy',
          dataType: 'jpeg',
        },
        {
          resourceUrl: 'https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/bafkreib74sqrflitgziqaqvsgtynck6xnhlx3u5fmdyge7sflhy6b5cvmy',
          dataType: 'jpeg',
        }
      ],
      likes: 6355,
      comments: [
        {
          id: 1,
          author: 'Jane Doe',
          avatar: '/placeholder.svg?height=32&width=32',
          content: 'Wow, that looks amazing! Which mountain is it?',
          time: '1 hour ago'
        },
        {
          id: 2,
          author: 'John Smith',
          avatar: '/placeholder.svg?height=32&width=32',
          content: 'Great shot! The view must have been breathtaking.',
          time: '30 minutes ago'
        },
        {
          id: 3,
          author: 'Alice Johnson',
          avatar: '/placeholder.svg?height=32&width=32',
          content: 'I wish I could visit there someday!',
          time: '15 minutes ago'
        },
        {
          id: 4,
          author: 'Bob Williams',
          avatar: '/placeholder.svg?height=32&width=32',
          content: 'What camera did you use for this shot?',
          time: '5 minutes ago'
        },
      ],
      reposts: 23,
      liked: false,
      reposted: false,
    },
    // Add more posts here
  ])

  const [postData, setPostData] = useState<PostData[]>([
    {
      id: 1,
      message: '',
      resources: [
        {
          resourceUrl: '',
          dataType: '',
        }
      ],
    }
  ])
  
  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked } : post
    ))
  }

  const handleRepost = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, reposts: post.reposted ? post.reposts - 1 : post.reposts + 1, reposted: !post.reposted } : post
    ))
  }


    const [commentingOn, setCommentingOn] = useState<number | null>(null)
    const [newComment, setNewComment] = useState('')
    const commentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  
      const handleComment = (postId: number, newComment: string) => {
    if (newComment.trim()) {
      setPosts(posts.map(post => 
        post.id === postId ? { 
          ...post, 
          comments: [
            {
              id: post.comments.length + 1,
              author: 'You',
              avatar: '/placeholder.svg?height=32&width=32',
              content: newComment,
              time: 'Just now'
            },
            ...post.comments
          ]
        } : post
      ))
    }
    setNewComment('')
    setTimeout(() => {
      if (commentRefs.current[postId]) {
        commentRefs.current[postId]!.scrollTop = 0
      }
    }, 0)
  }

    const toggleComments = (postId: number) => {
      setCommentingOn(current => current === postId ? null : postId)
    }
    
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{selectedSpace.name} - #{selectedChannel}</h2>
        {/* <Card className="shadow-sm rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
                <AvatarFallback>BN</AvatarFallback>
              </Avatar>
              <Input placeholder="Create a post" className="text-sm h-9 w-full" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
  
                <Button variant="ghost" size="sm" className="text-xs">
                  <input type="file" accept="image/*" className="hidden" id="upload-image" />
                  <label htmlFor="upload-image" className="cursor-pointer flex items-center">
                    <ImageIcon className="mr-1 h-4 w-4" /> Upload Image
                  </label>
                </Button>
              </div>
              <Button size="sm" className="text-xs">
                <Send className="mr-1 h-4 w-4" /> Post
              </Button>
            </div>
          </CardContent>
        </Card> */}
        <CreatePost selectedSpace={selectedSpace} postData={postData} setPostData={setPostData} />
        {posts.map(post => (
        <Post 
          key={post.id} 
          post={post} 
          handleLike={handleLike} 
          handleRepost={handleRepost} 
          handleComment={handleComment} 
        />
      ))}
        {/* {posts.map(post => (
        <Card key={post.id} className="bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={post.avatar} alt={post.author} />
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-xs">{post.author}</h3>
                  <p className="text-[10px] text-gray-500">{post.time}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs mb-2">{post.content}</p>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {post.images.map((img, index) => (
                <img key={index} src={img} alt={`Post image ${index + 1}`} className="rounded-md w-full h-16 object-cover" />
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className={`text-[10px] ${post.liked ? 'text-red-500' : ''}`} onClick={() => handleLike(post.id)}>
                  <Heart className={`mr-1 h-3 w-3 ${post.liked ? 'fill-current' : ''}`} /> {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => toggleComments(post.id)}>
                  <MessageCircle className="mr-1 h-3 w-3" /> {post.comments.length}
                </Button>
                <Button variant="ghost" size="sm" className={`text-[10px] ${post.reposted ? 'text-green-500' : ''}`} onClick={() => handleRepost(post.id)}>
                  <Send className="mr-1 h-3 w-3" /> {post.reposts}
                </Button>
              </div>
            </div>
            {commentingOn === post.id && (
              <div className="mt-2">
                <div className="flex items-center mb-2">
                  <Input 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="text-xs mr-2 bg-white"
                  />
                  <Button size="sm" onClick={() => handleComment(post.id)}>Post</Button>
                </div>
                <div 
                  className="max-h-40 overflow-y-auto"
                  ref={el => {
                    commentRefs.current[post.id] = el;
                  }}
                >
                  {post.comments.map(comment => (
                    <div key={comment.id} className="bg-white p-2 rounded-md mb-2">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 m-2">
                          <AvatarImage src={comment.avatar} alt={comment.author} />
                          <AvatarFallback>{comment.author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-[10px]">{comment.author}</h4>
                          <p className="text-[8px] text-gray-500">{comment.time}</p>
                        </div>
                      </div>
                      <p className="text-[10px] mt-1">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))} */}
      </div>
    )
  }

export default PrivateSpaceContent