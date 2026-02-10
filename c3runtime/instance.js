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
const DebugGeogrpahyValues = ["unknown", "eea", "us", "unregulated"];
const AudienceValues = [undefined, "children", "notchildren"];
const AdSizeValue = ["A", "I", "S", "L", "B"];
class CASMobileAdsInstance extends globalThis.ISDKInstanceBase {
    constructor() {
        super();
        // MARK: Event handlers
        // Event function must use lambdas to correct bind this context.
        this._onCASInitialized = (status) => {
            this._initializationStatus = status;
            if (status.isConsentRequired || status.consentFlowStatus === "Obtained") {
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentRequired);
            }
            else {
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentNotRequired);
            }
            if (this._showConsentFormIfRequired) {
                this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentFormDismissed);
            }
        };
        this._onCASLoaded = (event) => {
            this._isLoaded[event.format] = true;
            let triggerName = "On" + event.format + "AdLoaded";
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
        };
        this._onCASFailedToLoad = (event) => {
            this._isLoaded[event.format] = false;
            this._errorMessage = event.message;
            let triggerName = "On" + event.format + "AdFailedToLoad";
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
        };
        this._onCASFailedToShow = (event) => {
            this._errorMessage = event.message;
            let triggerName = "On" + event.format + "AdFailedToShow";
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
        };
        this._onCASShowed = (event) => {
            let triggerName = "On" + event.format + "AdShowed";
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
        };
        this._onCASClicked = (event) => {
            let triggerName = "On" + event.format + "AdClicked";
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
        };
        this._onCASDismissed = (event) => {
            let triggerName = "On" + event.format + "AdDismissed";
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
            if (!this._cordova && this._isAutoLoad[event.format]) {
                setTimeout(() => this._onCASLoaded(event), 1000);
            }
        };
        this._onCASEarnReward = (event) => {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdUserEarnedReward);
        };
        // Initialise object properties
        this._showConsentFormIfRequired = true;
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
            if (props.length != 28 /* InitParameter.count */) {
                throw Error("The init parameters are not synchronized with the runtime code.");
            }
            this._isAutoLoad.Banner = props[12 /* InitParameter.auto_reload_banner */];
            this._autoRefreshBanner = props[13 /* InitParameter.auto_refresh_banner */];
            this._isAutoLoad.MREC = props[14 /* InitParameter.auto_reload_mrec */];
            this._autoRefreshMREC = props[15 /* InitParameter.auto_refresh_mrec */];
            this._isAutoLoad.AppOpen = props[16 /* InitParameter.auto_reload_appopen */];
            this._isAutoShow.AppOpen = props[17 /* InitParameter.auto_show_appopen */];
            this._isAutoLoad.Interstitial = props[18 /* InitParameter.auto_reload_inter */];
            this._isAutoShow.Interstitial = props[19 /* InitParameter.auto_show_inter */];
            this._minIntervalInterstitial = props[20 /* InitParameter.min_interval_inter */];
            this._isAutoLoad.Rewarded = props[21 /* InitParameter.auto_reload_reward */];
            this._showConsentFormIfRequired = props[11 /* InitParameter.auto_show_consent_form */];
            let geographyId = props[27 /* InitParameter.debug_geography */];
            this._debugGeography = DebugGeogrpahyValues[geographyId];
        }
        globalThis.document.addEventListener("casai_ad_loaded", this._onCASLoaded, false);
        globalThis.document.addEventListener("casai_ad_load_failed", this._onCASFailedToLoad, false);
        globalThis.document.addEventListener("casai_ad_show_failed", this._onCASFailedToShow, false);
        globalThis.document.addEventListener("casai_ad_showed", this._onCASShowed, false);
        globalThis.document.addEventListener("casai_ad_clicked", this._onCASClicked, false);
        globalThis.document.addEventListener("casai_ad_dismissed", this._onCASDismissed, false);
        globalThis.document.addEventListener("casai_ad_reward", this._onCASEarnReward, false);
        // Required delay here to correct work triggers.
        setTimeout(() => this._runAutomation(), 500);
    }
    // MARK: Initialization
    _initialize() {
        if (this._isInitialized) {
            if (this._initializationStatus && this._initializationStatus.error) {
                this._cordova?.initialize({}).then(this._onCASInitialized);
            }
            return;
        }
        this._isInitialized = true;
        if (!this._cordova) {
            this._onCASInitialized({
                isConsentRequired: true,
                consentFlowStatus: "Obtained",
            });
            return;
        }
        var targetAudience = undefined;
        var forceTestAds = undefined;
        var testDeviceIds = undefined;
        var mediationExtras = undefined;
        const props = this._getInitProperties();
        if (props) {
            let targetAudienceId = props[7 /* InitParameter.target_audience */];
            targetAudience = AudienceValues[targetAudienceId];
            forceTestAds = props[24 /* InitParameter.force_test_ads */];
            let testDeviceIdsStr = props[25 /* InitParameter.test_device_ids */];
            if (testDeviceIdsStr) {
                testDeviceIds = testDeviceIdsStr.split(/[ ,;]+/);
            }
            let mediationExtrasStr = props[10 /* InitParameter.mediation_extras */];
            if (mediationExtrasStr) {
                try {
                    mediationExtras = JSON.parse(mediationExtrasStr);
                }
                catch (e) {
                    console.warn("CAS Mobile Ads: failed to parse mediation extras JSON");
                }
            }
            let collectLocation = props[22 /* InitParameter.collect_location */];
            this._cordova.setLocationCollectionEnabled(collectLocation);
            let debugLogging = props[26 /* InitParameter.debug_logging */];
            this._cordova.setDebugLoggingEnabled(debugLogging);
            let trialAdFreeInterval = props[23 /* InitParameter.trial_ad_free_interval */];
            this._cordova.setTrialAdFreeInterval(trialAdFreeInterval);
            let appKeywords = props[8 /* InitParameter.app_keywords */];
            if (appKeywords) {
                let keywords = appKeywords.split(/[ ,;]+/);
                this._cordova.setAppKeywords(keywords);
            }
            let appContentUrl = props[9 /* InitParameter.app_content_url */];
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
    _runAutomation() {
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
    async _showConsentForm(ifRequired) {
        let status = await this._cordova?.showConsentFlow({
            ifRequired: ifRequired,
            debugGeography: this._debugGeography,
        });
        if (status == "Obtained") {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentRequired);
        }
        else {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentNotRequired);
        }
        this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentFormDismissed);
        return status;
    }
    _setAdSoundsMuted(muted) {
        this._cordova?.setAdSoundsMuted(muted);
    }
    // MARK: Banner ads
    async _loadBannerAd(adSize, maxWidth, maxHeight) {
        this._initialize();
        if (!this._cordova) {
            this._onCASLoaded({ format: "Banner" });
            return;
        }
        try {
            await this._cordova.bannerAd.load({
                adSize: AdSizeValue[adSize],
                maxWidth: maxWidth,
                maxHeight: maxHeight,
                autoReload: this._isAutoLoad.Banner,
                refreshInterval: this._autoRefreshBanner,
            });
        }
        catch (error) {
            // do nothing, event will be triggered
        }
    }
    _showBannerAd(position, offsetX, offsetY) {
        this._cordova?.bannerAd.show({
            position: position,
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
        if (!this._cordova) {
            this._onCASLoaded({ format: "MREC" });
            return;
        }
        try {
            await this._cordova.mrecAd.load({
                autoReload: this._isAutoLoad.Banner,
                refreshInterval: this._autoRefreshBanner,
            });
        }
        catch (error) {
            // do nothing, event will be triggered
        }
    }
    _showMRecAd(position, offsetX, offsetY) {
        this._cordova?.mrecAd.show({
            position: position,
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
        if (!this._cordova) {
            this._onCASLoaded({ format: "AppOpen" });
            return;
        }
        try {
            await this._cordova.appOpenAd.load({
                autoReload: this._isAutoLoad.AppOpen,
                autoShow: this._isAutoShow.AppOpen,
            });
        }
        catch (error) {
            // do nothing, event will be triggered
        }
    }
    async _showAppOpenAd() {
        if (!this._cordova) {
            let info = { format: "AppOpen" };
            this._onCASShowed(info);
            this._onCASDismissed(info);
            return;
        }
        try {
            await this._cordova.appOpenAd.show();
        }
        catch (error) {
            // do nothing, event will be triggered
        }
    }
    _destroyAppOpenAd() {
        this._cordova?.appOpenAd.destroy();
    }
    // MARK: Interstitial ads
    async _loadInterstitialAd() {
        this._initialize();
        if (!this._cordova) {
            this._onCASLoaded({ format: "Interstitial" });
            return;
        }
        try {
            await this._cordova.interstitialAd.load({
                autoReload: this._isAutoLoad.Interstitial,
                autoShow: this._isAutoShow.Interstitial,
                minInterval: this._minIntervalInterstitial,
            });
        }
        catch (error) {
            // do nothing, event will be triggered
        }
    }
    async _showInterstitialAd() {
        if (!this._cordova) {
            let info = { format: "Interstitial" };
            this._onCASShowed(info);
            this._onCASDismissed(info);
            return;
        }
        try {
            await this._cordova.interstitialAd.show();
        }
        catch (error) {
            // do nothing, event will be triggered
        }
    }
    _destroyInterstitialAd() {
        this._cordova?.interstitialAd.destroy();
    }
    // MARK: Rewarded ads
    async _loadRewardedAd() {
        this._initialize();
        if (!this._cordova) {
            this._onCASLoaded({ format: "Rewarded" });
            return;
        }
        try {
            await this._cordova.rewardedAd.load({
                autoReload: this._isAutoLoad.Rewarded,
            });
        }
        catch (error) {
            // do nothing, event will be triggered
        }
    }
    async _showRewardedAd() {
        var isUserEarnReward = false;
        if (!this._cordova) {
            isUserEarnReward = true;
            let info = { format: "Rewarded" };
            this._onCASShowed(info);
            this._onCASEarnReward(info);
            this._onCASDismissed(info);
        }
        else {
            try {
                let info = await this._cordova.rewardedAd.show();
                isUserEarnReward = info.isUserEarnReward;
            }
            catch (error) {
                // do nothing, event will be triggered
            }
        }
        if (!isUserEarnReward) {
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
        globalThis.document.removeEventListener("casai_ad_reward", this._onCASEarnReward, false);
    }
}
C3.Plugins.CASAI_MobileAds.Instance = CASMobileAdsInstance;
export {};
