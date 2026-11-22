import { redirect } from 'next/navigation'

// Team pods aren't part of the 819 Pacific floor plan; send visitors to membership options.
export default function Page() {
  redirect('/membership')
}
