/*
 * Copyright 2025 CleverAdsSolutions LTD, CAS.AI
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { SDKInstanceClass } from "./instance.ts";

const C3 = globalThis.C3;

C3.Plugins.CASAI_MobileAds.Acts = {
    // MARK: General

    async ShowConsentForm(this: SDKInstanceClass, ifRequired: boolean) {
        return this._showConsentForm(ifRequired);
    },

    SetAdSoundsMuted(this: SDKInstanceClass, muted: boolean) {
        this._setAdSoundsMuted(muted);
    },

    // MARK: Banner

    async LoadBannerAd(this: SDKInstanceClass, adSize: number, maxWidth: number, maxHeight: number) {
        return this._loadBannerAd(adSize, maxWidth, maxHeight);
    },
    ShowBannerAd(this: SDKInstanceClass, position: number, xOffset: number, yOffset: number) {
        this._showBannerAd(position, xOffset, yOffset);
    },
    HideBannerAd(this: SDKInstanceClass) {
        this._hideBannerAd();
    },
    DestroyBannerAd(this: SDKInstanceClass) {
        this._destroyBannerAd();
    },

    // MARK: MREC

    async LoadMRecAd(this: SDKInstanceClass) {
        return this._loadMRecAd();
    },
    ShowMRecAd(this: SDKInstanceClass, position: number, xOffset: number, yOffset: number) {
        this._showMRecAd(position, xOffset, yOffset);
    },
    HideMRecAd(this: SDKInstanceClass) {
        this._hideMRecAd();
    },
    DestroyMRecAd(this: SDKInstanceClass) {
        this._destroyMRecAd();
    },

    // MARK: AppOpen

    async LoadAppOpenAd(this: SDKInstanceClass) {
        return this._loadAppOpenAd();
    },
    async ShowAppOpenAd(this: SDKInstanceClass) {
        return this._showAppOpenAd();
    },
    DestroyAppOpenAd(this: SDKInstanceClass) {
        this._destroyAppOpenAd();
    },

    // MARK: Interstitial

    async LoadInterstitialAd(this: SDKInstanceClass) {
        return this._loadInterstitialAd();
    },
    async ShowInterstitialAd(this: SDKInstanceClass) {
        return this._showInterstitialAd();
    },
    DestroyInterstitialAd(this: SDKInstanceClass) {
        this._destroyInterstitialAd();
    },

    // MARK: Rewarded

    async LoadRewardedAd(this: SDKInstanceClass) {
        return this._loadRewardedAd();
    },
    async ShowRewardedAd(this: SDKInstanceClass) {
        return this._showRewardedAd();
    },
    DestroyRewardedAd(this: SDKInstanceClass) {
        this._destroyRewardedAd();
    },
};
