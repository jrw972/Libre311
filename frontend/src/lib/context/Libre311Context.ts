import {
	libre311Factory,
	type Libre311Service,
	type Libre311ServiceProps
} from '$lib/services/Libre311/Libre311';
import {
	unityAuthServiceFactory,
	type UnityAuthService,
	type UnityAuthServiceProps,
	type UnityAuthLoginResponse
} from '$lib/services/UnityAuth/UnityAuth';
import { LinkResolver } from '$lib/services/LinkResolver';
import type { Mode } from '$lib/services/mode';
import { getContext, setContext } from 'svelte';
import {
	recaptchaServiceFactory,
	type RecaptchaServiceProps
} from '$lib/services/RecaptchaService';
import { writable, type Readable, type Writable } from 'svelte/store';
import type { Libre311Alert } from './Libre311AlertStore';
import {
	checkHasMessage,
	extractFirstErrorMessage,
	isLibre311ServerErrorResponse
} from '$lib/services/Libre311/types/ServerErrors';
import { isAxiosError } from 'axios';

const libre311CtxKey = Symbol();

export type Libre311Context = {
	service: Libre311Service;
	linkResolver: LinkResolver;
	unityAuthService: UnityAuthService;
	mode: Mode;
	user: Readable<UnityAuthLoginResponse | undefined>;
	alertError: (unknown: unknown) => void;
} & Libre311Alert;

export type Libre311ContextProviderProps = {
	libreServiceProps: Omit<Libre311ServiceProps, 'recaptchaService'>;
	unityAuthServiceProps: UnityAuthServiceProps;
	recaptchaServiceProps: RecaptchaServiceProps;
	mode: Mode;
};

export function createLibre311Context(props: Libre311ContextProviderProps & Libre311Alert) {
	const linkResolver = new LinkResolver();
	const unityAuthService = unityAuthServiceFactory(props.unityAuthServiceProps);
	const recaptchaService = recaptchaServiceFactory(props.mode, props.recaptchaServiceProps);
	const libre311Service = libre311Factory({ ...props.libreServiceProps, recaptchaService });
	const user: Writable<UnityAuthLoginResponse | undefined> = writable(undefined);

	unityAuthService.subscribe('login', (args) => libre311Service.setAuthInfo(args));
	unityAuthService.subscribe('login', (args) => user.set(args));
	unityAuthService.subscribe('logout', () => libre311Service.setAuthInfo(undefined));
	unityAuthService.subscribe('logout', () => user.set(undefined));

	function alertError(unknown: unknown) {
		console.error(unknown);
		if (isAxiosError(unknown)) {
			if (unknown.response?.data && isLibre311ServerErrorResponse(unknown.response.data)) {
				const libre311ServerError = unknown.response.data;
				props.alert({
					type: 'error',
					title: libre311ServerError.message,
					description: `<div>${extractFirstErrorMessage(libre311ServerError)}</div> <small>logref: ${libre311ServerError.logref}</small>`
				});
			}
		} else if (checkHasMessage(unknown)) {
			props.alert({
				type: 'error',
				title: 'Error',
				description: unknown.message
			});
		} else {
			props.alert({
				type: 'error',
				title: 'Something unexpected happened',
				description: 'The complete error has been logged in the console'
			});
		}
	}

	const ctx: Libre311Context = {
		...props,
		service: libre311Service,
		linkResolver,
		unityAuthService,
		user,
		alertError
	};
	setContext(libre311CtxKey, ctx);
	return ctx;
}

export function useLibre311Context(): Libre311Context {
	return getContext<Libre311Context>(libre311CtxKey);
}

export function useLibre311Service(): Libre311Service {
	return getContext<Libre311Context>(libre311CtxKey).service;
}

export function useUnityAuthService(): UnityAuthService {
	return getContext<Libre311Context>(libre311CtxKey).unityAuthService;
}
