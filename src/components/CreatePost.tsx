import { useMutation } from '@tanstack/react-query';
import React, { type ChangeEvent } from 'react'
import { useState } from 'react'
import { supabase } from '../supabase-client';
import { useAuth } from '../context/AuthContent';

interface PostInput {
    title: string;
    content: string;
    avatar_url: string | null;
}

const createPost = async (post:PostInput, imageFile:File )=> {
    const filepath = `${post.title}-${Date.now()}-${imageFile.name}`;
    const {error: uploadError} = await supabase.storage.from("post-image").upload(filepath,imageFile)
    if(uploadError) throw new Error(uploadError.message);

    const {data: publicURLData} = supabase.storage.from("post-image").getPublicUrl(filepath);

    const {data,error} = await supabase.from("posts").insert({...post,image_url:publicURLData.publicUrl});

    if(error) throw new Error(error.message);
    return data;
}

const CreatePost = () => {

    const [title, setTitle] = useState<string>("");
    const [content,setContent] = useState<string>("");
    const [selectedFile,setSelectedFile] = useState<File | null>(null);

    const{user} = useAuth();

    const {mutate, isPending, isError} = useMutation({mutationFn: (data: {post:PostInput; imageFile: File})=>{
       return createPost(data.post,data.imageFile);
    }})

    const handleSubmit = (event: React.FormEvent)=>{
        event.preventDefault();
        if(!selectedFile) return;
        mutate({post: {title,content,avatar_url: user?.user_metadata.avatar_url || null,}, imageFile:selectedFile});
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]){
        setSelectedFile(e.target.files[0]);
      }
    }
    
    
    return (
    <form onSubmit={handleSubmit} className='max-w-2xl mx-auto space-y-4'>
        <div>
            <label htmlFor="title" className='mb-2 block font-medium'>Title</label>
            <input type="text" id="title" required 
            className='w-full border border-white/10 bg-transparent p-2 rounded'
            onChange={(e)=>setTitle(e.target.value)}/>
        </div>
        <div>
            <label htmlFor="content" className='mb-2 block font-medium'>Content</label>
            <textarea name="" id="content" required rows={5} 
            className='w-full border border-white/10 bg-transparent p-2 rounded'
            onChange={(e)=>setContent(e.target.value)}/>
        </div>
        <div>
            <label htmlFor="image" className='mb-2 block font-medium'>Upload Image</label>
            <input name="" id="image" required type='file' accept='image/*'
            className='w-full text-gray-200'
            onChange={handleFileChange}/>
        </div>
        <button type='submit' 
        className='bg-purple-500 text-white px-4 py-2 rounded cursor-pointer'>
            {isPending? "Creating...": "Create Post"}
        </button>

        {isError && <p className='text-red-500'>Error Creating Post. </p>}
    </form>
  )
}

export default CreatePost
