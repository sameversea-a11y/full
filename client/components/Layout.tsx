import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  LayoutDashboard,
  User,
  CreditCard,
  LogOut,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (page: string) => {
    switch (page) {
      case "dashboard":
        if (isAdminPage) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
        break;
      case "profile":
        navigate("/profile");
        break;
      case "transactions":
        navigate("/transactions");
        break;
      case "logout":
        navigate("/");
        break;
      default:
        break;
    }
  };

  // Check if current page is admin
  const isAdminPage = location.pathname.includes("/admin");

  const sidebarItems = isAdminPage
    ? [
        {
          id: "dashboard",
          label: "Admin Dashboard",
          icon: LayoutDashboard,
          path: "/admin",
        },
        {
          id: "profile",
          label: "Profile",
          icon: User,
          path: "/profile",
        },
      ]
    : [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/dashboard",
        },
        {
          id: "profile",
          label: "Profile",
          icon: User,
          path: "/profile",
        },
        {
          id: "transactions",
          label: "Transactions",
          icon: CreditCard,
          path: "/transactions",
        },
      ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-4 lg:px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg hidden sm:block">
                UDIN Portal
              </h2>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 lg:px-3 py-4">
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full justify-start gap-3 px-3 py-2 ${
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="mt-auto pt-4">
              <Separator className="mb-4" />
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation("logout")}
                    className="w-full justify-start gap-3 px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="flex items-center px-4 lg:px-6 py-4 border-b bg-white/50 backdrop-blur-sm">
            <SidebarTrigger className="mr-2 lg:mr-4" />
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {title}
            </h1>
          </div>

          <div className="flex-1 px-4 lg:px-6 py-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
