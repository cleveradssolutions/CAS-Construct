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
const SDK = globalThis.SDK;
////////////////////////////////////////////
// The plugin ID is how Construct identifies different kinds of plugins.
// *** NEVER CHANGE THE PLUGIN ID! ***
// If you change the plugin ID after releasing the plugin, Construct will think it is an entirely different
// plugin and assume it is incompatible with the old one, and YOU WILL BREAK ALL EXISTING PROJECTS USING THE PLUGIN.
// Only the plugin name is displayed in the editor, so to rename your plugin change the name but NOT the ID.
// If you want to completely replace a plugin, make it deprecated (it will be hidden but old projects keep working),
// and create an entirely new plugin with a different plugin ID.
const PLUGIN_ID = "CASAI_MobileAds";
////////////////////////////////////////////
const PLUGIN_CATEGORY = "monetisation";
const CORDOVA_VERSION = "4.5.1";
const PLUGIN_CLASS = (SDK.Plugins.CASAI_MobileAds = class CASMobileAds extends SDK.IPluginBase {
    constructor() {
        super(PLUGIN_ID);
        SDK.Lang.PushContext("plugins." + PLUGIN_ID.toLowerCase());
        this._info.SetName(globalThis.lang(".name"));
        this._info.SetDescription(globalThis.lang(".description"));
        this._info.SetCategory(PLUGIN_CATEGORY);
        this._info.SetAuthor("Clever Ads Solutions LTD");
        this._info.SetHelpUrl(globalThis.lang(".help-url"));
        this._info.SetIsSingleGlobal(true);
        this._info.SetRuntimeModuleMainScript("c3runtime/main.js");
        SDK.Lang.PushContext(".properties");
        const casIdIOSProp = new SDK.PluginProperty("text", "ios-cas-id", "demo");
        const solutionsIOSProp = new SDK.PluginProperty("text", "ios-solutions", "-");
        const adaptersIOSProp = new SDK.PluginProperty("longtext", "ios-adapters", "-");
        const userTrackingUsageIOSProm = new SDK.PluginProperty("longtext", "ios-tracking-usage", "Your data will remain confidential and will only be used to provide you a better and personalised ad experience");
        const solutionsAndroidProp = new SDK.PluginProperty("text", "android-solutions", "-");
        const adaptersAndroidProp = new SDK.PluginProperty("longtext", "android-adapters", "-");
        const useAdIdAndroidProp = new SDK.PluginProperty("text", "android-use-ad-id", "true");
        this._info.SetProperties([
            new SDK.PluginProperty("group", "integration-ios"),
            casIdIOSProp,
            solutionsIOSProp,
            adaptersIOSProp,
            new SDK.PluginProperty("link", "ios-adapters-link", {
                linkCallback: () => window.open("https://github.com/cleveradssolutions/CAS-iOS/tree/master/Adapters#casai-mediation-adapters")
            }),
            userTrackingUsageIOSProm,
            new SDK.PluginProperty("group", "integration-android"),
            solutionsAndroidProp,
            adaptersAndroidProp,
            new SDK.PluginProperty("link", "android-adapters-link", {
                linkCallback: () => window.open("https://github.com/cleveradssolutions/CAS-Android/tree/master/Adapters#casai-mediation-adapters")
            }),
            useAdIdAndroidProp,
            new SDK.PluginProperty("group", "app-info"),
            new SDK.PluginProperty("combo", "target-audience", {
                initialValue: "unknown",
                items: ["unknown", "children", "not-children"],
            }),
            new SDK.PluginProperty("longtext", "app-keywords"),
            new SDK.PluginProperty("text", "app-content-url"),
            new SDK.PluginProperty("longtext", "mediation-extras"),
            new SDK.PluginProperty("group", "automation"),
            new SDK.PluginProperty("check", "auto-show-consent-form", true),
            new SDK.PluginProperty("check", "auto-load-banner", false),
            new SDK.PluginProperty("integer", "auto-refresh-banner", {
                initialValue: 30,
                minValue: 0,
                maxValue: 180,
            }),
            new SDK.PluginProperty("check", "auto-load-mrec", false),
            new SDK.PluginProperty("integer", "auto-refresh-mrec", {
                initialValue: 30,
                minValue: 0,
                maxValue: 180,
            }),
            new SDK.PluginProperty("check", "auto-load-appopen", false),
            new SDK.PluginProperty("check", "auto-show-appopen", false),
            new SDK.PluginProperty("check", "auto-load-inter", false),
            new SDK.PluginProperty("check", "auto-show-inter", false),
            new SDK.PluginProperty("integer", "min-interval-inter", {
                initialValue: 0,
                minValue: 0,
                maxValue: 360,
            }),
            new SDK.PluginProperty("check", "auto-load-reward", false),
            new SDK.PluginProperty("check", "collect-location", true),
            new SDK.PluginProperty("integer", "trial-ad-free-interval", {
                initialValue: 0,
                minValue: 0,
            }),
            new SDK.PluginProperty("group", "development"),
            new SDK.PluginProperty("check", "force-test-ads", false),
            new SDK.PluginProperty("longtext", "test-device-ids"),
            new SDK.PluginProperty("check", "debug-logging", false),
            new SDK.PluginProperty("combo", "debug-geography", {
                initialValue: "unknown",
                items: ["unknown", "eea", "us", "other"],
            }),
        ]);
        this._info.AddCordovaPluginReference({
            id: "cordova-plugin-casai",
            version: CORDOVA_VERSION,
            plugin: this,
            variables: [
                ["IOS_CAS_ID", casIdIOSProp],
                ["IOS_CAS_SOLUTIONS", solutionsIOSProp],
                ["IOS_CAS_ADAPTERS", adaptersIOSProp],
                ["IOS_USER_TRACKING_USAGE", userTrackingUsageIOSProm],
                ["ANDROID_CAS_SOLUTIONS", solutionsAndroidProp],
                ["ANDROID_CAS_ADAPTERS", adaptersAndroidProp],
                ["ANDROID_USE_AD_ID", useAdIdAndroidProp],
            ],
        });
        SDK.Lang.PopContext(); // .properties
        SDK.Lang.PopContext();
    }
});
PLUGIN_CLASS.Register(PLUGIN_ID, PLUGIN_CLASS);
export {};
