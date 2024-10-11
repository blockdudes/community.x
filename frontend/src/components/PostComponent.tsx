import React, { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, MoreVertical, SearchIcon, FullscreenIcon, ThumbsUp, ThumbsDown, CircleArrowUpIcon } from 'lucide-react'
import Image from 'next/image'
import ResourceModal from './ResourceModal'
import { CircleArrowDown } from 'lucide-react'

interface Comment {
    id: number
    author: string
    avatar: string
    content: string
    time: string
}

interface Resource {
    resourceUrl: string;
    dataType: string;
}

interface PostProps {
    post: {
        id: number
        author: string
        avatar: string
        time: string
        content: string
        resources: Resource[]
        likes: number
        comments: Comment[]
        reposts: number
        liked: boolean
        reposted: boolean
        upvotes?: number; // Separate upvotes
        downvotes?: number; // Separate downvotes
    }

    handleLike: (postId: number) => void
    handleRepost: (postId: number) => void
    handleComment: (postId: number, newComment: string) => void
    handleUpvote?: (postId: number) => void; 
    handleDownvote?: (postId: number) => void; 
    selectedChannel: string;
}

const PostComponent: React.FC<PostProps> = ({ post, handleLike, handleRepost, handleComment, handleUpvote, handleDownvote, selectedChannel }) => {

    const [commentingOn, setCommentingOn] = useState<number | null>(null)
    const [newComment, setNewComment] = useState('')
    const commentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const toggleComments = (postId: number) => {
        setCommentingOn(current => current === postId ? null : postId)
    }

    const openModal = (resource: Resource) => {
        setSelectedResource(resource);
        setIsModalOpen(true);
    };

    return (
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
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {post.resources.map((resource, index) =>
                    (
                        <div key={index} className="relative w-full h-40 rounded-md group" onClick={() => openModal(resource)}>
                            {['jpg', 'jpeg', 'img', 'png'].some(ext => resource.dataType.includes(ext)) && (
                                <img src={resource.resourceUrl} alt="Resource" className="w-full h-full object-cover rounded-md" />
                            )}
                            {['mp4', 'mkv'].some(ext => resource.dataType.includes(ext)) && (
                                <video src={resource.resourceUrl} controls className="w-full h-full object-cover rounded-md" />
                            )}
                            {['pdf', 'docx', 'doc'].some(ext => resource.dataType.includes(ext)) && (
                                <iframe src={`${resource.resourceUrl}#zoom=40`} className="w-full h-full rounded-md" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FullscreenIcon className="text-white text-2xl" />
                            </div>
                        </div>
                    )
                    )}
                </div>
                {selectedResource && (
                    <ResourceModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        resourceUrl={selectedResource.resourceUrl}
                        dataType={selectedResource.dataType}
                    />
                )}
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

                        {selectedChannel === 'governance' && (
                            <>
                                <Button variant="ghost" size="sm" className={`text-[10px] ${post.upvotes ? 'text-green-500' : ''}`} onClick={() => handleUpvote?.(post.id)}>
                                    <CircleArrowDown className="mr-1 h-3 w-3" /> {post.upvotes || 0}
                                    
                                </Button>

                                <Button variant="ghost" size="sm" className={`text-[10px] ${post.downvotes ? 'text-red-500' : ''}`} onClick={() => handleDownvote?.(post.id)}>
                                    <CircleArrowUpIcon className="mr-1 h-3 w-3" /> {post.downvotes || 0}
                                </Button>
                            </>
                        )}
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
                            <Button size="sm" onClick={() => handleComment(post.id, newComment)}>Post</Button>
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
    )
}

export default PostComponent
