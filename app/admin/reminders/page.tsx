// app/admin/reminders/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import RemindersDashboard from "./RemindersDashboard";

export default async function AdminRemindersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-linear-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-white">Reminders</h1>
        <p className="text-gray-400 mt-2">
          Create and manage reminders for your tasks and client follow-ups
        </p>
      </div>

      <RemindersDashboard />
    </div>
  );
}
