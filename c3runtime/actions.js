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
const C3 = globalThis.C3;
C3.Plugins.CASAI_MobileAds.Acts = {
    // MARK: General
    async ShowConsentForm(ifRequired) {
        return this._showConsentForm(ifRequired);
    },
    SetAdSoundsMuted(muted) {
        this._setAdSoundsMuted(muted);
    },
    // MARK: Banner
    async LoadBannerAd(adSize, maxWidth, maxHeight) {
        return this._loadBannerAd(adSize, maxWidth, maxHeight);
    },
    ShowBannerAd(position, xOffset, yOffset) {
        this._showBannerAd(position, xOffset, yOffset);
    },
    HideBannerAd() {
        this._hideBannerAd();
    },
    DestroyBannerAd() {
        this._destroyBannerAd();
    },
    // MARK: MREC
    async LoadMRecAd() {
        return this._loadMRecAd();
    },
    ShowMRecAd(position, xOffset, yOffset) {
        this._showMRecAd(position, xOffset, yOffset);
    },
    HideMRecAd() {
        this._hideMRecAd();
    },
    DestroyMRecAd() {
        this._destroyMRecAd();
    },
    // MARK: AppOpen
    async LoadAppOpenAd() {
        return this._loadAppOpenAd();
    },
    async ShowAppOpenAd() {
        return this._showAppOpenAd();
    },
    DestroyAppOpenAd() {
        this._destroyAppOpenAd();
    },
    // MARK: Interstitial
    async LoadInterstitialAd() {
        return this._loadInterstitialAd();
    },
    async ShowInterstitialAd() {
        return this._showInterstitialAd();
    },
    DestroyInterstitialAd() {
        this._destroyInterstitialAd();
    },
    // MARK: Rewarded
    async LoadRewardedAd() {
        return this._loadRewardedAd();
    },
    async ShowRewardedAd() {
        return this._showRewardedAd();
    },
    DestroyRewardedAd() {
        this._destroyRewardedAd();
    },
};
export {};
