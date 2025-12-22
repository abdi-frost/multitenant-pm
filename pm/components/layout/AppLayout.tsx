
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { CircuitBoard, LayoutDashboard, Moon, Sun, UserRound, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

type NavItem = {
	href: string;
	label: string;
	icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
	{
		href: "/dashboard",
		label: "Dashboard",
		icon: <LayoutDashboard className="size-4" />,
	},
	{
		href: "/team",
		label: "Team",
		icon: <UsersRound className="size-4" />,
	},
	{
		href: "/app",
		label: "Workspace",
		icon: <CircuitBoard className="size-4" />,
	},
];

function isActivePath(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="rounded-full"
		>
			{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
		</Button>
	);
}

function CapsuleNav({ className }: { className?: string }) {
	const pathname = usePathname();

	return (
		<nav
			className={
				className ??
				"inline-flex items-center gap-1 rounded-full border bg-card/60 p-1 shadow-sm backdrop-blur"
			}
			aria-label="Primary"
		>
			{NAV_ITEMS.map((item) => {
				const active = isActivePath(pathname, item.href);
				return (
					<Button
						key={item.href}
						asChild
						variant={active ? "secondary" : "ghost"}
						size="sm"
						className="rounded-full"
					>
						<Link href={item.href} aria-current={active ? "page" : undefined}>
							<span className="hidden sm:inline-flex items-center gap-2">
								{item.icon}
								{item.label}
							</span>
							<span className="sm:hidden inline-flex items-center gap-2">
								{item.icon}
								{item.label}
							</span>
						</Link>
					</Button>
				);
			})}
		</nav>
	);
}

function MobileDock() {
	const pathname = usePathname();

	return (
		<div className="fixed inset-x-0 bottom-4 z-40 mx-auto w-full px-4 sm:hidden">
			<div className="mx-auto max-w-sm rounded-2xl border bg-card/70 p-1 shadow-lg backdrop-blur">
				<div className="grid grid-cols-3 gap-1">
					{NAV_ITEMS.map((item) => {
						const active = isActivePath(pathname, item.href);
						return (
							<Button
								key={item.href}
								asChild
								variant={active ? "secondary" : "ghost"}
								size="sm"
								className="h-11 rounded-xl justify-center"
							>
								<Link href={item.href} aria-current={active ? "page" : undefined}>
									<span className="inline-flex items-center gap-2">
										{item.icon}
										{item.label}
									</span>
								</Link>
							</Button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const { user, logout } = useAuth();

	return (
		<div className="min-h-screen bg-background">
			<header className="fixed inset-x-0 top-0 z-40">
				<div className="mx-auto max-w-6xl px-4">
					<div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border bg-card/60 px-3 py-2 shadow-sm backdrop-blur">
						<div className="flex items-center gap-2">
							<div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
								PM
							</div>
							<div className="leading-tight">
								<div className="text-sm font-semibold">Project Management</div>
								<div className="text-xs text-muted-foreground truncate max-w-[12rem]">
									{user?.name ?? ""}
								</div>
							</div>
						</div>

						<div className="hidden sm:flex items-center justify-center flex-1">
							<CapsuleNav />
						</div>

						<div className="flex items-center gap-2">
							<ThemeToggle />
							<Button variant="outline" size="sm" onClick={logout}>
								Sign out
							</Button>
						</div>
					</div>
				</div>
			</header>

			<MobileDock />

			<main className="mx-auto max-w-6xl px-4 pt-24 pb-28">
				<div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
					<div className="p-4 sm:p-6">{children}</div>
				</div>
			</main>
		</div>
	);
}

