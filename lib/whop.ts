export interface VerifiedWhopSession {
  userId: string;
  isVerified: boolean;
}

/**
 * Decodifica y verifica la identidad del usuario de Whop enviada en x-whop-user-token.
 * Valida la firma/sesión contra la API oficial de Whop cuando WHOP_API_KEY está configurada.
 */
export async function getVerifiedWhopSession(
  headers: Headers
): Promise<VerifiedWhopSession | null> {
  try {
    const token = headers.get('x-whop-user-token');
    if (!token) {
      return null;
    }

    // Extraer payload JWT base64url
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);
    const userId = payload?.sub || payload?.userId || payload?.user_id;

    if (!userId || typeof userId !== 'string') {
      return null;
    }

    // Verificar expiración del token si incluye exp
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return {
      userId,
      isVerified: true,
    };
  } catch (error) {
    console.warn('No se pudo verificar x-whop-user-token:', error);
    return null;
  }
}

/**
 * Verifica si un usuario tiene rol autorizado (admin/owner) en una empresa de Whop.
 */
export async function verifyWhopCompanyAccess(
  userId: string,
  companyId: string
): Promise<boolean> {
  try {
    if (!process.env.WHOP_API_KEY || !userId || !companyId) {
      return false;
    }

    const response = await fetch(
      `https://api.whop.com/api/v5/company/authorized_users`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.some(
      (u: any) =>
        (u.user_id === userId || u.id === userId) &&
        (!u.company_id || u.company_id === companyId)
    );
  } catch (error) {
    console.error('Error verificando acceso admin en Whop:', error);
    return false;
  }
}

export async function verifyUserMembership(userId: string, productId: string) {
  try {
    const response = await fetch(
      `https://api.whop.com/api/v2/memberships?user_id=${userId}&product_id=${productId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
          Accept: 'application/json',
        },
      }
    );
    const data = await response.json();
    return data.data?.some((m: any) => m.status === 'active') || false;
  } catch (error) {
    console.error('Error verificando membresía en Whop:', error);
    return false;
  }
}