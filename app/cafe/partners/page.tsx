import { redirect } from 'next/navigation'

// The old partners page listed San Francisco shops. The member menu comes from Zachary's, downstairs.
export default function Page() {
  redirect('/cafe')
}
