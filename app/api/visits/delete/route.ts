// app/api/visits/delete/route.ts
// API para remoção de visitas vinculadas a uma lista compartilhada
// Migrado de Supabase para Firebase Admin SDK

import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

/**
 * Endpoint para remover uma visita registrada via link compartilhado.
 * Remove APENAS as visitas associadas àquele link específico e endereço.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { addressId, shareId } = body;

        if (!addressId || !shareId) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        // 1. Verificar se o link de compartilhamento existe
        const listDoc = await adminDb.collection('shared_lists').doc(shareId).get();

        if (!listDoc.exists) {
            return NextResponse.json({ error: 'Link de compartilhamento inválido' }, { status: 403 });
        }

        // 2. Remover a(s) visita(s) associada(s) do Firestore
        // Buscamos as visitas que correspondem ao endereço e à lista compartilhada
        const visitsSnapshot = await adminDb.collection('visits')
            .where('addressId', '==', addressId)
            .where('sharedListId', '==', shareId)
            .get();

        if (visitsSnapshot.empty) {
            return NextResponse.json({ success: true, message: 'Nenhuma visita encontrada para remover' });
        }

        // Firestore não deleta com query, precisamos deletar cada documento
        // Usamos um batch para eficiência e atomicidade
        const batch = adminDb.batch();
        visitsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[VISIT_DELETE_API] Critical Error:", error);
        return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
    }
}
