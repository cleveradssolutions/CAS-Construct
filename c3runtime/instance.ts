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

interface FormatState {
    Banner: boolean;
    MREC: boolean;
    AppOpen: boolean;
    Interstitial: boolean;
    Rewarded: boolean;
}

// Groups not included to paramters array
const enum InitParameter {
    casIdIOSProp,
    solutionsIOSProp,
    adaptersIOSProp,
    userTrackingUsageIOSProm,
    solutionsAndroidProp,
    adaptersAndroidProp,
    useAdIdAndroidProp,
    target_audience, // combo
    app_keywords, // longtext
    app_content_url, // longtext
    mediation_extras, // longtext
    auto_show_consent_form, // check
    auto_reload_banner, // check
    auto_refresh_banner, // integer
    auto_reload_mrec, // check
    auto_refresh_mrec, // integer
    auto_reload_appopen, // check
    auto_show_appopen, // check
    auto_reload_inter, // check
    auto_show_inter, // check
    min_interval_inter, // integer
    auto_reload_reward, // check
    collect_location, // check
    trial_ad_free_interval, // integer
    force_test_ads, // check
    test_device_ids, // longtext
    debug_logging, // check
    debug_geography, // combo
    count, // service value
};

const DebugGeogrpahyValues: PrivacyGeography[] = ["unknown", "eea", "us", "unregulated"];
const AudienceValues: AdAudience[] = [undefined, "children", "notchildren"];
const AdSizeValue: BannerAdSize[] = ["A", "I", "S", "L", "B"];

class CASMobileAdsInstance extends globalThis.ISDKInstanceBase {
    _isAutoLoad: FormatState;
    _isAutoShow: FormatState;
    _isLoaded: FormatState;

    _autoRefreshBanner: number;
    _autoRefreshMREC: number;
    _minIntervalInterstitial: number;
    _showConsentFormIfRequired: boolean;
    _debugGeography: PrivacyGeography;
    _isInitialized: boolean;
    _initializationStatus?: InitializationStatus;
    _errorMessage?: string;

    _cordova?: CASMobileAds;

    constructor() {
        super();
        
        // Initialise object properties

        this._autoRefreshBanner = 30;
        this._autoRefreshMREC = 30;
        this._minIntervalInterstitial = 0;
        this._showConsentFormIfRequired = true;
        this._debugGeography = "eea";
        this._isInitialized = false;

        this._isAutoLoad = {
            Banner: false,
            MREC: false,
            AppOpen: false,
            Interstitial: false,
            Rewarded: false,
        };

        this._isAutoShow = {
            Banner: false,
            MREC: false,
            AppOpen: false,
            Interstitial: false,
            Rewarded: false,
        };

        this._isLoaded = {
            Banner: false,
            MREC: false,
            AppOpen: false,
            Interstitial: false,
            Rewarded: false,
        };

        this._cordova = globalThis.window.casai;

        // note properties may be null in some cases
        const props = this._getInitProperties();
        if (props) {
            this._isAutoLoad.Banner = props[InitParameter.auto_reload_banner] as boolean;
            this._autoRefreshBanner = props[InitParameter.auto_refresh_banner] as number;
            this._isAutoLoad.MREC = props[InitParameter.auto_reload_mrec] as boolean;
            this._autoRefreshMREC = props[InitParameter.auto_refresh_mrec] as number;
            this._isAutoLoad.AppOpen = props[InitParameter.auto_reload_appopen] as boolean;
            this._isAutoShow.AppOpen = props[InitParameter.auto_show_appopen] as boolean;
            this._isAutoLoad.Interstitial = props[InitParameter.auto_reload_inter] as boolean;
            this._isAutoShow.Interstitial = props[InitParameter.auto_show_inter] as boolean;
            this._minIntervalInterstitial = props[InitParameter.min_interval_inter] as number;
            this._isAutoLoad.Rewarded = props[InitParameter.auto_reload_reward] as boolean;

            this._showConsentFormIfRequired = props[InitParameter.auto_show_consent_form] as boolean;
            let geographyId = props[InitParameter.debug_geography] as number;
            this._debugGeography = DebugGeogrpahyValues[geographyId];
        }

        globalThis.document.addEventListener("casai_ad_loaded", this._onCASLoaded, false);
        globalThis.document.addEventListener("casai_ad_load_failed", this._onCASFailedToLoad, false);
        globalThis.document.addEventListener("casai_ad_show_failed", this._onCASFailedToShow, false);
        globalThis.document.addEventListener("casai_ad_showed", this._onCASShowed, false);
        globalThis.document.addEventListener("casai_ad_clicked", this._onCASClicked, false);
        globalThis.document.addEventListener("casai_ad_dismissed", this._onCASDismissed, false);

        if (this._isAutoLoad.MREC) {
            this._loadMRecAd();
        }
        if (this._isAutoLoad.AppOpen) {
            this._loadAppOpenAd();
        }
        if (this._isAutoLoad.Interstitial) {
            this._loadInterstitialAd();
        }
        if (this._isAutoLoad.Rewarded) {
            this._loadRewardedAd();
        }
    }

