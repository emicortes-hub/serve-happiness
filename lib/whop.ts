export async function verifyUserMembership(userId: string, productId: string) {
  try {
    const response = await fetch(`https://api.whop.com/api/v2/memberships?user_id=${userId}&product_id=${productId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return data.data?.some((m: any) => m.status === "active") || false;
  } catch (error) {
    console.error("Error verificando membresía en Whop:", error);
    return false;
  }
}