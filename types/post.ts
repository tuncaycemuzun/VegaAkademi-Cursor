export interface Post {
  id: string
  title: string
  content: string
  slug: string
  author: {
    id: string
    name: string
  }
  likes: string[]
  comments: Array<{
    id: string
    content: string
    author: {
      id: string
      name: string
    }
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
  isLiked?: boolean
  isActive: boolean
  coverImage?: string | null
}

export interface PostsResponse {
  posts: Post[]
  pagination: {
    page: number
    total: number
    pageSize: number
    pageCount: number
  }
} 