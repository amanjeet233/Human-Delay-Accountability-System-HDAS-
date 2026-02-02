import { redirect } from 'next/navigation';

export default function HomePage() {
  // Government-grade first impression: show only login on open
  redirect('/login');
}
