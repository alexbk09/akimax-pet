type QueryResult = { data: unknown[]; error: null }

const result = (): QueryResult => ({ data: [], error: null })

const chain = () => {
  const builder: Record<string, unknown> = {}
  for (const method of ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'ilike', 'gte', 'lte', 'lt', 'gt', 'in', 'order', 'limit', 'range', 'single', 'maybeSingle']) {
    builder[method] = (...args: unknown[]) => method === 'single' || method === 'maybeSingle' ? Promise.resolve({ data: null, error: null }) : builder
  }
  builder.then = (resolve: (value: QueryResult) => unknown) => Promise.resolve(resolve(result()))
  return builder
}

export const supabase: any = {
  from: (_table: string) => chain(),
  storage: { from: (_bucket: string) => ({ upload: async () => ({ data: null, error: null }), remove: async () => ({ data: null, error: null }), getPublicUrl: (path: string) => ({ data: { publicUrl: path } }) }) },
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: null }),
    updateUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: (_callback: unknown) => ({ data: { subscription: { unsubscribe: () => undefined } } }),
  },
}

