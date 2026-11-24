import { api, clearTokens, type User } from '../services/api';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function DashboardPage({ user, onLogout }: Props) {
  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // still log out locally even if the server call fails
    }
    clearTokens();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-[#F7FBFA] text-[#10243E] flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl" style={{ fontFamily: "'Fraunces', serif" }}>
        Welcome back, {user.first_name}
      </h1>
      <p className="text-[#4C5F70]">{user.email} — {user.region}, {user.country}</p>
      <a href="/profile" className="text-sm text-[#2A6DF4] hover:underline mt-2">
        Edit your profile →
      </a>
      <a href="/cv" className="text-sm text-[#2A6DF4] hover:underline">Upload your CV →</a>
      <a href="/careers" className="text-sm text-[#2A6DF4] hover:underline">
        View career matches →
      </a>
        
      <button
        onClick={handleLogout}
        className="mt-4 px-5 py-2 border border-[#C9DAD3] text-[#10243E] hover:border-[#9AAAB8] transition text-sm"
      >
        Log out
      </button>
    </div>
  );
}