<template>
	<div
		:style="mainContentMargin"
		class="vd-header-bar-container w-100"
	>
		<VAppBar
			v-bind="{
				...options.appBar,
				...$attrs
			}"
			ref="appBar"
			v-scroll:[targetSelector]="onScroll"
			:height="height"
			:fixed="sticky"
			role="banner"
			class="vd-header-bar"
		>
			<VSheet
				v-bind="options.contentSheet"
				:height="contentSheetHeight"
				:class="spacingClass"
				class="vd-header-bar-content d-flex justify-center"
			>
				<VSheet
					v-bind="options.innerSheet"
					:width="innerWidth"
				>
					<slot name="logo">
						<LogoBrandSection
							v-bind="options.brandSection"
							:theme="theme"
							:service-title="serviceTitle"
							:service-sub-title="serviceSubTitle"
							:mobile-version="isMobileVersion"
							:reduce-logo="isMiniVersion"
							:home-link="homeLink"
							:home-href="homeHref"
						>
							<template #brand-content>
								<slot name="brand-content" />
							</template>

							<slot name="secondary-logo" />
						</LogoBrandSection>
					</slot>

					<VSpacer
						v-if="showSpacer"
						v-bind="options.spacer"
					/>

					<slot />

					<HeaderMenuBtn
						v-if="showHeaderMenuBtn"
						:vuetify-options="options.menuBtn"
						@click="updateDrawer(!drawer)"
					/>
				</VSheet>
			</VSheet>

			<VFadeTransition>
				<template v-if="showNavigationBar">
					<HeaderNavigationBar
						:tab.sync="tab"
						:drawer.sync="drawer"
						:theme="theme"
						:mobile-version="isMobileVersion"
						:items="navigationItems"
						:inner-width="innerWidth"
						:show-menu-btn="showNavBarMenuBtn"
						:vuetify-options="options.navigationBar"
					>
						<template #navigation-bar-prepend>
							<slot name="navigation-bar-prepend" />
						</template>

						<slot name="navigation-bar-content" />

						<template #navigation-bar-secondary-content>
							<slot name="navigation-bar-secondary-content" />
						</template>
					</HeaderNavigationBar>
				</template>
			</VFadeTransition>
		</VAppBar>

		<slot
			name="navigation-drawer"
			v-bind="{ drawer, updateDrawer }"
		>
			<HeaderNavigationDrawer
				v-model="drawer"
				:tab.sync="tab"
				:theme="theme"
				:items="navigationItems"
				:mobile-version="isMobileVersion"
				:vuetify-options="options.navigationDrawer"
			>
				<template #navigation-drawer-prepend>
					<slot name="navigation-drawer-prepend" />
				</template>

				<slot name="navigation-drawer-content" />

				<template #navigation-drawer-append>
					<slot name="navigation-drawer-append" />
				</template>
			</HeaderNavigationDrawer>
		</slot>
	</div>
</template>

