<template>
	<VSheet
		:height="height"
		class="vd-logo-brand-section d-flex"
	>
		<component
			:is="logoContainerComponent"
			:aria-current-value="null"
			:aria-label="locales.homeLinkLabel"
			:to="homeLink"
			:href="homeHref"
			class="vd-home-link"
		>
			<Logo
				:hide-signature="hideSignature"
				:hide-organism="isCompteAmeliMobile"
				:risque-pro="isRisquePro"
				:avatar="avatar"
				:size="logoSize"
				:class="{ 'mr-2': avatar }"
			/>
		</component>

		<slot>
			<svg
				v-if="showDivider"
				:width="dividerDimensions.width"
				:height="dividerDimensions.height"
				:fill="dividerColor"
				role="img"
				focusable="false"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				:viewBox="mobileWithSecondaryLogo ? '0 0 5 32' : '0 0 22 64'"
				class="vd-divider"
			>
				<path
					v-if="mobileWithSecondaryLogo"
					d="M1.02 24.63c-.13 0-.22-.1-.22-.2V7.09c0-.11.09-.2.22-.2.12 0 .21.09.21.2v17.34c0 .1-.09.2-.21.2Z"
				/>

				<path
					v-else
					d="M14.3 49.3c-.2 0-.4-.2-.4-.4V14.2c0-.2.2-.4.4-.4.3 0 .5.2.5.4v34.7c0 .2-.2.4-.5.4Z"
				/>
			</svg>

			<component
				:is="secondaryLogoCtnComponent"
				v-if="secondaryLogo"
				:aria-current-value="null"
				:aria-label="secondaryLogoLabel"
				:to="homeLink"
				:href="homeHref"
				class="vd-home-link"
			>
				<img
					:src="secondaryLogo.src"
					:alt="secondaryLogo.alt"
				>
			</component>

			<div
				v-else-if="showBrandContent"
				class="vd-title-container d-flex justify-center flex-column primary--text"
			>
				<slot name="brand-content">
					<h1
						v-if="service.title"
						:class="{ 'vd-compte-entreprise-title': isCompteEntreprise }"
						class="vd-title text-caption text-md-subtitle-1 font-weight-medium"
					>
						<template v-if="isCompteEntreprise">
							{{ service.title.text }}
							<span>{{ service.title.highlight }}</span>
						</template>

						<template v-else>
							{{ service.title }}
						</template>
					</h1>

					<h2
						v-if="showServiceSubTitle"
						class="vd-title text-caption"
					>
						{{ service.subTitle }}
					</h2>
				</slot>
			</div>
		</slot>
	</VSheet>
</template>

