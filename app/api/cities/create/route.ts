// app/api/cities/create/route.ts
// API para criação de cidades no Firestore
// Migrado de Supabase para Firebase Admin SDK

import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { SecurityLogger } from '@/lib/security-logger';
import { sanitizeInput } from '@/lib/validation';

export async function POST(req: Request) {
    let currentUser: any = null;
    try {
        // 1. Verifica autenticação e permissões (Ancião ou de maior nível)
        currentUser = await requireAuth(req, ['ANCIAO', 'SERVO', 'ADMIN']);

        // 2. Sanitização do Input
        const body = await req.json();
        const sanitizedBody = sanitizeInput(body);
        const { name, uf, congregationId, congregation_id, parentCity, parent_city, lat, lng } = sanitizedBody;

        // Suporta tanto camelCase quanto snake_case
        const cId = congregationId || congregation_id;
        const pCity = parentCity || parent_city;

        if (!name || !cId) {
            return NextResponse.json({ error: 'Nome e congregação são obrigatórios.' }, { status: 400 });
        }

        // 3. Verificação de Isolamento
        // Se for Ancião/Servo, só pode criar para a própria congregação
        if (currentUser.role !== 'ADMIN' && cId !== currentUser.congregationId) {
            await SecurityLogger.logUnauthorizedAccess(
                currentUser.uid, 
                `cities:${cId}`, 
                'CREATE_OUTSIDE_CONGREGATION',
                req.headers.get('x-forwarded-for') || undefined
            );
            return NextResponse.json({ error: 'Você só pode gerenciar dados da sua congregação.' }, { status: 403 });
        }

        // 4. Inserção no Firestore
        const docRef = await adminDb.collection('cities').add({
            name,
            uf: uf || 'SP',
            congregationId: cId,
            parentCity: pCity || null,
            lat: lat ? Number(lat) : null,
            lng: lng ? Number(lng) : null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            createdBy: currentUser.uid // Auditoria básica no documento
        });

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error: any) {
        const ip = req.headers.get('x-forwarded-for') || undefined;

        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
        }
        
        if (error.message === 'Forbidden') {
            if (currentUser) {
                await SecurityLogger.logUnauthorizedAccess(currentUser.uid, 'api/cities/create', 'FORBIDDEN_ROLE', ip);
            }
            return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
        }

        console.error('[CITIES_CREATE] API Critical Error:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
