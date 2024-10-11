
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageIcon, VideoIcon, FileIcon, Send, X } from 'lucide-react';
import { uploadFileToPinata } from '@/utils/pinnata';
import { Socket } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { fetchAllUsers } from "@/lib/features/FetchAllUsersSlice";
import { usePathname } from "next/navigation";

interface CreatePostProps {
  socketRef: React.MutableRefObject<Socket | null>;
  isAuthenticated: boolean;
  account: string;
  space: string;
  privateSpaceId: string | null;
  channel: string | null;
}

interface PostData {
  resources: {
    resourceUrl: string;
    dataType: string;
  }[];
  message: string;
}


const CreatePost: React.FC<CreatePostProps> = ({ isAuthenticated, socketRef, account, space, privateSpaceId, channel }) => {
  // const path = usePathname();
  const path = "/home";
  // console.log(path);

  const dispatch = useAppDispatch();
  const userProfile = (useAppSelector(state => state.fetchAllUser.users)).find(user => user.address === account);
  // console.log("comp: ", userProfile);

  const [newPost, setNewPost] = useState<PostData>({
    resources: [],
    message: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchAllUsers())
  }, [])




  // const { space, privateId, channel } = parsePathForPostData(path);
  // console.log(space, privateId, channel);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newFilePreviews = newFiles.map(file => URL.createObjectURL(file));
      const fileExtensions = newFiles.map(file => file.name.split('.').pop() || '');
      setSelectedFiles([...selectedFiles, ...newFiles]);
      setFilePreviews([...filePreviews, ...newFilePreviews]);
      setNewPost({
        ...newPost,
        resources: [
          ...newPost.resources,
          ...newFiles.map((file, index) => ({
            resourceUrl: newFilePreviews[index],
            dataType: fileExtensions[index],
          }))
        ]
      });
    }
  };

  const removeFile = (fileIndex: number) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== fileIndex));
    setFilePreviews(filePreviews.filter((_, index) => index !== fileIndex));
    setNewPost({
      ...newPost,
      resources: newPost.resources.filter((_, index) => index !== fileIndex)
    });
  };
  const formatFileSize = (size: number) => {
    if (size >= 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (size >= 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return size + ' bytes';
    }
  };


  const handleCreatePost = async () => {
    if (isAuthenticated && socketRef.current) {
      if (newPost) {
        try {
          const uploadPromises = selectedFiles.map(file => uploadFileToPinata(file));
          const responses = await Promise.all(uploadPromises);
          const updatedResources = responses.map((response, index) => ({
            resourceUrl: response.IpfsHash,
            dataType: newPost.resources[index].dataType
          }));
          const finalPost = {
            ...newPost,
            resources: updatedResources
          };
          const postData = {
            title: "POST",
            description: finalPost.message,
            post: JSON.stringify(finalPost.resources),
            createdBy: (userProfile as any)?._id,
            space: space,
            privateSpaceId: privateSpaceId,
            channel: channel
          };
          socketRef.current.emit("create_post", postData);
          setNewPost({
            resources: [],
            message: '',
          });
          setSelectedFiles([]);
          setFilePreviews([]);
        } catch (error) {
          console.error("File upload failed:", error);
        }
      }
    } else {
      console.log("register yourself!");
    }
  };



  return (
    <div>
      <Card className="shadow-sm rounded-lg mb-4">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
              <AvatarFallback>BN</AvatarFallback>
            </Avatar>
            <Input
              placeholder="Create a post"
              className="text-sm h-9 w-full"
              value={newPost.message}
              onChange={(e) => setNewPost({ ...newPost, message: e.target.value })}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="upload-image"
                  onChange={handleFileUpload}
                />
                <label htmlFor="upload-image" className="cursor-pointer flex items-center">
                  <ImageIcon className="mr-1 h-4 w-4" /> Upload Image
                </label>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  id="upload-video"
                  onChange={handleFileUpload}
                />
                <label htmlFor="upload-video" className="cursor-pointer flex items-center">
                  <VideoIcon className="mr-1 h-4 w-4" /> Upload Video
                </label>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  className="hidden"
                  id="upload-file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="upload-file" className="cursor-pointer flex items-center">
                  <FileIcon className="mr-1 h-4 w-4" /> Upload File
                </label>
              </Button>
            </div>
            <Button size="sm" className="text-xs" onClick={handleCreatePost}>
              <Send className="mr-1 h-4 w-4" /> Post
            </Button>
          </div>
          <div className="flex gap-4">
            {filePreviews.map((preview, index) => (
              <div key={index} className="mt-4 relative inline-block ">
                {selectedFiles[index]?.type.startsWith('image/') && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
                {selectedFiles[index]?.type.startsWith('video/') && (
                  <video
                    src={preview}
                    controls
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
                {selectedFiles[index]?.type === 'application/pdf' && (
                  <iframe
                    src={preview}
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
                {(selectedFiles[index]?.type === 'application/msword' || selectedFiles[index]?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview)}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
                {!selectedFiles[index]?.type.startsWith('image/') && !selectedFiles[index]?.type.startsWith('video/') && !selectedFiles[index]?.type.startsWith('application/pdf') && !selectedFiles[index]?.type.startsWith('application/msword') && !selectedFiles[index]?.type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                  <div className="h-20 w-20 flex items-center justify-center bg-gray-200 rounded">
                    <span className="text-[6px]">{selectedFiles[index]?.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="text-sm">{selectedFiles[index] && formatFileSize(selectedFiles[index].size)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default CreatePost;