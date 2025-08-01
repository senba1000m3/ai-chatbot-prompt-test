import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User2, ChevronUp } from 'lucide-react';

interface AdvancedSidebarProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const AdvancedSidebar = ({ sidebar, children }: AdvancedSidebarProps) => {
  return (
    <SidebarProvider>
      <div className="flex w-full h-full">
        <Sidebar>
			<SidebarContent>
			  {sidebar}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<User2 /> Username
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								<DropdownMenuItem>
									<span>Account</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Billing</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
        </Sidebar>
        <main className="flex-1 w-full h-full min-w-0 min-h-0 flex flex-col p-0 m-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

