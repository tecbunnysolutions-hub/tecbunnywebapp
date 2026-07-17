import { redirect } from 'next/navigation';

export default function WebmailRoot() {
  redirect('/inbox');
}
