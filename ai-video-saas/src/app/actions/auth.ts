'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function customerLogin() {
  cookies().set('mock_role', 'customer', { path: '/' });
  redirect('/dashboard');
}

export async function ownerLogin() {
  cookies().set('mock_role', 'owner', { path: '/' });
  redirect('/owner-dashboard');
}

export async function logout() {
  cookies().delete('mock_role');
  redirect('/');
}
