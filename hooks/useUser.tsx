import { User } from "@supabase/auth-helpers-nextjs"
import {
    useSessionContext,
    useUser as useSupaUser
} from "@supabase/auth-helpers-react";
import { Profile } from "@/types";

import { useContext, createContext, useState, useEffect } from "react";

type UserContextType = {
    accessToken: string | null;
    user: User | null;
    userDetails: Profile | null;
    isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export interface Props {
    [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
    const {
        session,
        isLoading: isLoadingUser,
        supabaseClient: supabase
    } = useSessionContext()
    const user = useSupaUser()
    const accessToken = session?.access_token ?? null;
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [userDetails, setUserDetails] = useState<Profile | null>(null)

    const getUserDetails = async (userId: string) => {
        return supabase.from('profiles').select('*').eq('id', userId).single()
    }

    useEffect(() => {
        if (user && !isLoadingData && !userDetails) {
            setIsLoadingData(true)

            Promise.allSettled([getUserDetails(user.id)]).then(
                (results) => {
                    const userDetailsPromise = results[0];

                    if (userDetailsPromise.status === "fulfilled" && userDetailsPromise.value.data) {
                        setUserDetails(userDetailsPromise.value.data as Profile);
                    } else if (userDetailsPromise.status === "rejected") {
                        console.error('Error fetching user details:', userDetailsPromise.reason);
                    }

                    setIsLoadingData(false)
                }
            )
        } else if (!user && !isLoadingUser && !isLoadingData) {
            setUserDetails(null);
        }
    }, [user, isLoadingUser])

    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingUser || isLoadingData,
    }

    return <UserContext.Provider value={value} {...props} />
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a MyUserContextProvider')
    }

    return context;
}