import { NextResponse } from 'next/server';

export async function GET() {
    const envs = {
        FB_ADMIN_PRIVATE_KEY: !!process.env.FB_ADMIN_PRIVATE_KEY,
        FIREBASE_ADMIN_PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        FB_ADMIN_CLIENT_EMAIL: !!process.env.FB_ADMIN_CLIENT_EMAIL,
        FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ausente',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
        KEY_LENGTH: process.env.FB_ADMIN_PRIVATE_KEY?.length || 0,
        EMAIL_VAL: process.env.FB_ADMIN_CLIENT_EMAIL?.includes('@') ? 'valido' : 'invalido'
    };

    return NextResponse.json(envs);
}
