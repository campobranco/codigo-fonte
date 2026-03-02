// app/components/AssignedUserBadge.tsx
// Componente que exibe o primeiro nome de um usuário a partir de seu ID
// Migrado de Supabase para Firebase Firestore (Client SDK)

"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AssignedUserBadgeProps {
    userId: string;
    fallbackName: string;
}

export default function AssignedUserBadge({ userId, fallbackName }: AssignedUserBadgeProps) {
    // Estado inicial derivado do fallback para mostrar algo imediatamente
    const [displayName, setDisplayName] = useState(() => {
        return (fallbackName || '???').split(' ')[0].toUpperCase();
    });

    useEffect(() => {
        if (!userId) return;

        let isMounted = true;

        const fetchName = async () => {
            try {
                // Busca o documento do usuário no Firestore
                const userRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userRef);

                if (isMounted && userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.name) {
                        setDisplayName(data.name.split(' ')[0].toUpperCase());
                    }
                }
            } catch (e) {
                console.warn("[Badge] Error fetching name from Firestore:", e);
            }
        };

        fetchName();

        return () => { isMounted = false; };
    }, [userId]);

    return <>{displayName}</>;
}
