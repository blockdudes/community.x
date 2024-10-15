'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import CreatePost from './CreatePost';
import Post from './PostComponent';
import { parsePathForPostData } from "@/utils/helper";
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAllPost } from '@/lib/features/FetchAllPostSlice';
import { fetchAllUsers } from '@/lib/features/FetchAllUsersSlice';
import { fetchPrivateSpace } from '@/lib/features/FetchPrivateSpaceSlice';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { fetchProposalsThunk } from '@/lib/features/contractSlice';


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
  post_id: string
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
  upvotes: number
  downvotes: number
}


interface PostData {
  id: number,
  message: string,
  resources: {
    resourceUrl: string;
    dataType: string;
  }[];
}


function PrivateSpaceContent() {
  const pathname = usePathname();
  const socketRef = useRef<Socket | null>(null);
  const pathSegments = pathname.split('/');
  const selectedSpaceId = parseInt(pathSegments[2], 10);
  const selectedChannel = pathSegments[3];

  // const [space, setSpace] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isOwner, setIsOwner] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const { space, privateSpaceId, channel } = parsePathForPostData(pathname);
  const { account } = useWallet();
  const userProfile = (useAppSelector(state => state.fetchAllUser.users)).find(user => user.address === account?.address);
  const privateSpaces = (useAppSelector(state => state.fetchPrivateSpace)).privateSpace;
  const [updatedGovernancePosts, setUpdatedGovernancePosts] = useState<any[]>([]);
  const posts = useAppSelector(state => state.fetchAllPost.posts || []);

  console.log('posts', posts)
  const findSpace = privateSpaces?.find((space: any) => space._id === privateSpaceId);


  const fetchGovernanceProposals = async () => {
    console.log('fetchGovernanceProposals')
    const governanceResponse = await dispatch(fetchProposalsThunk({ address: (findSpace as any)?.createdBy.address }));
    console.log('governanceResponse', governanceResponse)
    // dispatch(fetchAllPost({ space: space, privateSpaceId: privateSpaceId, channel: channel, userId: (userProfile as any)?._id }));
    let governance = governanceResponse?.payload || [];
    if (Array.isArray(governance)) {
      governance = governance.flat();
    }

    if ((governance as any).length > 0 && socketRef.current) {
      // console.log('posts',posts)
      // console.log('socketRef.current')
      const updatedPosts = (posts as any).map((post: any) => {
        const matchingProposal = (governance as any).find((proposal: any) => post.post_id === proposal.proposal_id);

        if (matchingProposal) {
          return {
            ...post,
            upvotes: matchingProposal.up_votes || 0,
            downvotes: matchingProposal.down_votes || 0
          };
        }
        return post;
      });

      setUpdatedGovernancePosts(updatedPosts);
    }
  };

  useEffect(() => {
    if (channel === 'governance' && posts.length > 0) {
      console.log('clicked')

      fetchGovernanceProposals();
    }
  }, [findSpace, channel, posts]);

  // useEffect(() => {
  //   const updateGovernancePosts = async () => {
  //     if (channel === 'governance' && findSpace) {
  //       const governanceResponse = await dispatch(fetchProposalsThunk({ address: (findSpace as any)?.createdBy.address }));
  //       let governance = governanceResponse?.payload || [];
  //       if (Array.isArray(governance)) {
  //         governance = governance.flat();
  //       }

  //       if ((governance as any).length > 0) {
  //         const updatedPosts = (posts as any).map((post: any) => {
  //           const matchingProposal = (governance as any).find((proposal: any) => post.post_id === proposal.proposal_id);

  //           if (matchingProposal) {
  //             return {
  //               ...post,
  //               upvotes: matchingProposal.up_votes || 0,
  //               downvotes: matchingProposal.down_votes || 0
  //             };
  //           }
  //           return post;
  //         });
  //         setUpdatedGovernancePosts(updatedPosts);
  //       } else {
  //         setUpdatedGovernancePosts(posts);
  //       }
  //     }
  //   };

  //   updateGovernancePosts();
  // }, [posts, findSpace, dispatch, channel]);

  useEffect(() => {
    dispatch(fetchAllUsers())
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_API_URL as string);
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [])

  useEffect(() => {
    if (findSpace) {
      if ((findSpace as any).createdBy.address === account?.address) {
        setIsOwner(true);
      }
    }
  }, [account, findSpace])

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit("join_space", { space: space, privateSpaceId: privateSpaceId, channel: channel });
      socketRef.current.on("fetch_post", (post) => {
        // console.log('running1')
        const postData = dispatch(fetchAllPost(post));
        // console.log('running2',postData)
        if (channel === 'governance') {
          console.log('running3')
          posts.length > 0 && fetchGovernanceProposals();
        }
      });
      dispatch(fetchAllPost({ space: space, privateSpaceId: privateSpaceId, channel: channel, userId: (userProfile as any)?._id }));
      dispatch(fetchPrivateSpace());
    }
    setLoading(false);
  }, [])


  // const handleLike = (postId: number) => {
  //   setPosts(
  //     posts.map((post) =>
  //       post.id === postId
  //         ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
  //         : post
  //     )
  //   );
  // };

  // const handleRepost = (postId: number) => {
  //   // Only allow reposting in general, or if owner in announcements
  //   if (selectedChannel === 'general' || (selectedChannel === 'announcement' && isOwner)) {
  //     setPosts(
  //       posts.map((post) =>
  //         post.id === postId
  //           ? { ...post, reposts: post.reposted ? post.reposts - 1 : post.reposts + 1, reposted: !post.reposted }
  //           : post
  //       )
  //     );
  //   }
  // };

  // const handleUpvote = (postId: number) => {
  //   // Only allow upvoting in the governance channel
  //   if (selectedChannel === 'governance') {
  //     setPosts(posts.map(post =>
  //       post.id === postId ? { ...post, upvotes: (post.upvotes || 0) + 1 } : post
  //     ));
  //   }
  // };

  // const handleDownvote = (postId: number) => {
  //   // Only allow downvoting in the governance channel
  //   if (selectedChannel === 'governance') {
  //     setPosts(posts.map(post =>
  //       post.id === postId ? { ...post, downvotes: (post.downvotes || 0) + 1 } : post
  //     ));
  //   }
  // };

  const [commentingOn, setCommentingOn] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const commentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // const handleComment = (postId: number, newComment: string) => {
  //   if (newComment.trim()) {
  //     setPosts(
  //       posts.map((post) =>
  //         post.id === postId
  //           ? {
  //             ...post,
  //             comments: [
  //               {
  //                 id: post.comments.length + 1,
  //                 author: 'You',
  //                 avatar: '/placeholder.svg?height=32&width=32',
  //                 content: newComment,
  //                 time: 'Just now',
  //               },
  //               ...post.comments,
  //             ],
  //           }
  //           : post
  //       )
  //     );
  //   }
  //   setNewComment('');
  //   setTimeout(() => {
  //     if (commentRefs.current[postId]) {
  //       commentRefs.current[postId]!.scrollTop = 0;
  //     }
  //   }, 0);
  // };

  // const toggleComments = (postId: number) => {
  //   setCommentingOn((current) => (current === postId ? null : postId));
  // };

  if (loading) return
  <div className="text-gray-500 text-4xl font-semibold text-center flex flex-col items-center justify-center h-[70vh]">
    <h4>Fetching space data...</h4>
  </div>

  if (error) return
  <div className="text-gray-500 text-4xl font-semibold text-center flex flex-col items-center justify-center h-[70vh]">
    <h4>Error fetching space data...</h4>
  </div>

  return (
    <div className="space-y-4">
      {space && (
        <>
          <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800">
            <img src={`https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/${findSpace?.image}`} alt={findSpace?.name} className="w-12 h-12 object-cover rounded-full shadow-lg" />
            {findSpace?.name?.toUpperCase()} - # {channel}
          </h2>
        </>
      )}

      {/* Only show the post creation UI if it's the 'general' channel or the owner in announcement/governance */}
      {(channel === 'general' || isOwner) && account &&
        <CreatePost
          socketRef={socketRef}
          isAuthenticated={true}
          space={space}
          privateSpaceId={privateSpaceId}
          channel={channel}
        />}

      {/* // {account && posts && posts.map((post) => ( */}
      {account && posts?.length > 0 && (channel === "governance" ? updatedGovernancePosts : posts).map((post) => (
        <Post
          post={post}
          socketRef={socketRef}
          key={(post as any)._id}
          isAuthenticated={true}
          space={space}
          privateSpaceId={privateSpaceId}
          channel={channel}
          repost={channel === 'general' || isOwner}
        />
      ))}
    </div>
  );
}

export default PrivateSpaceContent;


