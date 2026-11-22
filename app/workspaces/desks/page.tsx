import { redirect } from 'next/navigation'

// The rooms now live on one Workspaces page (see the Citizen Space website layout).
export default function Page() {
  redirect('/workspaces#desks')
}
