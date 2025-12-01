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

C3.Plugins.CASAI_MobileAds.Cnds = {
    // MARK: General
    OnConsentFormDismissed: () => true,
    OnConsentRequired: () => true,
    OnConsentNotRequired: () => true,
    /**
     * Indicates the privacy options button is required.
     */
    IsConsentRequired(this: SDKInstanceClass) {
        return this._initializationStatus?.isConsentRequired ?? true;
    },

    // MARK: Banner
    OnBannerAdLoaded: () => true,
    OnBannerAdFailedToLoad: () => true,
    OnBannerAdClicked: () => true,
    IsBannerAdLoaded(this: SDKInstanceClass) {
        return this._isLoaded.Banner;
    },

    // MARK: MREC
    OnMRECAdLoaded: () => true,
    OnMRECAdFailedToLoad: () => true,
    OnMRECAdClicked: () => true,
    IsMRECAdLoaded(this: SDKInstanceClass) {
        return this._isLoaded.MREC;
    },

    // MARK: AppOpen
    OnAppOpenAdLoaded: () => true,
    OnAppOpenAdFailedToLoad: () => true,
    OnAppOpenAdFailedToShow: () => true,
    OnAppOpenAdShowed: () => true,
    OnAppOpenAdClicked: () => true,
    OnAppOpenAdDismissed: () => true,
    IsAppOpenAdLoaded(this: SDKInstanceClass) {
        return this._isLoaded.AppOpen;
    },

    // MARK: Interstitial
    OnInterstitialAdLoaded: () => true,
    OnInterstitialAdFailedToLoad: () => true,
    OnInterstitialAdFailedToShow: () => true,
    OnInterstitialAdShowed: () => true,
    OnInterstitialAdClicked: () => true,
    OnInterstitialAdDismissed: () => true,
    IsInterstitialAdLoaded(this: SDKInstanceClass) {
        return this._isLoaded.Interstitial;
    },

    // MARK: Rewarded

    OnRewardedAdLoaded: () => true,
    OnRewardedAdFailedToLoad: () => true,
    OnRewardedAdFailedToShow: () => true,
    OnRewardedAdShowed: () => true,
    OnRewardedAdClicked: () => true,
    OnRewardedAdUserEarnedReward: () => true,
    OnRewardedAdCanceledByUser: () => true,
    OnRewardedAdDismissed: () => true,
    IsRewardedAdLoaded(this: SDKInstanceClass) {
        return this._isLoaded.Rewarded;
    },
};
