import type { Access } from 'payload'

export const isAdminOrEditor: Access = ({ req }) => {
  return req.user?.role === 'admin' || req.user?.role === 'editor'
}
