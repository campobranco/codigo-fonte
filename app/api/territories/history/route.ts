// app/api/territories/history/route.ts
// API para histórico de territórios no Firestore
// Migrado de Supabase para Firebase Admin SDK

import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const user = await requireAuth();

        const { searchParams } = new URL(req.url);
        let congregationId = searchParams.get('congregationId');
        const territoryId = searchParams.get('territoryId');

        if (!territoryId) {
            return NextResponse.json({ error: 'ID do território não fornecido' }, { status: 400 });
        }

        // Segurança: Se não for ADMIN de sistema, usa a congregação do usuário logado
        if (user.role !== 'ADMIN' || !congregationId) {
            congregationId = user.congregationId || null;
        }

        if (!congregationId) {
            return NextResponse.json({ error: 'Congregação não identificada' }, { status: 400 });
        }

        // Consulta shared_lists onde o array 'items' contém este territoryId
        const snapshot = await adminDb.collection('shared_lists')
            .where('congregationId', '==', congregationId)
            .where('items', 'array-contains', territoryId)
            .orderBy('createdAt', 'desc')
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ data });
    } catch (error: any) {
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        console.error("[TERRITORY_HISTORY] API Error:", error);
        return NextResponse.json({
            error: error.message || 'Erro interno no servidor'
        }, { status: 500 });
    }
}