<script lang="ts">
	import Vue, { PropType } from 'vue';
	import Component, { mixins } from 'vue-class-component';

	import LogoBrandSection from '../../elements/LogoBrandSection';
	import HeaderMenuBtn from './HeaderMenuBtn';
	import HeaderNavigationBar from './HeaderNavigationBar';
	import HeaderNavigationDrawer from './HeaderNavigationDrawer';

	import { NavigationItem } from './types';

	import { ThemeEnum, THEME_ENUM_VALUES } from './ThemeEnum';
	import { config } from './config';

	import { propValidator } from '../../helpers/propValidator';

	import { customizable } from '../../mixins/customizable';
	import { Next, Refs } from '../../types';
	import { Scroll } from 'vuetify/lib/directives';

	const Props = Vue.extend({
		props: {
			theme: {
				type: String as PropType<ThemeEnum>,
				default: ThemeEnum.DEFAULT,
				validator: (value: string) => propValidator('theme', THEME_ENUM_VALUES, value)
			},
			serviceTitle: {
				type: String,
				default: undefined
			},
			serviceSubTitle: {
				type: String,
				default: undefined
			},
			navigationItems: {
				type: Array as PropType<NavigationItem[]>,
				default: undefined
			},
			innerWidth: {
				type: String,
				default: '100%'
			},
			homeLink: {
				type: [String, Boolean, Object] as PropType<Next>,
				default: undefined
			},
			homeHref: {
				type: String,
				default: undefined
			},
			showNavBarMenuBtn: {
				type: Boolean,
				default: false
			},
			mobileVersion: {
				type: Boolean,
				default: false
			},
			miniVersion: {
				type: Boolean,
				default: false
			},
			sticky: {
				type: Boolean,
				default: false
			},
			showStickyNavBar: {
				type: Boolean,
				default: false
			},
			target: {
				type: String,
				default: undefined
			}
		}
	});

	const MixinsDeclaration = mixins(Props, customizable(config));

	@Component({
		inheritAttrs: false,
		directives: {
			Scroll
		},
		components: {
			LogoBrandSection,
			HeaderMenuBtn,
			HeaderNavigationBar,
			HeaderNavigationDrawer
		}
	})
	export default class HeaderBar extends MixinsDeclaration {
		$refs!: Refs<{
			appBar: Vue;
		}>;

		drawer: boolean | null = null;
		tab: number | null = null;
		scrolled = false;

		get isMobileVersion(): boolean {
			if (this.mobileVersion || this.miniVersion) {
				return true;
			}

			return this.$vuetify.breakpoint.xsOnly;
		}

		get isMiniVersion(): boolean {
			return this.miniVersion || (this.sticky && this.scrolled);
		}

		get targetSelector(): string | null {
			if (!this.target) {
				return null;
			}

			return `#${this.target}`;
		}

		get spacingClass(): string {
			if (this.sticky && this.scrolled) {
				return this.isMobileVersion ? 'px-4 py-1' : 'px-14 py-1';
			}

			return this.isMobileVersion ? 'pa-4' : 'px-14 py-7';
		}

		get contentSheetHeight(): number {
			if (this.isMiniVersion) {
				return this.isMobileVersion ? 52 : 72;
			}

			return this.isMobileVersion ? 72 : 120;
		}

		get fullHeight(): number {
			const height = this.isMobileVersion ? 72 : 120;

			return this.showNavigationBar ? height + 48 : height;
		}

		get height(): number {
			if (this.showNavigationBar) {
				return this.contentSheetHeight + 48;
			}

			return this.contentSheetHeight;
		}

		get mainContentMargin(): string {
			return this.sticky ? `margin-top: ${this.fullHeight}px` : '';
		}

		get hasNavigationItems(): boolean {
			return Boolean(this.navigationItems || this.$slots['navigation-drawer-content']);
		}

		get showHeaderMenuBtn(): boolean {
			const hasNavigation = Boolean(this.navigationItems || this.$scopedSlots['navigation-drawer']);

			return !this.showNavBarMenuBtn && this.isMobileVersion && hasNavigation;
		}

		get showNavigationBar(): boolean {
			const isStickyNavBar = !this.scrolled || (this.scrolled && this.showStickyNavBar);

			if (!isStickyNavBar) {
				return false;
			}

			if (this.$slots['navigation-bar-content']) {
				return true;
			}

			if (this.showHeaderMenuBtn) {
				return false;
			}

			return this.hasNavigationItems;
		}

		get showSpacer(): boolean {
			return Boolean(this.$slots.default) || this.isMobileVersion;
		}

		updateDrawer(value: boolean): void {
			this.drawer = value;
		}

		onScroll(event: MouseEvent): void {
			if (!this.sticky) {
				return;
			}

			const target = event.currentTarget as HTMLElement | Window;
			const scrollPosition = target === window ? window.scrollY : (target as HTMLElement).scrollTop;

			this.scrolled = this.sticky && scrollPosition > this.height;
		}
	}
</script>

<style lang="scss" scoped>
	.vd-header-bar {
		z-index: 1;
	}

	.vd-header-bar,
	.vd-header-bar-content {
		transition: 0.1s cubic-bezier(0.4, 0, 0.6, 1) !important;
	}

	.vd-header-bar :deep(.v-toolbar__content) {
		display: block;
		padding: 0;
	}

	.vd-header-menu-btn :deep() {
		.v-btn__content {
			flex-direction: column;
		}

		.v-icon {
			margin: 0 !important;
		}
	}
</style>
