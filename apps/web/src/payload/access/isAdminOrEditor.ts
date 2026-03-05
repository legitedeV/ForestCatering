import type { Access } from 'payload';

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'editor';
};
