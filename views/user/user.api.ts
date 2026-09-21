import { fetchClient } from "@/lib/fetchClients";
import { AuthUser } from "@/contexts/auth";
import { LoginUserDTO, UserBase } from "./user.type";

export const apiGetUsuarios = (): Promise<UserBase[]> => fetchClient('/api/users')

export const apiLogin = (data: LoginUserDTO): Promise<{ message: string; user: AuthUser }> =>
    fetchClient('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(data),
    })
