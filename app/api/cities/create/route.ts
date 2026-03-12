// app/api/cities/create/route.ts
// API para criação de cidades no Firestore
// Migrado de Supabase para Firebase Admin SDK

import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    try {
        // Verifica autenticação e permissões (Ancião ou de maior nível)
        const user = await requireAuth(['ANCIAO', 'SERVO', 'ADMIN']);

        const body = await req.json();
        const { name, uf, congregationId, congregation_id, parentCity, parent_city, lat, lng } = body;

        // Suporta tanto camelCase quanto snake_case do corpo da requisição
        const cId = congregationId || congregation_id;
        const pCity = parentCity || parent_city;

        if (!name || !cId) {
            return NextResponse.json({ error: 'Nome e congregação são obrigatórios.' }, { status: 400 });
        }

        // Se for Ancião/Servo, só pode criar para a própria congregação
        if (user.role !== 'ADMIN' && cId !== user.congregationId) {
            return NextResponse.json({ error: 'Você só pode gerenciar dados da sua congregação.' }, { status: 403 });
        }

        // Inserção no Firestore
        const docRef = await adminDb.collection('cities').add({
            name,
            uf: uf || 'SP',
            congregationId: cId,
            parentCity: pCity || null,
            lat: lat ? Number(lat) : null,
            lng: lng ? Number(lng) : null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error: any) {
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
        if (error.message === 'Forbidden') return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });

        console.error('[CITIES_CREATE] API Critical Error:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
