// app/api/admin/repair-orphan/route.ts
// Permite que admins reparem registros órfãos ou incorretos no Firestore
// Suporta POST (adição/correção) e DELETE (exclusão em massa)

import { NextResponse } from 'next/server';
import { adminDb, getUserFromToken } from '@/lib/firestore';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('__session')?.value;
        const user = await getUserFromToken(token) as any;

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso restrito a Admins' }, { status: 403 });
        }

        const { id, type, updates } = await req.json();

        if (!id || !type || !updates) {
            return NextResponse.json({ error: 'ID, tipo e dados de atualização são obrigatórios' }, { status: 400 });
        }

        const collectionName = type === 'address' ? 'addresses' :
            type === 'territory' ? 'territories' :
                type === 'witnessing' ? 'witnessing_points' :
                    type === 'visit' ? 'visits' :
                        type === 'city' ? 'cities' : type;

        // Atualiza o registro no Firestore
        const docRef = adminDb.collection(collectionName).doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Nenhum registro encontrado para atualizar' }, { status: 404 });
        }

        await docRef.update({
            ...updates,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('Repair API Critical Error (POST):', error);
        return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('__session')?.value;
        const user = await getUserFromToken(token) as any;

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso restrito a Admins' }, { status: 403 });
        }

        const { ids, type } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0 || !type) {
            return NextResponse.json({ error: 'IDs e tipo são obrigatórios para exclusão em massa' }, { status: 400 });
        }

        const collectionName = type; // Recebe o nome da coleção diretamente (addresses, visits, etc)

        // Deleta em lote (máximo 500 por batch do Firestore)
        const batch = adminDb.batch();
        const collectionRef = adminDb.collection(collectionName);

        // Processa os primeiros 500 para evitar limite do batch
        const cappedIds = ids.slice(0, 500);
        cappedIds.forEach(id => {
            batch.delete(collectionRef.doc(id));
        });

        await batch.commit();

        return NextResponse.json({
            success: true,
            count: cappedIds.length,
            remaining: ids.length > 500 ? ids.length - 500 : 0
        });

    } catch (error: any) {
        console.error('Repair API Critical Error (DELETE):', error);
        return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
    }
}
