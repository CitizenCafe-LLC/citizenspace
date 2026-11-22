import { redirect } from 'next/navigation'

// The member menu now lives on /cafe.
export default function Page() {
  redirect('/cafe#menu')
}
