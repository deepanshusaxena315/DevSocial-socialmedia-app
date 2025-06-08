import { useMutation } from '@tanstack/react-query';
import React from 'react'
import { useState } from 'react'
import { supabase } from '../supabase-client';

interface PostInput {
    title: string;
    content: string;
}

const createPost = async (post:PostInput) => {
    const {data,error} = await supabase.from("posts").insert(post);

    if(error) throw new Error(error.message);
    return data;
}

const CreatePost = () => {

    const [title, setTitle] = useState<string>("");
    const [content,setContent] = useState<string>("");

    const {mutate} = useMutation({mutationFn: createPost})

    const hadleSubmit = (event: React.FormEvent)=>{
        event.preventDefault();
        mutate({title,content})
    }
    return (
    <form action="">
        <div>
            <label htmlFor="">Title</label>
            <input type="text" id="title" required 
            onChange={(e)=>setTitle(e.target.value)}/>
        </div>
        <div>
            <label htmlFor="">Content</label>
            <textarea name="" id="content" required rows={5} 
            onChange={(e)=>setContent(e.target.value)}/>
        </div>
        <button type='submit'>Create Post</button>
    </form>
  )
}

export default CreatePost
