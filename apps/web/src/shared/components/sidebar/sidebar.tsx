import {
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger as SidebarTriggerUI,
	Sidebar as SidebarUI,
} from "@/shared/lib/ui/sidebar";

export const SidebarTrigger = () => {
	return <SidebarTriggerUI />;
};

type SidebarProps = {
	header: React.ReactNode;
	navigation: React.ReactNode;
	footer: React.ReactNode;
	children: React.ReactNode;
};

export const Sidebar = ({
	header,
	navigation,
	footer,
	children,
}: SidebarProps) => {
	return (
		<SidebarProvider>
			<aside>
				<SidebarUI>
					<SidebarHeader className="px-4 sm:p-4">{header}</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>{navigation}</SidebarGroup>
					</SidebarContent>
					<SidebarFooter>{footer}</SidebarFooter>
				</SidebarUI>
			</aside>
			<SidebarInset className="p-2 sm:p-4 flex flex-col gap-6">
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
};