    // MARK: Initialization

    _initialize() {
        if (!this._cordova) {
            return;
        }
        if (this._isInitialized) {
            if (this._initializationStatus && this._initializationStatus.error) {
                this._cordova.initialize({}).then(this._onCASInitialized);
            }
            return;
        }
        this._isInitialized = true;

        var targetAudience = undefined;
        var forceTestAds = undefined;
        var testDeviceIds = undefined;
        var mediationExtras = undefined;
        const props = this._getInitProperties();
        if (props) {
            if (props.length != InitParameter.count) {
                throw Error("The init parameters are not synchronized with the runtime code.");
            }

            let targetAudienceId = props[InitParameter.target_audience] as number;
            targetAudience = AudienceValues[targetAudienceId];
            forceTestAds = props[InitParameter.force_test_ads] as boolean;
            let testDeviceIdsStr = props[InitParameter.test_device_ids] as string;
            if (testDeviceIdsStr) {
                testDeviceIds = testDeviceIdsStr.split(/[ ,;]+/);
            }
            let mediationExtrasStr = props[InitParameter.mediation_extras] as string;
            if (mediationExtrasStr) {
                try {
                    mediationExtras = JSON.parse(mediationExtrasStr);
                } catch (e) {
                    console.warn("CAS Mobile Ads: failed to parse mediation extras JSON");
                }
            }

            let collectLocation = props[InitParameter.collect_location] as boolean;
            this._cordova.setLocationCollectionEnabled(collectLocation);
            let debugLogging = props[InitParameter.debug_logging] as boolean;
            this._cordova.setDebugLoggingEnabled(debugLogging);
            let trialAdFreeInterval = props[InitParameter.trial_ad_free_interval] as number;
            this._cordova.setTrialAdFreeInterval(trialAdFreeInterval);
            let appKeywords = props[InitParameter.app_keywords] as string;
            if (appKeywords) {
                let keywords = appKeywords.split(/[ ,;]+/);
                this._cordova.setAppKeywords(keywords);
            }
            let appContentUrl = props[InitParameter.app_content_url] as string;
            this._cordova.setAppContentUrl(appContentUrl);
        }

        this._cordova
            .initialize({
                targetAudience: targetAudience,
                showConsentFormIfRequired: this._showConsentFormIfRequired,
                forceTestAds: forceTestAds,
                testDeviceIds: testDeviceIds,
                debugGeography: this._debugGeography,
                mediationExtras: mediationExtras,
            })
            .then(this._onCASInitialized);
    }

