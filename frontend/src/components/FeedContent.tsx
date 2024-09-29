"use client"

import React, { useState } from 'react'
import CreatePost from './CreatePost'
import Post from './PostComponent'

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


interface FeedContentProps {
  selectedSpace: any
}

export default function FeedContent({ selectedSpace }: FeedContentProps) {
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
  }

  
  return (
    <div className="space-y-4">
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
    </div>
  )
}