'use client'
import { LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "../ui/dropdown-menu"
import { useAuth } from "@/providers/AuthProvider"
import { useMutation } from "@tanstack/react-query"
import { logout } from "@/api"
import { Spinner } from "../ui/spinner"

interface AccountDropdownProps {
    minimal?: boolean
}

export const AccountDropdown = ({ minimal = false }: AccountDropdownProps) => {

    const { user } = useAuth();
    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            window.location.href = '/login';
        }
    })

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-2"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            SA
                        </AvatarFallback>
                    </Avatar>
                    {!minimal && (
                        <div className="flex flex-col items-start text-left">
                            <span className="text-sm font-medium">{user?.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {user?.email}
                            </span>
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    className="text-destructive"
                    disabled={logoutMutation.isPending}
                >
                    {logoutMutation.isPending ? <Spinner /> : <LogOut className="mr-2 h-4 w-4" />}
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}