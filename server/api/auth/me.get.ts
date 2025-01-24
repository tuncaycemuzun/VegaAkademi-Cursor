
export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 