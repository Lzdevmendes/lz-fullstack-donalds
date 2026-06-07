import { ReactNode } from "react";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

export default AdminLayout;
