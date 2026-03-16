// app/api/cities/delete/route.ts
// API para exclusão de cidades no Firestore
// Migrado de Supabase para Firebase Admin SDK

import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        // Verifica autenticação e permissões (Ancião ou de maior nível)
        const user = await requireAuth(['ANCIAO', 'SERVO', 'ADMIN']);

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
        }

        // Busca a cidade alvo para verificar congregação
        const cityRef = adminDb.collection('cities').doc(id);
        const cityDoc = await cityRef.get();

        if (!cityDoc.exists) {
            return NextResponse.json({ error: 'Registro não encontrado.' }, { status: 404 });
        }

        const cityData = cityDoc.data();

        // Se for Ancião/Servo, só pode deletar da própria congregação
        if (user.role !== 'ADMIN' && cityData?.congregationId !== user.congregationId) {
            return NextResponse.json({ error: 'Você só pode excluir itens da sua congregação.' }, { status: 403 });
        }

        // Exclui do Firestore
        await cityRef.delete();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
        if (error.message === 'Forbidden') return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });

        console.error('[CITIES_DELETE] API Critical Error:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
