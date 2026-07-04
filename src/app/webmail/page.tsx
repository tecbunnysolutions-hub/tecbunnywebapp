import { redirect } from 'next/navigation';

export default function WebmailRedirect() {
  redirect('/webmail/inbox');
}
