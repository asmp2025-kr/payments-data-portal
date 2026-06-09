'use client';

import Keycloak from 'keycloak-js';

let keycloak: Keycloak | null = null;

export function getKeycloak(): Keycloak {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost/auth',
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'payments',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'payments-portal',
    });
  }
  return keycloak;
}

export async function initAuth(): Promise<boolean> {
  const kc = getKeycloak();

  try {
    const authenticated = await kc.init({
      onLoad: 'login-required',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      checkLoginIframe: false,
    });

    if (authenticated) {
      localStorage.setItem('kc_token', kc.token || '');
      localStorage.setItem('tenant_id', (kc.tokenParsed as any)?.tenant_id || '');
      localStorage.setItem('user_role', (kc.tokenParsed as any)?.realm_access?.roles?.[0] || '');

      // Auto-refresh token
      kc.onTokenExpired = async () => {
        try {
          await kc.updateToken(30);
          localStorage.setItem('kc_token', kc.token || '');
        } catch {
          kc.login();
        }
      };
    }

    return authenticated;
  } catch (e) {
    console.error('Keycloak init failed:', e);
    return false;
  }
}

export function logout() {
  const kc = getKeycloak();
  localStorage.clear();
  kc.logout({ redirectUri: window.location.origin + '/login' });
}

export function getCurrentUser() {
  const kc = getKeycloak();
  if (!kc.tokenParsed) return null;
  const p = kc.tokenParsed as any;
  return {
    id: p.sub,
    tenantId: p.tenant_id,
    email: p.email,
    firstName: p.given_name,
    lastName: p.family_name,
    role: p.realm_access?.roles?.find((r: string) =>
      ['super_admin','bank_admin','operations','compliance','executive','auditor'].includes(r)
    ) || 'operations',
  };
}
