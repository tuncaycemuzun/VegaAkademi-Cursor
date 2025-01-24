interface EditorJSBlock {
  id: string
  type: string
  data: any
}

interface EditorJSContent {
  time: number
  blocks: EditorJSBlock[]
}

export interface Post {
  id: string
  title: string
  content: string | EditorJSContent
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
  tags?: string[]
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