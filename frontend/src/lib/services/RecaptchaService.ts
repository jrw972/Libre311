import type { Mode } from './mode';
import { z } from 'zod';

type RecaptchaToken = string;

type HasRecaptcha = {
	g_recaptcha_response: string;
};
export interface RecaptchaService {
	execute(action: string): Promise<RecaptchaToken>;
	wrapWithRecaptcha<T>(obj: T, action: string): Promise<T & HasRecaptcha>;
}

export const RecaptchaServicePropsSchema = z.object({
	recaptchaKey: z.string()
});
export type RecaptchaServiceProps = z.infer<typeof RecaptchaServicePropsSchema>;

class RecaptchaServiceImpl implements RecaptchaService {
	private recaptchaKey: string;
	constructor(props: RecaptchaServiceProps) {
		this.recaptchaKey = props.recaptchaKey;
	}
	async execute(action: string): Promise<RecaptchaToken> {
		return await grecaptcha.enterprise.execute(this.recaptchaKey, { action });
	}
	async wrapWithRecaptcha<T>(obj: T, action: string) {
		const token = await this.execute(action);
		return { ...obj, g_recaptcha_response: token };
	}
}

class MockRecaptchaService implements RecaptchaService {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async execute(action: string): Promise<string> {
		return '03AGdBq27tvcDrfi';
	}
	async wrapWithRecaptcha<T>(obj: T, action: string) {
		const token = await this.execute(action);
		return { ...obj, g_recaptcha_response: token };
	}
}

export function recaptchaServiceFactory(
	mode: Mode,
	props: RecaptchaServiceProps
): RecaptchaService {
	return mode === 'test' ? new MockRecaptchaService() : new RecaptchaServiceImpl(props);
}