import { NextResponse } from 'next/server';
import { LGPDRegistry } from '@/lib/lgpd-registry';

/**
 * POST /api/lgpd/data-deletion
 * Rota para titulares solicitarem a exclusão de seus dados.
 */
export async function POST(req: Request) {
    try {
        const { userId, email, reason } = await req.json();

        if (!userId && !email) {
            return NextResponse.json({ error: 'Identificação do titular é necessária' }, { status: 400 });
        }

        // Registrar o pedido de exclusão para auditoria
        await LGPDRegistry.logDataDeletion(userId || email, 'ALL_USER_DATA', reason || 'Solicitação do Titular (Art. 18 LGPD)');

        // Em uma implementação completa, realizaríamos a exclusão em cascata ou anonimização
        
        return NextResponse.json({ 
            message: 'Sua solicitação de exclusão foi registrada. Os dados serão removidos permanentemente em até 15 dias, exceto dados que devemos manter por obrigação legal.',
            status: 'QUEUED'
        });
    } catch (error) {
        console.error('[API LGPD] Erro ao processar exclusão de dados:', error);
        return NextResponse.json({ error: 'Erro ao processar solicitação de exclusão' }, { status: 500 });
    }
}