<script lang="ts">
	import Vue, { PropType } from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import { tokens } from '@cnamts/design-tokens';

	import { LogoSizeEnum } from '../../elements/Logo/LogoSizeEnum';

	import { ThemeEnum } from '../../constants/enums/ThemeEnum';
	import { Dimensions, Next } from '../../types';

	import { LogoInfo, Service } from './types';
	import { locales } from './locales';
	import { secondaryLogoMapping } from './secondaryLogoMapping';
	import { dividerDimensionsMapping } from './dividerDimensionsMapping';

	/** Define a local interface since Nuxt isn't a dependency */
	interface MaybeNuxtInstance extends Vue {
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		$nuxt: any;
	}

	const Props = Vue.extend({
		props: {
			theme: {
				type: String as PropType<ThemeEnum>,
				default: ThemeEnum.DEFAULT
			},
			serviceTitle: {
				type: String,
				default: undefined
			},
			serviceSubTitle: {
				type: String,
				default: undefined
			},
			mobileVersion: {
				type: Boolean,
				default: false
			},
			reduceLogo: {
				type: Boolean,
				default: false
			},
			homeLink: {
				type: [String, Boolean, Object] as PropType<Next>,
				default: '/'
			},
			homeHref: {
				type: String,
				default: undefined
			}
		}
	});

	const MixinsDeclaration = mixins(Props);

	@Component
	export default class LogoBrandSection extends MixinsDeclaration {
		locales = locales;

		get service(): Service {
			if (this.theme === ThemeEnum.COMPTE_ENTREPRISE) {
				const { title, subTitle } = locales.compteEntreprise;

				return {
					title,
					subTitle
				};
			}

			return {
				title: this.serviceTitle,
				subTitle: this.serviceSubTitle
			};
		}

		get mobileWithSecondaryLogo(): boolean {
			return this.mobileVersion && this.hasSecondaryLogo;
		}

		get height(): string {
			if (this.mobileWithSecondaryLogo) {
				return '32px';
			}

			return this.mobileVersion ? '40px' : '64px';
		}

		get isRisquePro(): boolean {
			if (this.reduceLogo) {
				return false;
			}

			return this.theme === ThemeEnum.RISQUE_PRO;
		}

		get isCompteEntreprise(): boolean {
			return this.theme === ThemeEnum.COMPTE_ENTREPRISE;
		}

		get isCompteAmeliMobile(): boolean {
			return this.theme === ThemeEnum.COMPTE_AMELI && this.mobileVersion;
		}

		get hideSignature(): boolean {
			if (this.reduceLogo || this.isCompteEntreprise || this.isCompteAmeliMobile) {
				return true;
			}

			return Boolean(this.$slots.default);
		}

		get secondaryLogo(): LogoInfo | undefined {
			return secondaryLogoMapping[this.theme];
		}

		get hasSecondaryLogo(): boolean {
			return Boolean(this.$slots.default || this.secondaryLogo);
		}

		get hasSecondaryLogoLink(): boolean {
			return this.theme === ThemeEnum.AMELI_PRO || this.theme === ThemeEnum.AMELI;
		}

		get isNuxt(): boolean {
			return (this as unknown as MaybeNuxtInstance).$nuxt !== undefined;
		}

		get logoContainerComponent(): string {
			if (this.homeHref) {
				return 'a';
			}

			if (!this.homeLink) {
				return 'div';
			}

			return this.isNuxt ? 'NuxtLink' : 'RouterLink';
		}

		get secondaryLogoCtnComponent(): string {
			if (this.hasSecondaryLogoLink) {
				return this.logoContainerComponent;
			}

			return 'div';
		}

		get secondaryLogoLabel(): string | null {
			if (this.hasSecondaryLogoLink && this.secondaryLogo) {
				return `${locales.homeLinkPrefix} ${this.secondaryLogo.alt}`;
			}

			return null;
		}

		get avatar(): boolean {
			if (this.reduceLogo) {
				return this.hasSecondaryLogo;
			}

			return false;
		}

		get showBrandContent(): boolean {
			return Boolean(this.service.title || this.service.subTitle || this.$slots['brand-content'] || this.hasSecondaryLogo);
		}

		get showDivider(): boolean {
			if (this.reduceLogo) {
				return false;
			}

			return this.showBrandContent;
		}

		get showServiceSubTitle(): boolean {
			return Boolean(this.service.title && this.service.subTitle && !this.mobileVersion);
		}

		get dividerColor(): string {
			switch (this.theme) {
				case ThemeEnum.CNAM:
				case ThemeEnum.AMELI_PRO: {
					return tokens.colors.secondary;
				}

				case ThemeEnum.COMPTE_ENTREPRISE: {
					return tokens.colors.brick.base;
				}

				default: {
					return tokens.colors.primary;
				}
			}
		}

		get dividerDimensions(): Dimensions {
			const { xSmall, small, normal } = dividerDimensionsMapping;

			if (this.mobileWithSecondaryLogo) {
				return xSmall;
			}

			if (this.mobileVersion) {
				return small;
			}

			return normal;
		}

		get logoSize(): LogoSizeEnum {
			if (this.mobileWithSecondaryLogo) {
				return LogoSizeEnum.X_SMALL;
			}

			if (this.mobileVersion) {
				return LogoSizeEnum.SMALL;
			}

			return LogoSizeEnum.NORMAL;
		}
	}
</script>

<style lang="scss" scoped>
	.vd-logo-brand-section {
		.vd-title-container {
			overflow: hidden;
		}

		.vd-title {
			line-height: 1.45 !important;
		}

		.vd-compte-entreprise-title {
			font-weight: 700 !important;

			span {
				color: #cd545b;
			}
		}

		:deep(img) {
			width: auto;
			height: 100%;
			flex: none;
		}

		svg,
		.vd-home-link {
			flex: none;
		}
	}
</style>
