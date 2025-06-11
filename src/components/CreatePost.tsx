import { useMutation , useQuery } from '@tanstack/react-query';
import React, { type ChangeEvent, useRef } from 'react'
import { useState } from 'react'
import { supabase } from '../supabase-client';
import { useAuth } from '../context/AuthContent';
import { fetchCommunities, type Community } from './CommunityList';

interface PostInput {
    title: string;
    content: string;
    avatar_url: string | null;
    community_id?: number | null;
}

const createPost = async (post:PostInput, imageFile:File )=> {
    const filepath = sanitizeFileName(post.title, imageFile.name);
    const {error: uploadError} = await supabase.storage.from("post-image").upload(filepath,imageFile)
    if(uploadError) throw new Error(uploadError.message);

    const {data: publicURLData} = supabase.storage.from("post-image").getPublicUrl(filepath);

    const {data,error} = await supabase.from("posts").insert({...post,image_url:publicURLData.publicUrl});

    if(error) throw new Error(error.message);
    return data;
}

    function sanitizeFileName(title:string, originalFileName:string) {
  const cleanTitle = title.replace(/[^a-zA-Z0-9-_]/g, "-");
  const timestamp = Date.now();
  const extension = originalFileName.split(".").pop();
  return `${cleanTitle}-${timestamp}.${extension}`;
}

const CreatePost = () => {

    const [title, setTitle] = useState<string>("");
    const [content,setContent] = useState<string>("");
    const [selectedFile,setSelectedFile] = useState<File | null>(null);
    const [communityId, setCommunityId] = useState<number | null>(null);

    // Add ref for file input
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const {user} = useAuth();

    const {data: communities } = useQuery<Community[],Error>({
        queryKey: ["communities"],
        queryFn: fetchCommunities,
    });

    const {mutate, isPending, isError} = useMutation({
      mutationFn:
        (data: {post:PostInput; imageFile: File})=>{return createPost(data.post,data.imageFile);
        },
        onSuccess: () => {
            setTitle("");
            setContent("");
            setSelectedFile(null);
            setCommunityId(null);
            // Clear file input visually
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
      })

    const handleSubmit = (event: React.FormEvent)=>{
        event.preventDefault();
        if(!selectedFile) return;
        mutate({post: {title,content,avatar_url: user?.user_metadata.avatar_url || null,community_id: communityId}, imageFile:selectedFile,});
    }
    const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setCommunityId(value ? Number(value) : null);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]){
        setSelectedFile(e.target.files[0]);
      }
    }



    return (
    <form onSubmit={handleSubmit} className='max-w-2xl mx-auto space-y-4 bg-gray-900 p-7 rounded-4xl'>
        <div>
            <label htmlFor="title" className='mb-2 block font-medium'>Title</label>
            <input
                type="text"
                id="title"
                required
                value={title}
                className='w-full border border-white/10 bg-transparent p-2 rounded-2xl'
                onChange={(e)=>setTitle(e.target.value)}
            />
        </div>
        <div>
            <label htmlFor="content" className='mb-2 block font-medium'>Content</label>
            <textarea
                id="content"
                required
                rows={5}
                value={content}
                className='w-full border border-white/10 bg-transparent p-2 rounded-2xl'
                onChange={(e)=>setContent(e.target.value)}
            />
        </div>

         <div>
            <label> Select Community</label>
            <select
                id="community"
                onChange={handleCommunityChange}
                value={communityId ?? ""}
            >
                <option value={""} className='bg-black text-white'> -- Choose a Community -- </option>
                {communities?.map((community, key) => (
                    <option key={key} value={community.id} className='text-white bg-black'>
                        {community.name}
                    </option>
                ))}
            </select>
        </div>

        <div>
            <label htmlFor="image" className='mb-2 block text-blue-400 font-medium'>Upload Image</label>
            <input
                ref={fileInputRef}
                id="image"
                required
                type='file'
                accept='image/*'
                className='w-full text-gray-200'
                onChange={handleFileChange}
            />
        </div>
                {selectedFile && (
        <img
            src={URL.createObjectURL(selectedFile)}
            alt="Preview"
            className="mt-2 rounded-xl max-h-48 object-cover"
        />
        )}
        <button type='submit'
        className='bg-purple-500 text-white px-4 py-2 rounded cursor-pointer'>
            {isPending? "Creating...": "Create Post"}
        </button>

        {isError && <p className='text-red-500'>You need to be logged in to create a post. </p>}
    </form>
  )
}

export default CreatePost