import { Resend } from 'resend'

export function getResend() {
	const key = process.env.RESEND_API_KEY
	if (!key) throw new Error('Missing RESEND_API_KEY. Pass it via environment variables')
	return new Resend(key)
}

export const FROM = 'Peretik <no-reply@peretik.site>'
