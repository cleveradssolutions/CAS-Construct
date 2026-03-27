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

// Same array from this._info.SetProperties()
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
}

const DebugGeogrpahyValues: PrivacyGeography[] = ["unknown", "eea", "us", "unregulated"];
const AudienceValues: AdAudience[] = [undefined, "children", "notchildren"];
const AdSizeValue: BannerAdSize[] = ["A", "I", "S", "L", "B"];
type AdInfo = AdInfoEvent | { format: AdFormat };

class CASMobileAdsInstance extends globalThis.ISDKInstanceBase {
    _isAutoLoad: FormatState;
    _isAutoShow: FormatState;
    _isLoaded: FormatState;

    _autoRefreshBanner?: number;
    _autoRefreshMREC?: number;
    _minIntervalInterstitial?: number;
    _debugGeography?: PrivacyGeography;
    _showConsentFormIfRequired: boolean;
    _isInitialized: boolean;
    _initializationStatus?: InitializationStatus;
    _errorMessage?: string;

    _targetAudience?: AdAudience;
    _forceTestAds?: boolean;
    _testDeviceIdsStr?: string;
    _mediationExtrasStr?: string;

    _cordova?: CASMobileAds;

    constructor() {
        super();

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
            if (props.length != InitParameter.count) {
                throw Error("The init parameters are not synchronized with the runtime code.");
            }
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

            let targetAudienceId = props[InitParameter.target_audience] as number;
            this._targetAudience = AudienceValues[targetAudienceId];
            this._forceTestAds = props[InitParameter.force_test_ads] as boolean;

            this._testDeviceIdsStr = props[InitParameter.test_device_ids] as string;
            this._mediationExtrasStr = props[InitParameter.mediation_extras] as string;

            if (this._cordova) {
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
        } else {
            console.log("CASMobileAds: Init properties not set");
        }

        globalThis.document.addEventListener("casai_ad_loaded", this._onCASLoaded, false);
        globalThis.document.addEventListener("casai_ad_load_failed", this._onCASFailedToLoad, false);
        globalThis.document.addEventListener("casai_ad_show_failed", this._onCASFailedToShow, false);
        globalThis.document.addEventListener("casai_ad_showed", this._onCASShowed, false);
        globalThis.document.addEventListener("casai_ad_clicked", this._onCASClicked, false);
        globalThis.document.addEventListener("casai_ad_dismissed", this._onCASDismissed, false);
        globalThis.document.addEventListener("casai_ad_reward", this._onCASEarnReward, false);

        // Required wait of Construct started to correct handle triggers.
        this.runtime.addEventListener("afterprojectstart", this._onConstructStarted);

        if (!this._cordova) {
            const cordovaEngine = globalThis.window.cordova;
            if (cordovaEngine) {
                throw new Error(
                    "CAS.AI Native plugin is not registered in the Construct app.\n" +
                        "Possible reasons:\n" +
                        "1. The app was built using Construct's cloud build service (Remote Preview / Server Build).\n" +
                        "   CAS.AI is not yet included in the cloud build whitelist.\n" +
                        "   To fix: export the Cordova project and build it locally instead.\n" +
                        "2. The CAS.AI addon was added before the Cordova platform installed.\n" +
                        "   To fix MacOS: rm -rf platforms plugins && cordova prepare\n" +
                        "   To Fix Windows: rmdir /s /q platforms & rmdir /s /q plugins & cordova prepare",
                );
            }
        }
    }

    // MARK: Initialization

