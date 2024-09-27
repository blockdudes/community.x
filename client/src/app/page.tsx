"use client"
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import axios from "axios";

import { fetchAllPost } from "@/lib/features/FetchAllPostSlice";
import { fetchAllUsers } from "@/lib/features/FetchAllUsersSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function Public() {
  const [titleInput, setTitleInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState("");

  const dispatch = useAppDispatch();
  const posts = useAppSelector(state => state.fetchAllPost.posts);
  const [account, setAccount] = useState("0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6")
  const userProfile = (useAppSelector(state => state.fetchAllUser.users)).find(user => user.address === account);
  console.log(userProfile);

  useEffect(() => {
    dispatch(fetchAllUsers())
    checkAuthStatus();
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
    if (isAuthenticated && socketRef.current && userProfile) {
      socketRef.current.emit("join_space", { space: "public" });
      socketRef.current.on("fetch_post", (post) => {
        dispatch(fetchAllPost(post));
      });
      socketRef.current.on("public_user", (data: any) => {
        setUsers(data?.users);
      });
      dispatch(fetchAllPost({ space: "public", privateSpaceId: null, channel: null, userId: (userProfile as any)?._id }));
      fetchAllUser();
    }
  }, [isAuthenticated, userProfile])

  const fetchAllUser = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/all/users`);
      setUsers(res.data?.users);
    } catch (error) {
      console.log(error);
    }
  }

  const checkAuthStatus = async () => {
    try {
      const isAuth = (await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/${account}`))?.data?.isAuth;
      if (!isAuth) {
        router.push('/register');
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  const handleCreatePost = async () => {
    try {
      if (isAuthenticated && socketRef.current) {
        if (titleInput && descriptionInput) {
          let post = "";
          if (fileInput) {
            const fileType = fileInput.type.split('/')[0];
            const base64 = await fileToBase64(fileInput);
            post = JSON.stringify({ type: fileType, content: base64, fileName: fileInput.name });
          }
          const postData = {
            title: titleInput ? titleInput : "",
            description: descriptionInput ? descriptionInput : "",
            post: post,
            createdBy: (userProfile as any)?._id,
            space: "public",
            privateSpaceId: null,
            channel: null
          };
          socketRef.current.emit("create_post", postData);
          setTitleInput("");
          setDescriptionInput("");
          setFileInput(null);
          // window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          console.error("No content to post");
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }

  const registerUser = async () => {
    try {
      const userData = {
        name: "somyaranjan",
        username: "somyaranjankhatua.9",
        description: "this is description",
        image: "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
        address: account
      }

      const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/register`, userData);
      if (resp.status === 201) {
        dispatch(fetchAllUsers());
      }
    } catch (error) {
      console.log(error);
    }
  }


  const handleLikePost = async (data: any) => {
    try {
      if (isAuthenticated && socketRef.current) {
        socketRef.current.emit("post_like", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleCommentPost = async (_id: string, address: string) => {
    try {
      if (isAuthenticated && socketRef.current && comment) {
        const data = {
          _id: _id,
          commentBy: address,
          comment: comment,
          space: "public",
          privateSpaceId: null,
          channel: null
        }
        socketRef.current.emit("post_comment", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleRePost = async (data: any) => {
    try {
      if (isAuthenticated && socketRef.current) {
        socketRef.current.emit("post_repost", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleFollow = async (data: any) => {
    try {
      if (isAuthenticated && socketRef.current) {
        socketRef.current.emit("follow_user", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleUnFollow = async (data: any) => {
    try {
      if (isAuthenticated && socketRef.current) {
        socketRef.current.emit("unfollow_user", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  const base64ToFile = (base64String: string, fileName: string, fileType: string): File => {
    const base64Data = base64String.split(',')[1] || base64String;
    const binaryString = atob(base64Data);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: fileType });
    return new File([blob], fileName, { type: fileType });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="">
      Hello, authenticated user!

      <div className="py-5">
        {
          users
            .filter((item: any) => item.address !== account)
            .map((item: any, index) => {
              const isFollowing = item.followers.some((follower: any) => follower.address === account);

              const data = {
                userId: (userProfile as any)?._id,
                followUserId: item._id
              }
              return (
                <div key={index} className="flex">
                  <div className="pr-4">{index} {item.username}</div>
                  {isFollowing ?
                    <button type="button" onClick={() => handleUnFollow(data)}>
                      Unfollow
                    </button> :
                    <button type="button" onClick={() => handleFollow(data)}>
                      Follow
                    </button>
                  }
                </div>
              )
            })
        }
      </div>

      <div>
        {
          posts?.map((item, index) => {
            const post = JSON.parse((item as any).post);
            const newFile = base64ToFile(post.content, post.fileName, post.type);
            const data = {
              _id: (item as any)._id,
              likedBy: (userProfile as any)?._id,
              space: "public",
              privateSpaceId: null,
              channel: null
            }

            const repostData = {
              _id: (item as any)._id,
              repostBy: (userProfile as any)?._id,
              repostDescription: "This is DEFI REPOST",
              space: "public",
              privateSpaceId: null,
              channel: null
            }
            return (
              <div key={index}>
                <img src={URL.createObjectURL(newFile)} alt={post.fileName} className="max-w-full h-auto" />
                <div className="flex">
                  <button type="button" onClick={() => handleLikePost(data)}>Like</button>
                  <div>
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} />
                    <button type="button" onClick={() => handleCommentPost((item as any)._id, (userProfile as any)?._id)}>comment</button>
                  </div>
                  <button type="button" onClick={() => handleRePost(repostData)}>Repost</button>
                </div>
              </div>
            )
          })
        }
      </div>

      <div className="w-full pt-96">
        <textarea
          className="w-full p-2 border rounded text-black"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          placeholder="Enter your post title here (optional)..."
          rows={4}
        />
        <textarea
          className="w-full p-2 border rounded text-black"
          value={descriptionInput}
          onChange={(e) => setDescriptionInput(e.target.value)}
          placeholder="Enter your post description here (optional)..."
          rows={4}
        />

        <div className="flex items-center space-x-2">
          <input
            type="file"
            onChange={(e) => setFileInput(e.target.files?.[0] || null)}
            className="flex-grow"
          />
          <span className="text-sm text-gray-500">
            {fileInput ? fileInput.name : "No file chosen"}
          </span>
        </div>

        <button
          onClick={handleCreatePost}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={!titleInput && !descriptionInput}
        >
          CREATE POST
        </button>
      </div>
    </div>
  );
}