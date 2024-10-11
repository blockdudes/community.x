import React, { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, MoreVertical, SearchIcon, FullscreenIcon } from 'lucide-react'
import Image from 'next/image'
import ResourceModal from './ResourceModal'
import { Socket } from "socket.io-client";
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { fetchAllUsers } from '@/lib/features/FetchAllUsersSlice'

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
    post: any;
    socketRef: React.MutableRefObject<Socket | null>;
    isAuthenticated: boolean;
    account: string;
    space: string;
    privateSpaceId: string | null;
    channel: string | null;
}

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

const PostComponent: React.FC<PostProps> = ({ post, isAuthenticated, socketRef, account, space, privateSpaceId, channel }) => {
    const timeAgo = formatTimeAgo(post?.timestamp);
    const [commentingOn, setCommentingOn] = useState<number | null>(null)
    const [newComment, setNewComment] = useState('')
    const commentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const dispatch = useAppDispatch()
    const userProfile = (useAppSelector(state => state.fetchAllUser.users)).find(user => user.address === account);
    console.log("post component: ", userProfile);
    console.log("post post component: ", post);

    const toggleComments = (postId: number) => {
        setCommentingOn(current => current === postId ? null : postId)
    }

    const openModal = (resource: Resource) => {
        setSelectedResource(resource);
        setIsModalOpen(true);
    };

    // useEffect(() => {
    //     dispatch(fetchAllUsers())
    // }, [])


    const handleLikePost = async () => {
        const data = {
            _id: post?._id,
            likedBy: (userProfile as any)?._id,
            space: space,
            privateSpaceId: privateSpaceId,
            channel: channel
        }
        try {
            if (isAuthenticated && socketRef.current) {
                socketRef.current.emit("post_like", data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleRePost = async () => {
        try {
            const data = {
                _id: post?._id,
                repostBy: (userProfile as any)?._id,
                repostDescription: "This is DEFI REPOST",
                space: space,
                privateSpaceId: privateSpaceId,
                channel: channel
            }
            if (isAuthenticated && socketRef.current) {
                socketRef.current.emit("post_repost", data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleCommentPost = async () => {
        try {
            if (isAuthenticated && socketRef.current && newComment) {
                const data = {
                    _id: post?._id,
                    commentBy: (userProfile as any)?._id,
                    comment: newComment,
                    space: space,
                    privateSpaceId: privateSpaceId,
                    channel: channel
                }
                socketRef.current.emit("post_comment", data);
            }
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <Card key={post._id} className="bg-blue-50">
            <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={post?.createdBy?.image} alt={post?.createdBy?.image} />
                            <AvatarFallback>{post?.createdBy?.name}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-xs">{post?.createdBy?.name}</h3>
                            <p className="text-[10px] text-gray-500">{timeAgo}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm">
                        <MoreVertical className="h-3 w-3" />
                    </Button>
                </div>
                <p className="text-xs mb-2">{post?.description}</p>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {(JSON.parse(post?.post))?.map((resource: any, index: any) =>
                    (
                        <div key={index} className="relative w-full h-40 rounded-md group" onClick={() => openModal(resource)}>
                            {['webp', 'jpg', 'jpeg', 'img', 'png'].some(ext => resource.dataType.includes(ext)) && (
                                <img src={`https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/${resource.resourceUrl}`} alt="Resource" className="w-full h-full object-cover rounded-md" />
                            )}
                            {['mp4', 'mkv'].some(ext => resource.dataType.includes(ext)) && (
                                <video src={`https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/${resource.resourceUrl}`} controls className="w-full h-full object-cover rounded-md" />
                            )}
                            {['pdf', 'docx', 'doc'].some(ext => resource.dataType.includes(ext)) && (
                                <iframe src={`https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/${resource.resourceUrl}#zoom=40`} className="w-full h-full rounded-md" />
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
                        <Button variant="ghost" size="sm" className={`text-[10px] ${post.liked ? 'text-red-500' : ''}`} onClick={handleLikePost}>
                            <Heart className={`mr-1 h-3 w-3 ${post?.likes?.some((like: any) => like?.address === account) ? 'fill-current' : ''}`} /> {post?.likes?.length}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => toggleComments(post.id)}>
                            <MessageCircle className="mr-1 h-3 w-3" /> {post.comments.length}
                        </Button>
                        <Button variant="ghost" size="sm" className={`text-[10px] ${post.reposted ? 'text-green-500' : ''}`} onClick={handleRePost}>
                            <Send className="mr-1 h-3 w-3" /> {post.repost}
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
                            <Button size="sm" onClick={handleCommentPost}>Post</Button>
                        </div>
                        <div
                            className="max-h-40 overflow-y-auto"
                            ref={el => {
                                commentRefs.current[post.id] = el;
                            }}
                        >
                            {post.comments.map((comment: any, index: any) => (
                                <div key={index} className="bg-white p-2 rounded-md mb-2">
                                    <div className="flex items-center">
                                        <Avatar className="h-6 w-6 m-2">
                                            <AvatarImage src={comment.user.image} alt={comment.user.name} />
                                            <AvatarFallback>{comment.user.name}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-[10px]">{comment.user.name}</h4>
                                            <p className="text-[8px] text-gray-500">{formatTimeAgo(comment?.timestamp)}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] mt-1">{comment.comment}</p>
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