    async _showConsentForm(ifRequired: boolean) {
        let status = await this._cordova?.showConsentFlow({
            ifRequired: ifRequired,
            debugGeography: this._debugGeography,
        });
        if (status == "Obtained") {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentRequired);
        } else {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentNotRequired);
        }
        this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentFormDismissed);
        return status;
    }

    _setAdSoundsMuted(muted: boolean) {
        this._cordova?.setAdSoundsMuted(muted);
    }

    // MARK: Event handlers

    _onCASInitialized(status: InitializationStatus) {
        this._initializationStatus = status;

        if (status.isConsentRequired || status.consentFlowStatus === "Obtained") {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentRequired);
        } else {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentNotRequired);
        }
        if (this._showConsentFormIfRequired) {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentFormDismissed);
        }
    }

    _onCASLoaded(event: AdInfoEvent) {
        this._isLoaded[event.format] = true;

        switch (event.format) {
            case "Banner":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnBannerAdLoaded);
                break;
            case "MREC":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnMRecAdLoaded);
                break;
            case "AppOpen":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnAppOpenAdLoaded);
                break;
            case "Interstitial":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnInterstitialAdLoaded);
                break;
            case "Rewarded":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdLoaded);
                break;
        }
    }

    _onCASFailedToLoad(event: AdErrorEvent) {
        this._isLoaded[event.format] = false;
        this._errorMessage = event.message;

        switch (event.format) {
            case "Banner":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnBannerAdFailedToLoad);
                break;
            case "MREC":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnMRecAdFailedToLoad);
                break;
            case "AppOpen":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnAppOpenAdFailedToLoad);
                break;
            case "Interstitial":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnInterstitialAdFailedToLoad);
                break;
            case "Rewarded":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdFailedToLoad);
                break;
        }
    }

    _onCASFailedToShow(event: AdErrorEvent) {
        this._errorMessage = event.message;
        switch (event.format) {
            case "AppOpen":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnAppOpenAdFailedToShow);
                break;
            case "Interstitial":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnInterstitialAdFailedToShow);
                break;
            case "Rewarded":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdFailedToShow);
                break;
        }
    }

    _onCASShowed(event: AdInfoEvent) {
        switch (event.format) {
            case "AppOpen":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnAppOpenAdShowed);
                break;
            case "Interstitial":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnInterstitialAdShowed);
                break;
            case "Rewarded":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdShowed);
                break;
        }
    }

    _onCASClicked(event: AdInfoEvent) {
        switch (event.format) {
            case "Banner":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnBannerAdClicked);
                break;
            case "MREC":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnMRecAdClicked);
                break;
            case "AppOpen":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnAppOpenAdClicked);
                break;
            case "Interstitial":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnInterstitialAdClicked);
                break;
            case "Rewarded":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdClicked);
                break;
        }
    }

    _onCASDismissed(event: AdInfoEvent) {
        switch (event.format) {
            case "AppOpen":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnAppOpenAdDismissed);
                break;
            case "Interstitial":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnInterstitialAdDismissed);
                break;
            case "Rewarded":
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdDismissed);
                break;
        }
    }

    // MARK: Banner ads

    async _loadBannerAd(adSize: number, maxWidth: number, maxHeight: number) {
        this._initialize();
        try {
            await this._cordova?.bannerAd.load({
                adSize: AdSizeValue[adSize],
                maxWidth: maxWidth,
                maxHeight: maxHeight,
                autoReload: this._isAutoLoad.Banner,
                refreshInterval: this._autoRefreshBanner,
            });
        } catch (error: any) {
            // do nothing, event will be triggered
        }
    }

    _showBannerAd(position: number, offsetX: number, offsetY: number) {
        this._cordova?.bannerAd.show({
            position: position as AdPosition,
            offsetX: offsetX,
            offsetY: offsetY,
        });
    }

    _hideBannerAd() {
        this._cordova?.bannerAd.hide();
    }

    _destroyBannerAd() {
        this._cordova?.bannerAd.destroy();
    }

    // MARK: MREC ads

    async _loadMRecAd() {
        this._initialize();
        try {
            await this._cordova?.mrecAd.load({
                autoReload: this._isAutoLoad.Banner,
                refreshInterval: this._autoRefreshBanner,
            });
        } catch (error: any) {
            // do nothing, event will be triggered
        }
    }

    _showMRecAd(position: number, offsetX: number, offsetY: number) {
        this._cordova?.mrecAd.show({
            position: position as AdPosition,
            offsetX: offsetX,
            offsetY: offsetY,
        });
    }

    _hideMRecAd() {
        this._cordova?.mrecAd.hide();
    }

    _destroyMRecAd() {
        this._cordova?.mrecAd.destroy();
    }

    // MARK: AppOpen ads

    async _loadAppOpenAd() {
        this._initialize();
        try {
            await this._cordova?.appOpenAd.load({
                autoReload: this._isAutoLoad.AppOpen,
                autoShow: this._isAutoShow.AppOpen,
            });
        } catch (error: any) {
            // do nothing, event will be triggered
        }
    }

    async _showAppOpenAd() {
        try {
            await this._cordova?.appOpenAd.show();
        } catch (error: any) {
            // do nothing, event will be triggered
        }
    }

    _destroyAppOpenAd() {
        this._cordova?.appOpenAd.destroy();
    }

    // MARK: Interstitial ads

    async _loadInterstitialAd() {
        this._initialize();
        try {
            await this._cordova?.interstitialAd.load({
                autoReload: this._isAutoLoad.Interstitial,
                autoShow: this._isAutoShow.Interstitial,
                minInterval: this._minIntervalInterstitial,
            });
        } catch (error: any) {
            // do nothing, event will be triggered
        }
    }

    async _showInterstitialAd() {
        try {
            await this._cordova?.interstitialAd.show();
        } catch (error: any) {
            // do nothing, event will be triggered
        }
    }

    _destroyInterstitialAd() {
        this._cordova?.interstitialAd.destroy();
    }

    // MARK: Rewarded ads

    async _loadRewardedAd() {
        this._initialize();
        try {
            await this._cordova?.rewardedAd.load({
                autoReload: this._isAutoLoad.Rewarded,
            });
        } catch (error: any) {
            // do nothing, event will be triggered
        }
    }

    async _showRewardedAd() {
        var isUserEarnReward = false;
        try {
            let info = await this._cordova?.rewardedAd.show();
            isUserEarnReward = info?.isUserEarnReward ?? false;
        } catch (error: any) {
            // do nothing, event will be triggered
        }
        if (isUserEarnReward) {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdUserEarnedReward);
        } else {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdCanceledByUser);
        }
    }

    _destroyRewardedAd() {
        this._cordova?.rewardedAd.destroy();
    }

    // MARK: Instance lifecycle

    _release() {
        super._release();

        globalThis.document.removeEventListener("casai_ad_loaded", this._onCASLoaded, false);
        globalThis.document.removeEventListener("casai_ad_load_failed", this._onCASFailedToLoad, false);
        globalThis.document.removeEventListener("casai_ad_show_failed", this._onCASFailedToShow, false);
        globalThis.document.removeEventListener("casai_ad_showed", this._onCASShowed, false);
        globalThis.document.removeEventListener("casai_ad_clicked", this._onCASClicked, false);
        globalThis.document.removeEventListener("casai_ad_dismissed", this._onCASDismissed, false);
    }
}

C3.Plugins.CASAI_MobileAds.Instance = CASMobileAdsInstance;

export type { CASMobileAdsInstance as SDKInstanceClass };
