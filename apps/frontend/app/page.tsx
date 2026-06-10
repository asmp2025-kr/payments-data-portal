import { redirect } from 'next/navigation';

// Root "/" redirects to login page
export default function RootPage() {
  redirect('/login');
}
