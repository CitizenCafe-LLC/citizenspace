# Agent authentication

Citizen Space does not currently offer a separate authentication or registration flow for AI agents. The site's existing human auth (email/password, at `/login` and `/register`) is for members and doesn't have an agent-specific API surface yet.

If you're an agent acting on a person's behalf: read public pages directly (no auth required for `/`, `/membership`, `/workspaces`, `/cafe`, `/events`, `/gallery`, `/blog`, `/location`, `/contact`, `/about`, `/faq`) and direct the person to the site's own forms for anything that requires an account — joining the Founding 50, booking a space, or placing a cafe order.

This file will be updated if and when a dedicated agent registration flow exists.
