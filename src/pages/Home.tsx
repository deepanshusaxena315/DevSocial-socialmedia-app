
import PostList from '../components/PostList'

const Home = () => {
  return (
    <div className='pt-10'>
      <div className="max-w-5xl mx-auto text-center text-gray-300 mb-10 px-4">
  <p className="text-lg sm:text-xl leading-relaxed font-medium text-white">
    🚀 Dev<span className="text-purple-400 font-medium">.Social</span> is a space where developers share ideas, post updates,
    and connect with the tech community. Whether you're a beginner or a pro, drop your code, thoughts, or memes 🧠💬.
  </p>
</div>
      <h2 className='text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent'>
        Recent Posts</h2>
      <div className='sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[60vw] mx-auto'>
        <PostList/>
      </div>
    </div>
  )
}

export default Home
