import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'membership.went_valid':
        console.log('Nueva membresía activa para el usuario:', data.user_id);
        break;
      case 'membership.went_invalid':
        console.log('Membresía caducada o cancelada:', data.user_id);
        break;
      default:
        console.log(`Evento de Whop recibido: ${action}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