    _initialize() {
        if (this._isInitialized === true) {
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

        var testDeviceIds = undefined;
        if (this._testDeviceIdsStr) {
            testDeviceIds = this._testDeviceIdsStr.split(/[ ,;]+/);
        }
        var mediationExtras = undefined;
        if (this._mediationExtrasStr) {
            try {
                mediationExtras = JSON.parse(this._mediationExtrasStr);
            } catch (e) {
                console.warn("CASMobileAds: failed to parse mediation extras JSON", this._mediationExtrasStr);
            }
        }

        this._cordova
            .initialize({
                targetAudience: this._targetAudience,
                showConsentFormIfRequired: this._showConsentFormIfRequired,
                forceTestAds: this._forceTestAds,
                testDeviceIds: testDeviceIds,
                debugGeography: this._debugGeography,
                mediationExtras: mediationExtras,
                overrideFramework: "Construct",
            })
            .then(this._onCASInitialized);
    }

    _handleConsentEvents(status: string | undefined, dismissed: boolean) {
        if (status == "Obtained") {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentRequired);
        } else {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentNotRequired);
        }
        if (dismissed) {
            this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnConsentFormDismissed);
        }
    }

    async _showConsentForm(ifRequired: boolean) {
        let status = await this._cordova?.showConsentFlow({
            ifRequired: ifRequired,
            debugGeography: this._debugGeography,
        });
        this._handleConsentEvents(status, true);
        return status;
    }

    _setAdSoundsMuted(muted: boolean) {
        this._cordova?.setAdSoundsMuted(muted);
    }

    // MARK: Event handlers
    // Event function must use lambdas to correct bind this context.

    _onConstructStarted = () => {
        if (this._initializationStatus) {
            this._onCASInitialized(this._initializationStatus);
        }

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
    };

    _onCASInitialized = (status: InitializationStatus) => {
        this._initializationStatus = status;

        if (status.isConsentRequired || status.consentFlowStatus === "Obtained") {
            this._handleConsentEvents("Obtained", this._showConsentFormIfRequired);
        } else {
            this._handleConsentEvents(status.consentFlowStatus, this._showConsentFormIfRequired);
        }
    };

    _onCASLoaded = (event: AdInfo) => {
        this._isLoaded[event.format] = true;

        let triggerName = "On" + event.format + "AdLoaded";
        let condition = C3.Plugins.CASAI_MobileAds.Cnds[triggerName];
        this._trigger(condition);
    };

    _onCASFailedToLoad = (event: AdErrorEvent) => {
        this._isLoaded[event.format] = false;
        this._errorMessage = event.message;
        let triggerName = "On" + event.format + "AdFailedToLoad";
        this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
    };

    _onCASFailedToShow = (event: AdErrorEvent) => {
        this._errorMessage = event.message;
        let triggerName = "On" + event.format + "AdFailedToShow";
        this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
    };

    _onCASShowed = (event: AdInfo) => {
        let triggerName = "On" + event.format + "AdShowed";
        this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
    };

    _onCASClicked = (event: AdInfo) => {
        let triggerName = "On" + event.format + "AdClicked";
        this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);
    };

    _onCASDismissed = (event: AdInfo) => {
        let triggerName = "On" + event.format + "AdDismissed";
        this._trigger(C3.Plugins.CASAI_MobileAds.Cnds[triggerName]);

        if (!this._cordova && this._isAutoLoad[event.format]) {
            setTimeout(() => this._onCASLoaded(event), 1000);
        }
    };

    _onCASEarnReward = (event: AdInfo) => {
        this._trigger(C3.Plugins.CASAI_MobileAds.Cnds.OnRewardedAdUserEarnedReward);
    };

    // MARK: Banner ads

    async _loadBannerAd(adSize: number, maxWidth: number, maxHeight: number) {
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
        } catch (error: any) {
            // do nothing, document event will be triggered
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
        if (!this._cordova) {
            this._onCASLoaded({ format: "MREC" });
            return;
        }
        try {
            await this._cordova.mrecAd.load({
                autoReload: this._isAutoLoad.Banner,
                refreshInterval: this._autoRefreshBanner,
            });
        } catch (error: any) {
            // do nothing, document event will be triggered
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
        if (!this._cordova) {
            this._onCASLoaded({ format: "AppOpen" });
            return;
        }
        try {
            await this._cordova.appOpenAd.load({
                autoReload: this._isAutoLoad.AppOpen,
                autoShow: this._isAutoShow.AppOpen,
            });
        } catch (error: any) {
            // do nothing, document event will be triggered
        }
    }

    async _showAppOpenAd() {
        if (!this._cordova) {
            let info: AdInfo = { format: "AppOpen" };
            this._onCASShowed(info);
            this._onCASDismissed(info);
            return;
        }
        try {
            await this._cordova.appOpenAd.show();
        } catch (error: any) {
            // do nothing, document event will be triggered
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
        } catch (error: any) {
            // do nothing, document event will be triggered
        }
    }

    async _showInterstitialAd() {
        if (!this._cordova) {
            let info: AdInfo = { format: "Interstitial" };
            this._onCASShowed(info);
            this._onCASDismissed(info);
            return;
        }
        try {
            await this._cordova.interstitialAd.show();
        } catch (error: any) {
            // do nothing, document event will be triggered
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
        } catch (error: any) {
            // do nothing, document event will be triggered
        }
    }

    async _showRewardedAd() {
        var isUserEarnReward = false;

        if (!this._cordova) {
            isUserEarnReward = true;
            let info: AdInfo = { format: "Rewarded" };
            this._onCASShowed(info);
            this._onCASEarnReward(info);
            this._onCASDismissed(info);
        } else {
            try {
                let info = await this._cordova.rewardedAd.show();
                isUserEarnReward = info.isUserEarnReward;
            } catch (error: any) {
                // do nothing, document event will be triggered
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

export type { CASMobileAdsInstance as SDKInstanceClass };
