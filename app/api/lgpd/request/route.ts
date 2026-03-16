import { NextResponse } from 'next/server';
import { LGPDRegistry } from '@/lib/lgpd-registry';

/**
 * POST /api/lgpd/request
 * Rota para processar solicitações formais de titulares de dados.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, email, details } = body;

        // Validação básica
        if (!type || !email) {
            return NextResponse.json({ error: 'Tipo e email são obrigatórios' }, { status: 400 });
        }

        // Registrar a solicitação formal no banco de dados para auditoria e controle de prazos
        await LGPDRegistry.logFormalRequest(type, email, details || 'Sem detalhes fornecidos');

        // Em um cenário real, aqui poderíamos disparar um e-mail para o DPO ou para um sistema de tickets
        
        return NextResponse.json({ 
            message: 'Solicitação recebida com sucesso. O prazo de resposta é de até 15 dias.',
            reference: email
        });
    } catch (error) {
        console.error('[API LGPD] Erro ao processar solicitação:', error);
        return NextResponse.json({ error: 'Erro interno ao processar solicitação' }, { status: 500 });
    }
}
