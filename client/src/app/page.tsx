"use client"
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import axios, { all } from "axios";


type Post = {
  post: string;
  title: string;
  description: string;
  createdBy: string;
  repostBy: string;
  repostDescription: string;
  timestamp: number;
  likes: string[];
  comments: Comment[];
  type: "created" | "repost";
}

export default function Home() {

  const [titleInput, setTitleInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState([]);

  const [comment, setComment] = useState("");

  useEffect(() => {
    checkAuthStatus();
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_API_URL as string);

      socketRef.current.on("fetch_post", (post: string) => {
        console.log("post data: ", post);
      })

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && socketRef.current) {
      socketRef.current.emit("join_space", { space: "public" });
      socketRef.current.on("fetch_post", (post) => {
        // setPosts(post);
        console.log("post data: ", post);
        const publicPost = [];
        const followingPost = [];


        for (const p of post?.publicPost) {
          if (p.timestamp) {
            publicPost.push(p);
          }
        }

        publicPost.sort((a, b) => b.timestamp - a.timestamp);


        for (const p of post?.followingPost) {
          if (p.timestamp) {
            followingPost.push(p);
          }
        }

        followingPost.sort((a, b) => b.timestamp - a.timestamp);

        console.log(publicPost, followingPost);


        const allPost = [...publicPost.slice(0, 60), ...followingPost.slice(0, 40)]
        allPost.sort((a, b) => b.timestamp - a.timestamp);

        setPosts(allPost)
      })
      socketRef.current.on("public_user", (data: any) => {
        console.log("public user data", data);
        console.log(data);
        setUsers(data?.users);
      })
      fetchPost();
      fetchAllUser();
    }
  }, [isAuthenticated])

  const fetchPost = async () => {
    try {
      const post = (await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/post/get/all/66f292a6714b25e3f78b1d3d`)).data;

      const publicPost = [];
      const followingPost = [];


      for (const p of post?.publicPost) {
        if (p.timestamp) {
          publicPost.push(p);
        }
      }

      publicPost.sort((a, b) => b.timestamp - a.timestamp);


      for (const p of post?.followingPost) {
        if (p.timestamp) {
          followingPost.push(p);
        }
      }

      followingPost.sort((a, b) => b.timestamp - a.timestamp);

      console.log(publicPost, followingPost);


      const allPost = [...publicPost.slice(0, 60), ...followingPost.slice(0, 40)]
      allPost.sort((a, b) => b.timestamp - a.timestamp);

      setPosts(allPost)
    } catch (error) {
      console.log(error);
    }
  }

  const fetchAllUser = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/getAllUsers`);
      setUsers(res.data?.users);
    } catch (error) {
      console.log(error);
    }
  }



  console.log(users);
  console.log(posts);

  const checkAuthStatus = async () => {
    try {
      const isAuth = (await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6`))?.data?.isAuth;
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
            createdBy: "66f292a6714b25e3f78b1d3d",
            space: "public",
            privateSpaceId: null,
            channel: null
          };

          console.log(postData);
          socketRef.current.emit("create_post", postData);
          setTitleInput("");
          setDescriptionInput("");
          setFileInput(null);
        } else {
          console.error("No content to post");
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
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
          comment: comment
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
    console.log("follow_user")
    try {
      if (isAuthenticated && socketRef.current) {
        socketRef.current.emit("follow_user", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleUnFollow = async (data: any) => {
    console.log("unfollow_user")
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
    // Extract the base64 data (remove the data URL prefix if present)
    const base64Data = base64String.split(',')[1] || base64String;

    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob from the binary data
    const blob = new Blob([byteArray], { type: fileType });

    // Create and return a new File object
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
            .filter((item: any) => item.address !== "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6")
            .map((item: any, index) => {
              const isFollowing = item.followers.some((follower: any) => follower.address === "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6");

              const data = {
                userId: "66f292a6714b25e3f78b1d3d",
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
          posts.map((item, index) => {
            const post = JSON.parse((item as any).post);
            const newFile = base64ToFile(post.content, post.fileName, post.type);
            const data = {
              _id: (item as any)._id,
              likedBy: "66f292b2714b25e3f78b1d40"
            }

            const repostData = {
              _id: (item as any)._id,
              repostBy: "66f292b2714b25e3f78b1d40",
              repostDescription: "This is DEFI REPOST"
            }
            return (
              <div key={index}>
                <img src={URL.createObjectURL(newFile)} alt={post.fileName} className="max-w-full h-auto" />
                <div className="flex">
                  <button type="button" onClick={() => handleLikePost(data)}>Like</button>
                  <div>
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} />
                    <button type="button" onClick={() => handleCommentPost((item as any)._id, "66f292a6714b25e3f78b1d3d")}>comment</button>
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