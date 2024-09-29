import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageIcon, VideoIcon, FileIcon, Send, X } from 'lucide-react';
import { uploadFileToPinata } from '@/utils/pinnata';

interface CreatePostProps {
  selectedSpace: any;
  postData: PostData[];
  setPostData: React.Dispatch<React.SetStateAction<PostData[]>>;
}

interface PostData {
  id: number;
  resources: {
    resourceUrl: string;
    dataType: string;
  }[];
  message: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ selectedSpace, postData, setPostData }) => {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: number]: File[] }>({});
  const [filePreviews, setFilePreviews] = useState<{ [key: number]: string[] }>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, postId: number) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newFilePreviews = newFiles.map(file => URL.createObjectURL(file));
      const fileExtensions = newFiles.map(file => file.name.split('.').pop() || '');

      setSelectedFiles(prevFiles => ({
        ...prevFiles,
        [postId]: [...(prevFiles[postId] || []), ...newFiles]
      }));

      setFilePreviews(prevPreviews => ({
        ...prevPreviews,
        [postId]: [...(prevPreviews[postId] || []), ...newFilePreviews]
      }));

      setPostData(prevData => prevData.map(post => post.id === postId ? {
        ...post,
        resources: [
          ...post.resources,
          ...newFiles.map((file, index) => ({
            resourceUrl: newFilePreviews[index],
            dataType: fileExtensions[index]
          }))
        ]
      } : post));
    }
  };

  const removeFile = (postId: number, fileIndex: number) => {
    setSelectedFiles(prevFiles => ({
      ...prevFiles,
      [postId]: prevFiles[postId].filter((_, index) => index !== fileIndex)
    }));

    setFilePreviews(prevPreviews => ({
      ...prevPreviews,
      [postId]: prevPreviews[postId].filter((_, index) => index !== fileIndex)
    }));

    setPostData(prevData => prevData.map(post => post.id === postId ? {
      ...post,
      resources: post.resources.filter((_, index) => index !== fileIndex)
    } : post));
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

  const handleCreatePost = async (postId: number) => {
    const post = postData.find(p => p.id === postId);
    if (post && selectedFiles[postId]) {
      try {
        const uploadPromises = selectedFiles[postId].map(file => uploadFileToPinata(file));
        const responses = await Promise.all(uploadPromises);

        const updatedResources = responses.map((response, index) => ({
          resourceUrl: response.IpfsHash,
          dataType: post.resources[index].dataType
        }));

        setPostData(prevData => prevData.map(p => p.id === postId ? {
          ...p,
          resources: updatedResources
        } : p));

        if (responses.some(response => !response.IpfsHash) || !post.message) {
          throw new Error("File upload failed");
        }
        // Handle post creation logic here
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }
  };

  return (
    <div>
      {postData.map(post => (
        <Card key={post.id} className="shadow-sm rounded-lg mb-4">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
                <AvatarFallback>BN</AvatarFallback>
              </Avatar>
              <Input
                placeholder="Create a post"
                className="text-sm h-9 w-full"
                value={post.message}
                onChange={(e) => setPostData(prevData => prevData.map(p => p.id === post.id ? { ...p, message: e.target.value } : p))}
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
                    id={`upload-image-${post.id}`}
                    onChange={(e) => handleFileUpload(e, post.id)}
                  />
                  <label htmlFor={`upload-image-${post.id}`} className="cursor-pointer flex items-center">
                    <ImageIcon className="mr-1 h-4 w-4" /> Upload Image
                  </label>
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    id={`upload-video-${post.id}`}
                    onChange={(e) => handleFileUpload(e, post.id)}
                  />
                  <label htmlFor={`upload-video-${post.id}`} className="cursor-pointer flex items-center">
                    <VideoIcon className="mr-1 h-4 w-4" /> Upload Video
                  </label>
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    className="hidden"
                    id={`upload-file-${post.id}`}
                    onChange={(e) => handleFileUpload(e, post.id)}
                  />
                  <label htmlFor={`upload-file-${post.id}`} className="cursor-pointer flex items-center">
                    <FileIcon className="mr-1 h-4 w-4" /> Upload File
                  </label>
                </Button>
              </div>
              <Button size="sm" className="text-xs" onClick={() => handleCreatePost(post.id)}>
                <Send className="mr-1 h-4 w-4" /> Post
              </Button>
            </div>
          <div className="flex gap-4">
          {filePreviews[post.id] && filePreviews[post.id].map((preview, index) => (
              <div key={index} className="mt-4 relative inline-block ">
                {selectedFiles[post.id][index]?.type.startsWith('image/') && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
                {selectedFiles[post.id][index]?.type.startsWith('video/') && (
                  <video
                    src={preview}
                    controls
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
                {selectedFiles[post.id][index]?.type === 'application/pdf' && (
                  <iframe
                    src={preview}
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
                {(selectedFiles[post.id][index]?.type === 'application/msword' || selectedFiles[post.id][index]?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview)}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
                {!selectedFiles[post.id][index]?.type.startsWith('image/') && !selectedFiles[post.id][index]?.type.startsWith('video/') && !selectedFiles[post.id][index]?.type.startsWith('application/pdf') && !selectedFiles[post.id][index]?.type.startsWith('application/msword') && !selectedFiles[post.id][index]?.type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                  <div className="h-20 w-20 flex items-center justify-center bg-gray-200 rounded">
                    <span className="text-[6px]">{selectedFiles[post.id][index]?.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(post.id, index)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="text-sm">{selectedFiles[post.id][index] && formatFileSize(selectedFiles[post.id][index].size)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CreatePost;