import AdminRoute from "../components/AdminRoute"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
       {children}
    </AdminRoute>
  );
}