import type { Metadata } from "next";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "MovieStream admin dashboard with system overview and key metrics.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
