import React, { createContext, ReactNode, useContext, useState } from "react";

type User = {
    token: string;
    [key: string]: unknown;
} | null;

type AuthContextType = {
    user: User;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(null);

    const login = async (email: string, password: string): Promise<void> => {
        const response = await fetch("https://api.websitechat.in/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log(data);
        if (data.token) setUser(data);
    };

    const logout = (): void => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
